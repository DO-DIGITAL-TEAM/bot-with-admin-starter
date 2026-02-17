import { BadRequestException, Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BotService } from 'src/bot/bot.service';
import { IFiltering } from 'src/common/decorators/filtering-params.decorator';
import { IPagination, PaginatedResource } from 'src/common/decorators/pagination-params.decorator';
import { ISorting } from 'src/common/decorators/sorting-params.decorator';
import { ErrorCode } from 'src/common/enums/error-code.enum';
import { DbTransactionFactory, saveWithTransactions } from 'src/database/transaction-factory';
import { In, Repository } from 'typeorm';
import { CreateLangDto } from '../dto/create-lang.dto';
import { UpdateLangDto } from '../dto/update-lang.dto';
import { Lang } from '../entities/lang.entity';
import { WordTranslation } from '../entities/word-translation.entity';
import { Word } from '../entities/word.entity';

@Injectable()
export class LangsService {
  private readonly _logger = new Logger(LangsService.name);

  constructor(
    @InjectRepository(Lang) private langRepository: Repository<Lang>,
    @InjectRepository(Word) private wordRepository: Repository<Word>,
    @InjectRepository(WordTranslation) private wordTranslationRepository: Repository<WordTranslation>,
    private transactionRunner: DbTransactionFactory,
    @Inject(forwardRef(() => BotService))
    private botService?: BotService,
  ) {}

  async findAll(): Promise<Lang[]> {
    return this.langRepository.find();
  }

  async findAllActive(): Promise<Lang[]> {
    return this.langRepository.find({
      where: { active: true },
      select: ['id', 'slug', 'title', 'dir', 'dateformat'],
    });
  }

  async findChunk(
    { limit, offset }: IPagination,
    sorting?: ISorting,
    filtering?: IFiltering,
  ): Promise<PaginatedResource<Lang>> {
    const [items, totalCount] = await this.langRepository.findAndCount({
      take: limit,
      skip: offset,
      order: sorting,
      where: filtering,
    });

    return { totalCount, items };
  }

  async findOne(id: number): Promise<Lang> {
    const lang = await this.langRepository.findOne({ where: { id } });

    if (!lang) {
      throw new NotFoundException(ErrorCode.AdminNotFound); // TODO: создать ErrorCode для Lang
    }

    return lang;
  }

  async create(dto: CreateLangDto): Promise<Lang> {
    const transactionalRunner = await this.transactionRunner.createTransaction();

    try {
      await transactionalRunner.startTransaction();

      const lang = await saveWithTransactions.call(
        this.langRepository,
        dto,
        transactionalRunner.transactionManager,
      );

      // Автоматически создаем записи переводов для всех существующих сущностей
      await this.rebuildMultilangEntities(lang.id, transactionalRunner.transactionManager);

      await transactionalRunner.commitTransaction();
      
      // Обновляем кэш бота после создания языка
      if (this.botService) {
        await this.botService.reloadWords().catch((err) => {
          this._logger.warn(`Failed to reload bot cache: ${err.message}`);
        });
      }
      
      return lang;
    } catch (error) {
      await transactionalRunner.rollbackTransaction();
      this._logger.error(error.message, error.stack);
      throw error;
    } finally {
      await transactionalRunner.releaseTransaction();
    }
  }

  async update(id: number, dto: UpdateLangDto): Promise<Lang> {
    const transactionalRunner = await this.transactionRunner.createTransaction();

    try {
      await transactionalRunner.startTransaction();

      const lang = await this.findOne(id);

      Object.assign(lang, dto);

      const updatedLang = await saveWithTransactions.call(
        this.langRepository,
        lang,
        transactionalRunner.transactionManager,
      );

      await transactionalRunner.commitTransaction();
      
      // Обновляем кэш бота после обновления языка (особенно если изменился active)
      if (this.botService) {
        await this.botService.reloadWords().catch((err) => {
          this._logger.warn(`Failed to reload bot cache: ${err.message}`);
        });
      }
      
      return updatedLang;
    } catch (error) {
      await transactionalRunner.rollbackTransaction();
      this._logger.error(error.message, error.stack);
      throw error;
    } finally {
      await transactionalRunner.releaseTransaction();
    }
  }

  async remove(id: number): Promise<void> {
    const transactionalRunner = await this.transactionRunner.createTransaction();

    try {
      await transactionalRunner.startTransaction();

      const lang = await this.findOne(id);

      if (lang.defended) {
        throw new BadRequestException('Cannot delete defended language');
      }

      await this.langRepository.remove(lang);

      await transactionalRunner.commitTransaction();
      
      // Обновляем кэш бота после удаления языка
      if (this.botService) {
        await this.botService.reloadWords().catch((err) => {
          this._logger.warn(`Failed to reload bot cache: ${err.message}`);
        });
      }
    } catch (error) {
      await transactionalRunner.rollbackTransaction();
      this._logger.error(error.message, error.stack);
      throw error;
    } finally {
      await transactionalRunner.releaseTransaction();
    }
  }

  async removeBulk(ids: number[]): Promise<void> {
    const transactionalRunner = await this.transactionRunner.createTransaction();

    try {
      await transactionalRunner.startTransaction();

      const langs = await this.langRepository.find({
        where: { id: In(ids) },
      });

      const defendedLangs = langs.filter((lang) => lang.defended);
      if (defendedLangs.length > 0) {
        throw new BadRequestException('Cannot delete defended languages');
      }

      await this.langRepository.remove(langs);

      await transactionalRunner.commitTransaction();
      
      // Обновляем кэш бота после массового удаления языков
      if (this.botService) {
        await this.botService.reloadWords().catch((err) => {
          this._logger.warn(`Failed to reload bot cache: ${err.message}`);
        });
      }
    } catch (error) {
      await transactionalRunner.rollbackTransaction();
      this._logger.error(error.message, error.stack);
      throw error;
    } finally {
      await transactionalRunner.releaseTransaction();
    }
  }

  /**
   * Создает записи переводов для всех существующих сущностей при создании нового языка
   */
  private async rebuildMultilangEntities(
    langId: number,
    transactionManager: any,
  ): Promise<void> {
    // Получаем все слова
    const words = await this.wordRepository.find();

    // Создаем записи переводов для каждого слова
    const translations = words.map((word) =>
      this.wordTranslationRepository.create({
        word_id: word.id,
        lang_id: langId,
        text: null,
      }),
    );

    if (translations.length > 0) {
      await transactionManager.save(WordTranslation, translations);
    }
  }
}

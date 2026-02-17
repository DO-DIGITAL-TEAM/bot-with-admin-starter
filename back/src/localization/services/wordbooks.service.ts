import { BadRequestException, Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BotService } from 'src/bot/bot.service';
import { IFiltering } from 'src/common/decorators/filtering-params.decorator';
import { IPagination, PaginatedResource } from 'src/common/decorators/pagination-params.decorator';
import { ISorting } from 'src/common/decorators/sorting-params.decorator';
import { ErrorCode } from 'src/common/enums/error-code.enum';
import { DbTransactionFactory, saveWithTransactions } from 'src/database/transaction-factory';
import { In, Repository } from 'typeorm';
import { CreateWordbookDto } from '../dto/create-wordbook.dto';
import { UpdateWordbookDto } from '../dto/update-wordbook.dto';
import { Lang } from '../entities/lang.entity';
import { WordTranslation } from '../entities/word-translation.entity';
import { Word } from '../entities/word.entity';
import { LoadTo, Wordbook } from '../entities/wordbook.entity';

@Injectable()
export class WordbooksService {
  private readonly _logger = new Logger(WordbooksService.name);

  constructor(
    @InjectRepository(Wordbook) private wordbookRepository: Repository<Wordbook>,
    @InjectRepository(Word) private wordRepository: Repository<Word>,
    @InjectRepository(WordTranslation) private wordTranslationRepository: Repository<WordTranslation>,
    private transactionRunner: DbTransactionFactory,
    @Inject(forwardRef(() => BotService))
    private botService?: BotService,
  ) {}

  async findChunk(
    { limit, offset }: IPagination,
    sorting?: ISorting,
    filtering?: IFiltering,
  ): Promise<PaginatedResource<Wordbook>> {
    const [items, totalCount] = await this.wordbookRepository.findAndCount({
      take: limit,
      skip: offset,
      order: sorting,
      where: filtering,
      relations: ['words'],
    });

    return { totalCount, items };
  }

  async findOne(id: number): Promise<Wordbook> {
    const wordbook = await this.wordbookRepository
      .createQueryBuilder('wordbook')
      .leftJoinAndSelect('wordbook.words', 'word')
      .leftJoinAndSelect('word.translations', 'translation')
      .leftJoinAndSelect('translation.lang', 'lang')
      .where('wordbook.id = :id', { id })
      .getOne();

    if (!wordbook) {
      throw new NotFoundException(ErrorCode.AdminNotFound); // TODO: создать ErrorCode для Wordbook
    }

    return wordbook;
  }

  async create(dto: CreateWordbookDto): Promise<Wordbook> {
    const transactionalRunner = await this.transactionRunner.createTransaction();

    try {
      await transactionalRunner.startTransaction();

      const wordbookData: Partial<Wordbook> = {
        name: dto.name,
        load_to: dto.load_to || LoadTo.All,
      };

      const wordbook = await saveWithTransactions.call(
        this.wordbookRepository,
        wordbookData,
        transactionalRunner.transactionManager,
      );

      // Создаем слова, если они переданы
      if (dto.words && dto.words.length > 0) {
        const words = dto.words.map((wordDto) =>
          this.wordRepository.create({
            ...wordDto,
            wordbook_id: wordbook.id,
          }),
        );

        await transactionalRunner.transactionManager.save(Word, words);

        // Создаем переводы для всех языков для каждого слова
        const langs = await transactionalRunner.transactionManager.find(Lang);
        const translations: WordTranslation[] = [];

        for (const word of words) {
          for (const lang of langs) {
            translations.push(
              this.wordTranslationRepository.create({
                word_id: word.id,
                lang_id: lang.id,
                text: null,
              }),
            );
          }
        }

        if (translations.length > 0) {
          await transactionalRunner.transactionManager.save(WordTranslation, translations);
        }
      }

      await transactionalRunner.commitTransaction();
      
      // Обновляем кэш бота после создания словаря
      if (this.botService) {
        await this.botService.reloadWords().catch((err) => {
          this._logger.warn(`Failed to reload bot cache: ${err.message}`);
        });
      }
      
      return this.findOne(wordbook.id);
    } catch (error) {
      await transactionalRunner.rollbackTransaction();
      this._logger.error(error.message, error.stack);
      throw error;
    } finally {
      await transactionalRunner.releaseTransaction();
    }
  }

  async update(id: number, dto: UpdateWordbookDto): Promise<Wordbook> {
    const transactionalRunner = await this.transactionRunner.createTransaction();

    try {
      await transactionalRunner.startTransaction();

      const wordbook = await this.findOne(id);

      if (wordbook.defended && dto.defended === false) {
        throw new BadRequestException('Cannot unprotect defended wordbook');
      }

      Object.assign(wordbook, {
        name: dto.name,
        load_to: dto.load_to,
        defended: dto.defended,
      });

      await saveWithTransactions.call(
        this.wordbookRepository,
        wordbook,
        transactionalRunner.transactionManager,
      );

      // Обновляем слова
      if (dto.words !== undefined) {
        // Удаляем слова без привязки
        await transactionalRunner.transactionManager.delete(Word, {
          wordbook_id: id,
        });

        // Создаем новые слова
        if (dto.words.length > 0) {
          const words = dto.words.map((wordDto) =>
            this.wordRepository.create({
              mark: wordDto.mark,
              wordbook_id: id,
            }),
          );

          const savedWords = await transactionalRunner.transactionManager.save(Word, words);

          // Получаем все языки для маппинга по slug
          const langs = await transactionalRunner.transactionManager.find(Lang);
          const langMapBySlug = new Map(langs.map((lang) => [lang.slug, lang]));

          // Создаем переводы
          const translations: WordTranslation[] = [];

          for (let i = 0; i < savedWords.length; i++) {
            const word = savedWords[i];
            const wordDto = dto.words[i];

            // Создаем маппинг переводов из DTO по slug
            const translationsMap = new Map<string, string | null>();
            if (wordDto.translations && wordDto.translations.length > 0) {
              for (const transDto of wordDto.translations) {
                translationsMap.set(transDto.lang_slug, transDto.text || null);
              }
            }

            // Создаем переводы для всех языков
            // Используем значение из DTO, если есть, иначе null
            for (const lang of langs) {
              const text = translationsMap.get(lang.slug) ?? null;
              translations.push(
                this.wordTranslationRepository.create({
                  word_id: word.id,
                  lang_id: lang.id,
                  text,
                }),
              );
            }
          }

          if (translations.length > 0) {
            await transactionalRunner.transactionManager.save(WordTranslation, translations);
          }
        }
      }

      await transactionalRunner.commitTransaction();
      
      // Обновляем кэш бота после обновления словаря
      if (this.botService) {
        await this.botService.reloadWords().catch((err) => {
          this._logger.warn(`Failed to reload bot cache: ${err.message}`);
        });
      }
      
      return this.findOne(id);
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

      const wordbook = await this.findOne(id);

      if (wordbook.defended) {
        throw new BadRequestException('Cannot delete defended wordbook');
      }

      await this.wordbookRepository.remove(wordbook);

      await transactionalRunner.commitTransaction();
      
      // Обновляем кэш бота после удаления словаря
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

      const wordbooks = await this.wordbookRepository.find({
        where: { id: In(ids) },
      });

      const defendedWordbooks = wordbooks.filter((wb) => wb.defended);
      if (defendedWordbooks.length > 0) {
        throw new BadRequestException('Cannot delete defended wordbooks');
      }

      await this.wordbookRepository.remove(wordbooks);

      await transactionalRunner.commitTransaction();
      
      // Обновляем кэш бота после массового удаления словарей
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
}

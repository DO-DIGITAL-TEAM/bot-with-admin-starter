import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Wordbook } from '../entities/wordbook.entity';
import { Lang } from '../entities/lang.entity';
import { Word } from '../entities/word.entity';
import { WordTranslation } from '../entities/word-translation.entity';
import { LoadTo } from '../entities/wordbook.entity';

export type IWords = {
  [wordbookName: string]: {
    [mark: string]: {
      [langSlug: string]: string;
    };
  };
};

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Wordbook) private wordbookRepository: Repository<Wordbook>,
    @InjectRepository(Lang) private langRepository: Repository<Lang>,
    @InjectRepository(Word) private wordRepository: Repository<Word>,
    @InjectRepository(WordTranslation) private wordTranslationRepository: Repository<WordTranslation>,
  ) {}

  /**
   * Получить все словари с переводами для бота
   * Загружает только словари где load_to IN ('all', 'bot')
   * Загружает только активные языки
   */
  async findAll(): Promise<IWords> {
    // Загружаем активные языки
    const langs = await this.langRepository.find({
      where: { active: true },
    });

    // Загружаем словари для бота
    const wordbooks = await this.wordbookRepository.find({
      where: { load_to: In([LoadTo.All, LoadTo.Bot]) },
      relations: ['words', 'words.translations', 'words.translations.lang'],
    });

    // Формируем структуру данных
    const result: IWords = {};

    for (const wordbook of wordbooks) {
      if (!wordbook.name) continue;

      result[wordbook.name] = {};

      for (const word of wordbook.words || []) {
        if (!word.mark) continue;

        result[wordbook.name][word.mark] = {};

        for (const translation of word.translations || []) {
          const langSlug = translation.lang?.slug;
          if (langSlug && translation.text) {
            result[wordbook.name][word.mark][langSlug] = translation.text;
          }
        }
      }
    }

    return result;
  }
}

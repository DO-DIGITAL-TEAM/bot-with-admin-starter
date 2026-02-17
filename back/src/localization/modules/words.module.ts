import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lang } from '../entities/lang.entity';
import { WordTranslation } from '../entities/word-translation.entity';
import { Word } from '../entities/word.entity';
import { Wordbook } from '../entities/wordbook.entity';
import { WordsService } from '../services/words.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wordbook, Lang, Word, WordTranslation]),
  ],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}

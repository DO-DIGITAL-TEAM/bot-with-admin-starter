import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordbooksService } from '../services/wordbooks.service';
import { WordbooksController } from '../controllers/wordbooks.controller';
import { Wordbook } from '../entities/wordbook.entity';
import { Word } from '../entities/word.entity';
import { WordTranslation } from '../entities/word-translation.entity';
import { Lang } from '../entities/lang.entity';
import { Admin } from 'src/admins/entities/admin.entity';
import { AdminsModule } from 'src/admins/admins.module';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { DbTransactionFactory } from 'src/database/transaction-factory';
import { BotModule } from 'src/bot/bot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wordbook, Word, WordTranslation, Lang, Admin]),
    CommonModule,
    AuthModule,
    AdminsModule,
    forwardRef(() => BotModule), // Для доступа к BotService
  ],
  controllers: [WordbooksController],
  providers: [WordbooksService, DbTransactionFactory],
  exports: [WordbooksService],
})
export class WordbooksModule {}

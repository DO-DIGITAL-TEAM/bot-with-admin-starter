import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/admins/entities/admin.entity';
import { AdminsModule } from 'src/admins/admins.module';
import { AuthModule } from 'src/auth/auth.module';
import { BotModule } from 'src/bot/bot.module';
import { CommonModule } from 'src/common/common.module';
import { DbTransactionFactory } from 'src/database/transaction-factory';
import { LangsController } from '../controllers/langs.controller';
import { Lang } from '../entities/lang.entity';
import { WordTranslation } from '../entities/word-translation.entity';
import { Word } from '../entities/word.entity';
import { LangsService } from '../services/langs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lang, Word, WordTranslation, Admin]),
    CommonModule,
    AuthModule,
    AdminsModule,
    forwardRef(() => BotModule),
  ],
  controllers: [LangsController],
  providers: [LangsService, DbTransactionFactory],
  exports: [LangsService],
})
export class LangsModule {}

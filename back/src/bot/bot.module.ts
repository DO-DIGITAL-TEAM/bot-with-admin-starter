import { Module, forwardRef } from '@nestjs/common';
import { BotService } from './bot.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from '../users/users.module';
import { LangsModule } from '../localization/modules/langs.module';
import { WordsModule } from '../localization/modules/words.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    UsersModule,
    forwardRef(() => LangsModule),
    WordsModule,
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}

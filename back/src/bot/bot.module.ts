import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    UsersModule,
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}

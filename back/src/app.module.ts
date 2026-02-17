import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { validate } from './config/env/validate';
import { DatabaseModule } from './database/database.module';
import { AdminsModule } from './admins/admins.module';
import { AuthModule } from './auth/auth.module';
import { AdminConsoleModule } from './admin-console/admin-console.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ validate }),
    CommonModule,
    DatabaseModule,
    AdminsModule,
    AuthModule,
    AdminConsoleModule,
    BotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

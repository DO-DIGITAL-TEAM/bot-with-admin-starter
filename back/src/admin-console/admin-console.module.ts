import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { AdminConsoleService } from './admin-console.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Password } from 'src/admins/entities/password.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DbTransactionFactory } from 'src/database/transaction-factory';
import { AdminsService } from 'src/admins/admins.service';
import { Admin } from 'src/admins/entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      Password,
    ]),
    ConsoleModule,
  ],
  providers: [
    AdminConsoleService,
    AdminsService,
    AuthService,
    JwtService,
    ConfigService,
    DbTransactionFactory,
  ]
})
export class AdminConsoleModule {}

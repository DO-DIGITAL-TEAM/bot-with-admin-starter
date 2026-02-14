import { Module, forwardRef } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Password } from './entities/password.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DbTransactionFactory } from 'src/database/transaction-factory';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      Password,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '30d' },
        };
      },
      inject: [ConfigService],
    }),
    forwardRef(() => AuthModule),
  ],
  controllers: [AdminsController],
  providers: [
    AdminsService,
    ConfigService,
    DbTransactionFactory,
  ],
  exports: [AdminsService]
})
export class AdminsModule { }

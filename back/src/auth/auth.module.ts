import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DbTransactionFactory } from 'src/database/transaction-factory';
import { AdminsModule } from 'src/admins/admins.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    forwardRef(() => AdminsModule),
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
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ConfigService,
    DbTransactionFactory,
    AuthGuard,
  ],
  exports: [AuthService, AuthGuard]
})
export class AuthModule {}

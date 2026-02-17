import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Password } from 'src/admins/entities/password.entity';
import { Admin } from 'src/admins/entities/admin.entity';
import { User } from 'src/users/entities/user.entity';
import { Lang } from 'src/localization/entities/lang.entity';
import { Wordbook } from 'src/localization/entities/wordbook.entity';
import { Word } from 'src/localization/entities/word.entity';
import { WordTranslation } from 'src/localization/entities/word-translation.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: false,
        logging: false,
        subscribers: [],
        entities: [
          Admin,
          Password,
          User,
          Lang,
          Wordbook,
          Word,
          WordTranslation,
        ]
      }),
    }),
  ],
})
export class DatabaseModule {}

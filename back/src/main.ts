import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import helmet from 'helmet';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    // logger: process.env.NODE_ENV === 'production'
    //   ? ['error', 'warn', 'log']
    //   : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT');
  const isDevelop = configService.get<string>('NODE_ENV');

  // Configure static file serving for uploads
  const uploadsPath = join(__dirname, '..', 'uploads');
  expressApp.use('/uploads', express.static(uploadsPath));

  const helmetConfig = helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          // "", "", "" // TODO: domains here
        ],
        imgSrc: [
          "'self'",
          "https: data: blob:"
        ],
        mediaSrc: [
          "'self'",
          "https: data: blob:"
        ],
      },
    },
    crossOriginResourcePolicy: {
      policy: isDevelop ? 'cross-origin' : 'same-site'
    }
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  app.useGlobalInterceptors(new ResponseInterceptor(reflector))
  app.enableCors();
  app.use(helmetConfig);

  await app.listen(PORT);
}

bootstrap();

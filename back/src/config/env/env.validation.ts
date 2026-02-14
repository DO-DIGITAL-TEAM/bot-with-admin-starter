import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, IsStrongPassword } from 'class-validator';

enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  // App config
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsNumber()
  @IsPositive()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  TELEGRAM_BOT_TOKEN: string;

  // Database config
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  @IsPositive()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 16,
    minSymbols: 0,
    minNumbers: 3,
    minLowercase: 4,
    minUppercase: 4,
  })
  DB_PASSWORD: string;
}

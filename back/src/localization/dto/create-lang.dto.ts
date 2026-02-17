import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { DateFormat } from '../entities/lang.entity';

export class CreateLangDto {
  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  dir?: string;

  @IsEnum(DateFormat)
  @IsOptional()
  dateformat?: DateFormat;

  @IsBoolean()
  @IsOptional()
  defended?: boolean;
}

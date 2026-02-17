import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateWordTranslationDto } from './update-word-translation.dto';

export class UpdateWordWithTranslationsDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  @IsOptional()
  mark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateWordTranslationDto)
  @IsOptional()
  translations?: UpdateWordTranslationDto[];
}

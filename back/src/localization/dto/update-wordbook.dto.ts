import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LoadTo } from '../entities/wordbook.entity';
import { UpdateWordWithTranslationsDto } from './update-word-with-translations.dto';

export class UpdateWordbookDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(LoadTo)
  @IsOptional()
  load_to?: LoadTo;

  @IsBoolean()
  @IsOptional()
  defended?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateWordWithTranslationsDto)
  @IsOptional()
  words?: UpdateWordWithTranslationsDto[];
}

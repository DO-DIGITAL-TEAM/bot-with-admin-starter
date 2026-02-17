import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LoadTo } from '../entities/wordbook.entity';
import { CreateWordDto } from './create-word.dto';

export class CreateWordbookDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(LoadTo)
  @IsOptional()
  load_to?: LoadTo;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWordDto)
  @IsOptional()
  words?: CreateWordDto[];
}

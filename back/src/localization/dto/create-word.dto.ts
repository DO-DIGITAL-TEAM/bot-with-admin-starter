import { IsString, IsOptional } from 'class-validator';

export class CreateWordDto {
  @IsString()
  @IsOptional()
  mark?: string;
}

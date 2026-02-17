import { IsString, IsOptional } from 'class-validator';

export class UpdateWordTranslationDto {
  @IsString()
  lang_slug: string;

  @IsString()
  @IsOptional()
  text?: string | null;
}

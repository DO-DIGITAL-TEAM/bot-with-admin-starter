import { z } from 'zod';
import { AbstractEntity } from './abstract';

export const WordTranslation = AbstractEntity.extend({
  word_id: z.number(),
  lang_id: z.number(),
  text: z.string().nullable().nullish(),
  word: z.any().optional(), // Используем z.any() для избежания циклических зависимостей
  lang: z.any().optional(), // Используем z.any() для избежания циклических зависимостей
});

export type WordTranslation = z.infer<typeof WordTranslation>;

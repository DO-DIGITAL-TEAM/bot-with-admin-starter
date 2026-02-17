import { z } from 'zod';
import { AbstractEntity } from './abstract';

export const Word = AbstractEntity.extend({
  wordbook_id: z.number().nullable().nullish(),
  mark: z.string().nullable().nullish(),
  translations: z.array(z.any()).optional(), // Используем z.any() для избежания циклических зависимостей
});

export const WordDto = Word.omit({
  id: true,
  created_at: true,
  updated_at: true,
  translations: true,
}).partial();

export type Word = z.infer<typeof Word>;
export type WordDto = z.infer<typeof WordDto>;

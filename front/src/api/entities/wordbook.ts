import { z } from 'zod';
import { AbstractEntity } from './abstract';
import { booleanSchema } from '@/utilities/boolean';

export enum LoadTo {
  All = 'all',
  Bot = 'bot',
}

export const Wordbook = AbstractEntity.extend({
  name: z.string().nullable().nullish(),
  load_to: z.nativeEnum(LoadTo).default(LoadTo.All),
  defended: booleanSchema,
  words: z.array(z.any()).optional(), // Используем z.any() для избежания циклических зависимостей
});

export const WordbookDto = Wordbook.omit({
  id: true,
  created_at: true,
  updated_at: true,
  words: true,
}).extend({
  words: z.array(z.object({
    mark: z.string().optional().nullable(),
    translations: z.array(z.object({
      lang_slug: z.string(),
      text: z.string().nullable().optional(),
    })).optional(),
  })).optional(),
}).partial().extend({
  id: z.number().optional(), // Для update
});

export type Wordbook = z.infer<typeof Wordbook>;
export type WordbookDto = z.infer<typeof WordbookDto>;

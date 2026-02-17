import { z } from 'zod';
import { AbstractEntity } from './abstract';
import { booleanSchema } from '@/utilities/boolean';

export enum DateFormat {
  En = 'en',
  Ru = 'ru',
}

export const Lang = AbstractEntity.extend({
  slug: z.string().nullable().nullish(),
  title: z.string().nullable().nullish(),
  active: booleanSchema,
  dir: z.string().default('ltr'),
  dateformat: z.nativeEnum(DateFormat).default(DateFormat.En),
  defended: booleanSchema,
});

export const LangDto = Lang.omit({
  created_at: true,
  updated_at: true,
}).partial().extend({
  id: z.number().optional(), // Для update
});

export type Lang = z.infer<typeof Lang>;
export type LangDto = z.infer<typeof LangDto>;

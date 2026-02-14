import { z } from 'zod';
import { AbstractEntity } from './abstract';
import { booleanSchema } from '@/utilities/boolean';

export enum Roles {
  SuperAdmin = 'superadmin',
  Admin = 'admin',
};

export const Admin = AbstractEntity.extend({
  username: z.string().min(1),
  email: z.string().email(),
  image: z.string().url().nullable().nullish(),
  is_active: booleanSchema,
  role: z.nativeEnum(Roles),
});

export const AdminDto = Admin.extend({
  // password: PasswordSchema,
  password: z.string().min(1),
}).omit({
  id: true,
  image: true,
  created_at: true,
  updated_at: true,
}).partial();

export type Admin = z.infer<typeof Admin>;
export type AdminDto = z.infer<typeof AdminDto>;


import { z } from 'zod';

export const AbstractEntity = z.object({
  id: z.number(),
  // created_at: z.date(),
  // updated_at: z.date(),
  created_at: z.string(),
  updated_at: z.string(),
});


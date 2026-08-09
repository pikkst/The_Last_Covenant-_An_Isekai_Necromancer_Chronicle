import { z } from 'zod';

export const ContentVersionSchema = z.object({
  id: z.string().uuid(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
});

export type ContentVersion = z.infer<typeof ContentVersionSchema>;

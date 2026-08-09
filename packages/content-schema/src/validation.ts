import { z } from 'zod';
import { Identifier, Version } from '@tlc/contracts';

export const ContentVersionSchema = z.object({
  id: z.string().uuid().transform(Identifier.create),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).transform(Version.create),
});

export type ContentVersion = z.infer<typeof ContentVersionSchema>;

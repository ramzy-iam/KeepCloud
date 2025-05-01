import { z } from 'zod';

export const filterSchema = z.object({
  location: z
    .enum(['my-storage', 'shared-with-me', 'others', 'anywhere'])
    .default('anywhere')
    .optional(),
  inTrash: z.boolean().default(false).optional(),
  type: z
    .enum(['all', 'folder', 'file', 'image', 'video'])
    .default('all')
    .optional(),
  owner: z
    .enum(['by-me', 'not-by-me', 'specific', 'any'])
    .default('any')
    .optional(),
  ownerId: z.string().optional(),
  sharedWith: z.string().optional(),
  name: z.string().optional(),
  modifiedDate: z.string().optional(),
});

export type FilterFormData = z.infer<typeof filterSchema>;

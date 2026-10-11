import { z } from 'zod';

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'El comentario no puede estar vacío')
    .max(1000, 'El comentario no puede superar los 1.000 caracteres'),
});

export type CommentFormData = z.infer<typeof commentSchema>;


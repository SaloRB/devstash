import { z } from 'zod'

export const nullableString = () =>
  z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => v || null)

export const nullableUrl = () =>
  z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => v || null)
    .refine((v) => !v || z.string().url().safeParse(v).success, 'Invalid URL')

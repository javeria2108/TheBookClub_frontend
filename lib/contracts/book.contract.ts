import { z } from "zod";

export const BookSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  authors: z.array(z.string()),
  coverImage: z.string().url().nullable(),
  isbn10: z.string().nullable(),
  isbn13: z.string().nullable(),
  publisher: z.string().nullable(),
  publishedDate: z.string().nullable(),
  pageCount: z.number().int().positive().nullable(),
  language: z.string().nullable(),
  externalSource: z.string().nullable(),
  externalId: z.string().nullable(),
  previewUrl: z.string().url().nullable(),
  infoUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const BookDiscoveryResultSchema = z.object({
  source: z.enum(["BOOKCIRCLE", "GOOGLE_BOOKS"]),
  isSaved: z.boolean(),
  bookId: z.string().uuid().nullable(),
  googleBooksId: z.string().min(1).nullable(),
  title: z.string().min(1),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  authors: z.array(z.string()),
  coverImage: z.string().url().nullable(),
  isbn10: z.string().nullable(),
  isbn13: z.string().nullable(),
  publisher: z.string().nullable(),
  publishedDate: z.string().nullable(),
  publishedYear: z.string().nullable(),
  pageCount: z.number().int().positive().nullable(),
  language: z.string().nullable(),
  previewUrl: z.string().url().nullable(),
  infoUrl: z.string().url().nullable(),
});

export const SearchBooksResponseSchema = z.object({
  results: z.array(BookDiscoveryResultSchema),
});

export const BookResponseSchema = z.object({
  book: BookSchema,
});

export const ImportBookPayloadSchema = z.object({
  googleBooksId: z.string().trim().min(1),
});

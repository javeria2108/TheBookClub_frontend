import { getJson, postJson } from "@/lib/api";
import {
  BookResponseSchema,
  ImportBookPayloadSchema,
  SearchBooksResponseSchema,
} from "@/lib/contracts/book.contract";
import type {
  Book,
  BookResponse,
  ImportBookPayload,
  SearchBooksResponse,
} from "@/lib/types";

export async function searchGoogleBooks(query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const params = new URLSearchParams({ q: trimmedQuery });
  const data = await getJson<SearchBooksResponse>(
    `/books/search?${params.toString()}`,
  );

  return SearchBooksResponseSchema.parse(data).results;
}

export async function importGoogleBook(googleBooksId: string): Promise<Book> {
  const payload: ImportBookPayload = ImportBookPayloadSchema.parse({
    googleBooksId,
  });

  const data = await postJson<BookResponse, ImportBookPayload>(
    "/books/import",
    payload,
  );

  return BookResponseSchema.parse(data).book;
}

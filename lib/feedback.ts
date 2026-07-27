import { postJson } from "@/lib/api";

export type FeedbackCategory = "GENERAL" | "BUG" | "FEATURE" | "SAFETY";

export type FeedbackPayload = {
  category: FeedbackCategory;
  message: string;
  contactEmail?: string;
};

export async function submitFeedback(payload: FeedbackPayload) {
  return postJson<{ message: string }, FeedbackPayload>("/feedback", payload);
}

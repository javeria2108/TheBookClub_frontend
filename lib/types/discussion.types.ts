import { z } from "zod";

import {
  CreateDiscussionPostPayloadSchema,
  CreateDiscussionTopicPayloadSchema,
  DiscussionPostPageSchema,
  DiscussionPostResponseSchema,
  DiscussionPostSchema,
  DiscussionTopicPageSchema,
  DiscussionTopicResponseSchema,
  DiscussionTopicSchema,
  DiscussionTopicTypeSchema,
  UpdateDiscussionPostPayloadSchema,
  UpdateDiscussionTopicPayloadSchema,
} from "@/lib/contracts/discussion.contract";

export type DiscussionTopicType = z.infer<typeof DiscussionTopicTypeSchema>;
export type DiscussionTopic = z.infer<typeof DiscussionTopicSchema>;
export type DiscussionPost = z.infer<typeof DiscussionPostSchema>;
export type DiscussionTopicPage = z.infer<typeof DiscussionTopicPageSchema>;
export type DiscussionPostPage = z.infer<typeof DiscussionPostPageSchema>;
export type DiscussionTopicResponse = z.infer<
  typeof DiscussionTopicResponseSchema
>;
export type DiscussionPostResponse = z.infer<
  typeof DiscussionPostResponseSchema
>;
export type CreateDiscussionTopicPayload = z.infer<
  typeof CreateDiscussionTopicPayloadSchema
>;
export type UpdateDiscussionTopicPayload = z.infer<
  typeof UpdateDiscussionTopicPayloadSchema
>;
export type CreateDiscussionPostPayload = z.infer<
  typeof CreateDiscussionPostPayloadSchema
>;
export type UpdateDiscussionPostPayload = z.infer<
  typeof UpdateDiscussionPostPayloadSchema
>;

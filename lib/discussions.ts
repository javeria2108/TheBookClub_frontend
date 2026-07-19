import {
  CreateDiscussionPostPayloadSchema,
  CreateDiscussionTopicPayloadSchema,
  DiscussionPostPageSchema,
  DiscussionPostResponseSchema,
  DiscussionTopicPageSchema,
  DiscussionTopicResponseSchema,
  UpdateDiscussionPostPayloadSchema,
  UpdateDiscussionTopicPayloadSchema,
} from "@/lib/contracts/discussion.contract";
import { deleteJson, getJson, patchJson, postJson } from "@/lib/api";
import type {
  CreateDiscussionPostPayload,
  CreateDiscussionTopicPayload,
  DiscussionPost,
  DiscussionPostPage,
  DiscussionTopic,
  DiscussionTopicPage,
  UpdateDiscussionPostPayload,
  UpdateDiscussionTopicPayload,
} from "@/lib/types";

export type DiscussionTopicFilter =
  | "ALL"
  | "CURRENT_READING"
  | "THIS_WEEK"
  | "GENERAL"
  | "PINNED";

export async function getDiscussionTopics(
  clubId: string,
  filter: DiscussionTopicFilter = "ALL",
): Promise<DiscussionTopicPage> {
  const data = await getJson<DiscussionTopicPage>(
    `/clubs/${clubId}/discussions/topics?filter=${filter}`,
  );
  return DiscussionTopicPageSchema.parse(data);
}

export async function createDiscussionTopic(
  clubId: string,
  input: CreateDiscussionTopicPayload,
): Promise<DiscussionTopic> {
  const payload = CreateDiscussionTopicPayloadSchema.parse(input);
  const data = await postJson<{ topic: DiscussionTopic }, CreateDiscussionTopicPayload>(
    `/clubs/${clubId}/discussions/topics`,
    payload,
  );
  return DiscussionTopicResponseSchema.parse(data).topic;
}

export async function updateDiscussionTopic(
  clubId: string,
  topicId: string,
  input: UpdateDiscussionTopicPayload,
): Promise<DiscussionTopic> {
  const payload = UpdateDiscussionTopicPayloadSchema.parse(input);
  const data = await patchJson<{ topic: DiscussionTopic }, UpdateDiscussionTopicPayload>(
    `/clubs/${clubId}/discussions/topics/${topicId}`,
    payload,
  );
  return DiscussionTopicResponseSchema.parse(data).topic;
}

export async function deleteDiscussionTopic(
  clubId: string,
  topicId: string,
): Promise<void> {
  await deleteJson<{ message: string }>(
    `/clubs/${clubId}/discussions/topics/${topicId}`,
  );
}

export async function getDiscussionPosts(
  clubId: string,
  topicId: string,
): Promise<DiscussionPostPage> {
  const data = await getJson<DiscussionPostPage>(
    `/clubs/${clubId}/discussions/topics/${topicId}/posts`,
  );
  return DiscussionPostPageSchema.parse(data);
}

export async function createDiscussionPost(
  clubId: string,
  topicId: string,
  input: CreateDiscussionPostPayload,
): Promise<DiscussionPost> {
  const payload = CreateDiscussionPostPayloadSchema.parse(input);
  const data = await postJson<{ post: DiscussionPost }, CreateDiscussionPostPayload>(
    `/clubs/${clubId}/discussions/topics/${topicId}/posts`,
    payload,
  );
  return DiscussionPostResponseSchema.parse(data).post;
}

export async function updateDiscussionPost(
  clubId: string,
  postId: string,
  input: UpdateDiscussionPostPayload,
): Promise<DiscussionPost> {
  const payload = UpdateDiscussionPostPayloadSchema.parse(input);
  const data = await patchJson<{ post: DiscussionPost }, UpdateDiscussionPostPayload>(
    `/clubs/${clubId}/discussions/posts/${postId}`,
    payload,
  );
  return DiscussionPostResponseSchema.parse(data).post;
}

export async function deleteDiscussionPost(
  clubId: string,
  postId: string,
): Promise<void> {
  await deleteJson<{ message: string }>(
    `/clubs/${clubId}/discussions/posts/${postId}`,
  );
}

"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronRight,
  Lock,
  MessageSquareText,
  Pin,
  Plus,
  RefreshCw,
  Send,
} from "lucide-react";

import { EmptyState, ErrorState, SectionHeader, StatusBadge } from "@/components/ui/app-primitives";
import { useToast } from "@/components/ui/use-toast";
import {
  createDiscussionPost,
  createDiscussionTopic,
  deleteDiscussionPost,
  deleteDiscussionTopic,
  getDiscussionPosts,
  getDiscussionTopics,
  updateDiscussionTopic,
  type DiscussionTopicFilter,
} from "@/lib/discussions";
import { getReadingTargets } from "@/lib/reading-cycles";
import type { Club, DiscussionPost, DiscussionTopic, ReadingCycle, ReadingTarget } from "@/lib/types";

type StructuredDiscussionPanelProps = {
  club: Club;
  currentCycle: ReadingCycle | null;
};

const TOPIC_FILTERS: Array<{ label: string; value: DiscussionTopicFilter }> = [
  { label: "All", value: "ALL" },
  { label: "Current Reading", value: "CURRENT_READING" },
  { label: "This Week", value: "THIS_WEEK" },
  { label: "General", value: "GENERAL" },
  { label: "Pinned", value: "PINNED" },
];

const ChatWindow = dynamic(() => import("@/components/clubs/ChatWindow"), {
  loading: () => (
    <div className="app-surface min-h-[420px] animate-pulse rounded-2xl" />
  ),
});

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getTopicContext(topic: DiscussionTopic): string {
  if (topic.readingTarget) return topic.readingTarget.rangeLabel;
  if (topic.readingCycle) return topic.readingCycle.bookTitle;
  if (topic.topicType === "PROMPT") return "Prompt";
  return "General topic";
}

function canModerate(role: Club["memberRole"]): boolean {
  return role === "OWNER" || role === "MODERATOR";
}

export function StructuredDiscussionPanel({
  club,
  currentCycle,
}: StructuredDiscussionPanelProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"topics" | "chat">("topics");
  const [filter, setFilter] = useState<DiscussionTopicFilter>("ALL");
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [targets, setTargets] = useState<ReadingTarget[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState("");
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [topicType, setTopicType] = useState<DiscussionTopic["topicType"]>("GENERAL");
  const [readingTargetId, setReadingTargetId] = useState("");
  const [content, setContent] = useState("");
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const moderator = canModerate(club.memberRole);
  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) ?? null,
    [selectedTopicId, topics],
  );

  const loadTopics = useCallback(async () => {
    try {
      setIsLoadingTopics(true);
      setError("");
      const page = await getDiscussionTopics(club.id, filter);
      setTopics(page.items);
      setSelectedTopicId((current) =>
        current && page.items.some((topic) => topic.id === current)
          ? current
          : page.items[0]?.id ?? null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load topics");
    } finally {
      setIsLoadingTopics(false);
    }
  }, [club.id, filter]);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  useEffect(() => {
    if (!moderator || !currentCycle) return;

    getReadingTargets(club.id, currentCycle.id)
      .then((response) => setTargets(response.targets))
      .catch(() => setTargets([]));
  }, [club.id, currentCycle, moderator]);

  const loadPosts = useCallback(async () => {
    if (!selectedTopicId) {
      setPosts([]);
      return;
    }

    try {
      setIsLoadingPosts(true);
      const page = await getDiscussionPosts(club.id, selectedTopicId);
      setPosts(page.items);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unable to load replies",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsLoadingPosts(false);
    }
  }, [club.id, selectedTopicId, toast]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleCreateTopic = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      const topic = await createDiscussionTopic(club.id, {
        title,
        prompt: prompt || null,
        topicType,
        readingCycleId:
          topicType === "READING_CYCLE" || topicType === "PROMPT"
            ? currentCycle?.id ?? null
            : null,
        readingTargetId: topicType === "READING_TARGET" ? readingTargetId : null,
      });
      setTopics((current) => [topic, ...current]);
      setSelectedTopicId(topic.id);
      setNewTopicOpen(false);
      setTitle("");
      setPrompt("");
      setTopicType("GENERAL");
      setReadingTargetId("");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unable to start discussion",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTopic) return;

    try {
      setIsSaving(true);
      const post = await createDiscussionPost(club.id, selectedTopic.id, {
        content,
        parentPostId: replyParentId,
      });
      setPosts((current) => [...current, post]);
      setContent("");
      setReplyParentId(null);
      await loadTopics();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unable to add reply",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (post: DiscussionPost) => {
    await deleteDiscussionPost(club.id, post.id);
    await loadPosts();
    await loadTopics();
  };

  const handleDeleteTopic = async (topic: DiscussionTopic) => {
    await deleteDiscussionTopic(club.id, topic.id);
    setTopics((current) => current.filter((item) => item.id !== topic.id));
    setSelectedTopicId(null);
  };

  const handleToggleTopic = async (
    topic: DiscussionTopic,
    key: "isPinned" | "isLocked",
  ) => {
    const updated = await updateDiscussionTopic(club.id, topic.id, {
      [key]: !topic[key],
    });
    setTopics((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  return (
    <section className="space-y-4">
      <div
        className="flex max-w-full gap-2 overflow-x-auto rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface)] p-1"
        role="tablist"
        aria-label="Discussion sections"
      >
        {[
          { label: "Topics", value: "topics" as const },
          { label: "General Chat", value: "chat" as const },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={mode === item.value}
            onClick={() => setMode(item.value)}
            className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold ${
              mode === item.value
                ? "bg-[var(--app-accent-teal-soft)] text-[var(--app-accent-gold-hover)]"
                : "text-[var(--app-text-secondary)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "chat" ? (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <ChatWindow clubId={club.id} roomId={`${club.id}-general`} />
          <aside className="app-surface h-fit rounded-2xl p-5">
            <SectionHeader title="Room context" />
            <p className="text-sm leading-6 text-[var(--app-text-secondary)]">
              General chat stays realtime and informal. Use Topics for focused,
              persistent reading conversations.
            </p>
          </aside>
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="app-surface min-w-0 overflow-hidden rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <SectionHeader title="Topics" />
              <button
                type="button"
                onClick={() => setNewTopicOpen((value) => !value)}
                className="app-button-secondary min-h-10 px-3"
              >
                <Plus className="h-4 w-4" />
                Start
              </button>
            </div>

            <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1">
              {TOPIC_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`min-h-10 shrink-0 rounded-full border px-3 text-xs font-semibold ${
                    filter === item.value
                      ? "border-[var(--app-accent-gold)] bg-[var(--app-accent-teal-soft)] text-[var(--app-accent-gold-hover)]"
                      : "border-[var(--app-border-subtle)] text-[var(--app-text-secondary)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {newTopicOpen ? (
              <form onSubmit={handleCreateTopic} className="mt-4 space-y-3 rounded-xl border border-[var(--app-border-subtle)] p-3">
                <label className="block text-sm font-semibold">
                  Title
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="app-input mt-1"
                    maxLength={140}
                    required
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Prompt
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    className="app-input mt-1 min-h-24"
                    maxLength={1200}
                  />
                </label>
                {moderator ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <label className="block text-sm font-semibold">
                      Topic type
                      <select
                        value={topicType}
                        onChange={(event) =>
                          setTopicType(event.target.value as DiscussionTopic["topicType"])
                        }
                        className="app-input mt-1"
                      >
                        <option value="GENERAL">General topic</option>
                        {currentCycle ? <option value="READING_CYCLE">Current reading</option> : null}
                        {currentCycle ? <option value="PROMPT">Prompt</option> : null}
                        {targets.length > 0 ? <option value="READING_TARGET">This week</option> : null}
                      </select>
                    </label>
                    {topicType === "READING_TARGET" ? (
                      <label className="block text-sm font-semibold">
                        Reading target
                        <select
                          value={readingTargetId}
                          onChange={(event) => setReadingTargetId(event.target.value)}
                          className="app-input mt-1"
                          required
                        >
                          <option value="">Choose target</option>
                          {targets.map((target) => (
                            <option key={target.id} value={target.id}>
                              {target.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </div>
                ) : null}
                <button type="submit" disabled={isSaving} className="app-button-primary w-full">
                  <MessageSquareText className="h-4 w-4" />
                  Start discussion
                </button>
              </form>
            ) : null}

            {error ? (
              <ErrorState
                title="Unable to load topics"
                description={error}
                action={
                  <button type="button" onClick={() => void loadTopics()} className="app-button-secondary">
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>
                }
              />
            ) : null}

            <div className="mt-4 space-y-2">
              {isLoadingTopics ? (
                <div className="h-32 animate-pulse rounded-xl bg-[var(--app-surface-subtle)]" />
              ) : topics.length === 0 ? (
                <EmptyState title="No topics yet" description="Start a focused discussion for this club." />
              ) : (
                topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full min-w-0 rounded-xl border p-3 text-left transition ${
                      selectedTopicId === topic.id
                        ? "border-[var(--app-accent-gold)] bg-[var(--app-accent-teal-soft)]"
                        : "border-[var(--app-border-subtle)] hover:border-[var(--app-accent-gold-muted)]"
                    }`}
                  >
                    <span className="flex min-w-0 items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="line-clamp-2 break-words font-serif text-lg leading-tight">
                          {topic.title}
                        </span>
                        <span className="mt-1 block text-xs text-[var(--app-accent-gold)]">
                          {getTopicContext(topic)}
                        </span>
                      </span>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--app-accent-gold)]" />
                    </span>
                    {topic.prompt ? (
                      <span className="mt-2 line-clamp-2 block text-sm leading-5 text-[var(--app-text-secondary)]">
                        {topic.prompt}
                      </span>
                    ) : null}
                    <span className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--app-text-muted)]">
                      {topic.isPinned ? <span className="inline-flex items-center gap-1"><Pin className="h-3 w-3" />Pinned</span> : null}
                      {topic.isLocked ? <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" />Locked</span> : null}
                      <span>{topic.postCount} replies</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <article className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
            {selectedTopic ? (
              <div className="min-w-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone="teal">{getTopicContext(selectedTopic)}</StatusBadge>
                      {selectedTopic.isLocked ? <StatusBadge tone="gold">Locked</StatusBadge> : null}
                    </div>
                    <h2 className="mt-3 break-words font-serif text-2xl leading-tight sm:text-3xl">
                      {selectedTopic.title}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                      Started by {selectedTopic.createdBy.displayName} · {formatDateTime(selectedTopic.createdAt)}
                    </p>
                  </div>
                  {selectedTopic.canModerate || selectedTopic.canDelete ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTopic.canModerate ? (
                        <>
                          <button type="button" onClick={() => void handleToggleTopic(selectedTopic, "isPinned")} className="app-button-secondary min-h-10 px-3">
                            {selectedTopic.isPinned ? "Unpin" : "Pin"}
                          </button>
                          <button type="button" onClick={() => void handleToggleTopic(selectedTopic, "isLocked")} className="app-button-secondary min-h-10 px-3">
                            {selectedTopic.isLocked ? "Unlock" : "Lock"}
                          </button>
                        </>
                      ) : null}
                      {selectedTopic.canDelete ? (
                        <button type="button" onClick={() => void handleDeleteTopic(selectedTopic)} className="app-button-secondary min-h-10 px-3">
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {selectedTopic.prompt ? (
                  <p className="mt-5 whitespace-pre-line break-words rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-subtle)] p-4 text-sm leading-6 text-[var(--app-text-secondary)]">
                    {selectedTopic.prompt}
                  </p>
                ) : null}

                <div className="mt-6 space-y-3">
                  {isLoadingPosts ? (
                    <div className="h-28 animate-pulse rounded-xl bg-[var(--app-surface-subtle)]" />
                  ) : posts.length === 0 ? (
                    <EmptyState title="No replies yet" description="Be the first to join this discussion." />
                  ) : (
                    posts.map((post) => (
                      <div
                        key={post.id}
                        className={`rounded-xl border border-[var(--app-border-subtle)] p-4 ${
                          post.parentPostId ? "ml-4 sm:ml-8" : ""
                        }`}
                      >
                        {post.isDeleted ? (
                          <p className="text-sm italic text-[var(--app-text-muted)]">
                            This reply was removed.
                          </p>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold">
                                {post.author?.displayName ?? "Reader"}
                                {post.author ? <span className="ml-2 text-xs text-[var(--app-text-muted)]">{post.author.role}</span> : null}
                              </p>
                              <p className="text-xs text-[var(--app-text-muted)]">
                                {formatDateTime(post.createdAt)}
                              </p>
                            </div>
                            <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-[var(--app-text-secondary)]">
                              {post.content}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {!post.parentPostId ? (
                                <button type="button" onClick={() => setReplyParentId(post.id)} className="text-xs font-semibold text-[var(--app-accent-gold)]">
                                  Reply
                                </button>
                              ) : null}
                              {post.canDelete ? (
                                <button type="button" onClick={() => void handleDeletePost(post)} className="text-xs font-semibold text-[var(--app-text-muted)]">
                                  Remove
                                </button>
                              ) : null}
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {selectedTopic.isLocked ? (
                  <p className="mt-5 rounded-xl border border-[var(--app-border-subtle)] p-4 text-sm text-[var(--app-text-secondary)]" aria-live="polite">
                    This discussion is locked.
                  </p>
                ) : (
                  <form onSubmit={handleCreatePost} className="mt-5 space-y-3">
                    {replyParentId ? (
                      <button type="button" onClick={() => setReplyParentId(null)} className="text-sm font-semibold text-[var(--app-accent-gold)]">
                        Replying to a comment · cancel
                      </button>
                    ) : null}
                    <label className="block text-sm font-semibold">
                      Reply
                      <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        className="app-input mt-1 min-h-28"
                        maxLength={4000}
                        required
                      />
                    </label>
                    <button type="submit" disabled={isSaving} className="app-button-primary w-full sm:w-auto">
                      <Send className="h-4 w-4" />
                      Join discussion
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <EmptyState title="Choose a topic" description="Focused discussions will appear here." />
            )}
          </article>
        </div>
      )}
    </section>
  );
}

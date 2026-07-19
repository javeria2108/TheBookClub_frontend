"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";

import { EmptyState, InlineLink, SectionHeader } from "@/components/ui/app-primitives";
import { getDiscussionTopics } from "@/lib/discussions";
import type { DiscussionTopic } from "@/lib/types";

type RelatedDiscussionsPreviewProps = {
  clubId: string;
  cycleId: string;
};

export function RelatedDiscussionsPreview({
  clubId,
  cycleId,
}: RelatedDiscussionsPreviewProps) {
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getDiscussionTopics(clubId, "THIS_WEEK")
      .then((page) => {
        if (isMounted) setTopics(page.items.slice(0, 2));
      })
      .catch(() => {
        if (isMounted) setTopics([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [clubId, cycleId]);

  return (
    <section className="app-surface min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader title="Discuss this week" />
        <InlineLink href={`/clubs/${clubId}/discussion`}>Open Discussion</InlineLink>
      </div>

      {isLoading ? (
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-[var(--app-surface-subtle)]" />
      ) : topics.length > 0 ? (
        <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/clubs/${clubId}/discussion`}
              className="app-choice-row min-w-0 rounded-xl p-4"
            >
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--app-accent-gold)]">
                <MessageSquareText className="h-4 w-4" />
                {topic.readingTarget?.rangeLabel ?? "Current read"}
              </p>
              <h3 className="mt-2 line-clamp-2 break-words font-serif text-xl">
                {topic.title}
              </h3>
              {topic.prompt ? (
                <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-[var(--app-text-secondary)]">
                  {topic.prompt}
                </p>
              ) : null}
              <p className="mt-3 text-sm font-semibold text-[var(--app-accent-gold)]">
                {topic.postCount} replies
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No weekly topics yet"
          description="Open the Discussion tab to start a focused reading conversation."
        />
      )}
    </section>
  );
}

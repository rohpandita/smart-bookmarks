"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { type User, type RealtimeChannel } from "@supabase/supabase-js";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  created_at: string;
  user_id: string;
}

export default function BookmarkList({ user }: { user: User }) {
  const supabase = createClient();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookmarks(data);
    }
    setLoading(false);
  }, [supabase, user.id]);

  useEffect(() => {
    fetchBookmarks();

    const channel: RealtimeChannel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((prev) => {
            if (prev.some((b) => b.id === (payload.new as Bookmark).id)) {
              return prev;
            }
            return [payload.new as Bookmark, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          setBookmarks((prev) =>
            prev.filter((b) => b.id !== (payload.old as Bookmark).id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user.id, fetchBookmarks]);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<Bookmark>;
      const newBookmark = custom.detail;
      if (!newBookmark) return;
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === newBookmark.id)) return prev;
        return [newBookmark, ...prev];
      });
    };

    window.addEventListener("bookmark:added", handler as EventListener);
    return () => {
      window.removeEventListener("bookmark:added", handler as EventListener);
    };
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from("bookmarks").delete().eq("id", id);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 dark:border-gray-700">
        <p className="text-lg font-medium text-gray-400 dark:text-gray-500">
          No bookmarks yet
        </p>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          Add your first bookmark above
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50"
        >
          <div className="flex flex-col gap-1 overflow-hidden">
            <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {bookmark.title}
            </h3>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              {bookmark.url}
            </a>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(bookmark.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <button
            onClick={() => handleDelete(bookmark.id)}
            disabled={deletingId === bookmark.id}
            className="ml-4 shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-950 dark:hover:text-red-400"
            title="Delete bookmark"
          >
            {deletingId === bookmark.id ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

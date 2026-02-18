import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthButton from "@/components/AuthButton";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkList from "@/components/BookmarkList";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔖</span>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Smart Bookmarks
            </h1>
          </div>
          <AuthButton user={user} />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Add New Bookmark
          </h2>
          <BookmarkForm />
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Your Bookmarks
          </h2>
          <BookmarkList user={user} />
        </section>
      </div>
    </main>
  );
}

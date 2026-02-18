import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthButton from "@/components/AuthButton";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex flex-col items-center gap-8 px-4 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl text-white shadow-lg">
            🔖
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Smart Bookmarks
          </h1>
          <p className="max-w-md text-lg text-gray-500 dark:text-gray-400">
            Save, organize, and access your bookmarks from anywhere.
            Real-time sync across all your devices.
          </p>
        </div>
        <AuthButton user={null} />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Sign in with your Google account to get started
        </p>
      </div>
    </main>
  );
}

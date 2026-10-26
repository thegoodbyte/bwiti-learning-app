import { loginAction } from "../actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex-1 max-w-sm mx-auto w-full px-6 py-24 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form action={loginAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next ?? ""} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Incorrect password.
          </p>
        )}
        <button
          type="submit"
          className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-2 font-medium"
        >
          Log in
        </button>
      </form>
    </main>
  );
}

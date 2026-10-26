import { createCourseAction } from "../../actions";

export default async function NewCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex-1 max-w-xl mx-auto w-full px-6 py-16 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New course</h1>
      <form action={createCourseAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Title
          <input
            name="title"
            required
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            name="description"
            required
            rows={4}
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
          />
        </label>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Title and description are required.
          </p>
        )}
        <button
          type="submit"
          className="self-start rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium"
        >
          Create course
        </button>
      </form>
    </main>
  );
}

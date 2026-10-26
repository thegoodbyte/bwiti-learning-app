import Link from "next/link";
import { listCourses } from "@/lib/db";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const courses = await listCourses();

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <form action={logoutAction}>
          <button className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
            Log out
          </button>
        </form>
      </div>

      <Link
        href="/admin/courses/new"
        className="self-start rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium"
      >
        New course
      </Link>

      <div className="flex flex-col gap-4">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/admin/courses/${course.id}`}
            className="rounded-lg border border-black/10 dark:border-white/15 p-5 hover:border-black/30 dark:hover:border-white/30 transition-colors"
          >
            <h2 className="text-lg font-medium">{course.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {course.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
              {course.lessonCount} lessons
            </p>
          </Link>
        ))}
        {courses.length === 0 && (
          <p className="text-sm text-gray-500">No courses yet.</p>
        )}
      </div>
    </main>
  );
}

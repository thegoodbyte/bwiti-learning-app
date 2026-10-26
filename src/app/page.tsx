import Link from "next/link";
import { listCourses } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const courses = await listCourses();

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">Bwiti Learning</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Learn about Bwiti tradition and iboga ceremony preparation at your own pace.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
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
      </div>
    </main>
  );
}

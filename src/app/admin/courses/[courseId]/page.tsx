import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseWithLessons } from "@/lib/db";
import {
  updateCourseAction,
  deleteCourseAction,
  deleteLessonAction,
} from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseWithLessons(courseId);

  if (!course) {
    notFound();
  }

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 flex flex-col gap-10">
      <Link href="/admin" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
        ← All courses
      </Link>

      <form
        action={updateCourseAction.bind(null, courseId)}
        className="flex flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold">Edit course</h1>
        <label className="flex flex-col gap-1 text-sm">
          Title
          <input
            name="title"
            defaultValue={course.title}
            required
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            name="description"
            defaultValue={course.description}
            required
            rows={3}
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
          />
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium"
          >
            Save
          </button>
        </div>
      </form>

      <form action={deleteCourseAction.bind(null, courseId)}>
        <button className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Delete course
        </button>
      </form>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Lessons</h2>
          <Link
            href={`/admin/courses/${courseId}/lessons/new`}
            className="rounded-md bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm font-medium"
          >
            New lesson
          </Link>
        </div>

        {course.lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="rounded-lg border border-black/10 dark:border-white/15 p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-gray-500">{lesson.type}</p>
              <p className="font-medium">{lesson.title}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link
                href={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}
                className="hover:underline"
              >
                Edit
              </Link>
              <form action={deleteLessonAction.bind(null, courseId, lesson.id)}>
                <button className="text-red-600 dark:text-red-400 hover:underline">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {course.lessons.length === 0 && (
          <p className="text-sm text-gray-500">No lessons yet.</p>
        )}
      </div>
    </main>
  );
}

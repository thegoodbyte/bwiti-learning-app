import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, getCourse } from "@/data/courses";

export function generateStaticParams() {
  return courses.map((course) => ({ courseId: course.id }));
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourse(courseId);

  if (!course) {
    notFound();
  }

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 flex flex-col gap-8">
      <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
        ← All courses
      </Link>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">{course.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{course.description}</p>
      </div>
      <div className="flex flex-col gap-4">
        {course.lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="rounded-lg border border-black/10 dark:border-white/15 p-5"
          >
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Lesson {index + 1}
            </p>
            <h2 className="text-lg font-medium mt-1">{lesson.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {lesson.summary}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

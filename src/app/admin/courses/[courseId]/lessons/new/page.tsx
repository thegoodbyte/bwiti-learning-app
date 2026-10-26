import Link from "next/link";
import { LessonForm } from "../LessonForm";

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <main className="flex-1 max-w-xl mx-auto w-full px-6 py-16 flex flex-col gap-6">
      <Link
        href={`/admin/courses/${courseId}`}
        className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
      >
        ← Back to course
      </Link>
      <h1 className="text-2xl font-semibold">New lesson</h1>
      <LessonForm courseId={courseId} />
    </main>
  );
}

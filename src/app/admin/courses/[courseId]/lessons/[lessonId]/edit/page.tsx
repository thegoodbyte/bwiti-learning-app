import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson } from "@/lib/db";
import { updateLessonAction } from "@/app/admin/actions";
import { LessonForm } from "../../LessonForm";

export const dynamic = "force-dynamic";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const lesson = await getLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <main className="flex-1 max-w-xl mx-auto w-full px-6 py-16 flex flex-col gap-6">
      <Link
        href={`/admin/courses/${courseId}`}
        className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
      >
        ← Back to course
      </Link>
      <h1 className="text-2xl font-semibold">Edit lesson</h1>
      <LessonForm
        action={updateLessonAction.bind(null, courseId, lessonId)}
        lesson={lesson}
      />
    </main>
  );
}

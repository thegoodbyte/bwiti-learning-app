import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseWithLessons, type Lesson } from "@/lib/db";
import { getSignedGetUrl } from "@/lib/s3";

export const dynamic = "force-dynamic";

async function LessonMedia({ lesson }: { lesson: Lesson }) {
  if (lesson.type === "video" && lesson.videoKey) {
    const url = await getSignedGetUrl(lesson.videoKey);
    return <video controls src={url} className="w-full rounded-md" />;
  }

  if (lesson.type === "audio") {
    const audioUrl = lesson.audioKey ? await getSignedGetUrl(lesson.audioKey) : null;
    const lyricsImageUrl = lesson.lyricsImageKey
      ? await getSignedGetUrl(lesson.lyricsImageKey)
      : null;

    return (
      <div className="flex flex-col gap-3">
        {audioUrl && <audio controls src={audioUrl} className="w-full" />}
        {lyricsImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lyricsImageUrl} alt="Lyrics" className="rounded-md max-w-full" />
        )}
        {lesson.lyricsText && (
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
            {lesson.lyricsText}
          </pre>
        )}
      </div>
    );
  }

  return null;
}

export default async function CoursePage({
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
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 flex flex-col gap-8">
      <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
        ← All courses
      </Link>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">{course.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{course.description}</p>
      </div>
      <div className="flex flex-col gap-6">
        {course.lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="rounded-lg border border-black/10 dark:border-white/15 p-5 flex flex-col gap-3"
          >
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Lesson {index + 1}
              </p>
              <h2 className="text-lg font-medium mt-1">{lesson.title}</h2>
              {lesson.summary && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {lesson.summary}
                </p>
              )}
            </div>
            <LessonMedia lesson={lesson} />
            {lesson.body && (
              <p className="text-sm text-gray-700 dark:text-gray-300">{lesson.body}</p>
            )}
          </div>
        ))}
        {course.lessons.length === 0 && (
          <p className="text-sm text-gray-500">No lessons yet.</p>
        )}
      </div>
    </main>
  );
}

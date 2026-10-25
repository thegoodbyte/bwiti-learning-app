import { NextRequest, NextResponse } from "next/server";
import { getCourse } from "@/data/courses";
import { getLessonAssetUrl } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  const { courseId, lessonId } = await params;
  const filename = request.nextUrl.searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "filename query parameter is required" },
      { status: 400 }
    );
  }

  const course = getCourse(courseId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const url = await getLessonAssetUrl(courseId, lessonId, filename);
  return NextResponse.json({ url });
}

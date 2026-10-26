"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE_NAME, adminSessionToken } from "@/lib/auth";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  type LessonType,
} from "@/lib/db";
import { uploadLessonAsset } from "@/lib/s3";
import { slugify } from "@/lib/slug";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword || password !== sitePassword) {
    redirect("/admin/login?error=1");
  }

  const token = await adminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token!, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

export async function createCourseAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title || !description) {
    redirect("/admin/courses/new?error=1");
  }

  const id = slugify(title);
  await createCourse({ id, title, description });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect(`/admin/courses/${id}`);
}

export async function updateCourseAction(courseId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  await updateCourse(courseId, { title, description });

  revalidatePath("/admin");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/");
  revalidatePath(`/courses/${courseId}`);
}

export async function deleteCourseAction(courseId: string) {
  await deleteCourse(courseId);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

async function fileFromFormData(formData: FormData, field: string) {
  const file = formData.get(field);
  if (file instanceof File && file.size > 0) {
    return {
      name: file.name,
      type: file.type || "application/octet-stream",
      buffer: Buffer.from(await file.arrayBuffer()),
    };
  }
  return null;
}

export async function createLessonAction(courseId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "video") as LessonType;
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim() || null;
  const lyricsText = String(formData.get("lyricsText") ?? "").trim() || null;

  if (!title) {
    redirect(`/admin/courses/${courseId}/lessons/new?error=1`);
  }

  const id = slugify(title);

  let videoKey: string | null = null;
  let audioKey: string | null = null;
  let lyricsImageKey: string | null = null;

  if (type === "video") {
    const videoFile = await fileFromFormData(formData, "video");
    if (videoFile) {
      videoKey = await uploadLessonAsset(courseId, id, videoFile);
    }
  }

  if (type === "audio") {
    const audioFile = await fileFromFormData(formData, "audio");
    if (audioFile) {
      audioKey = await uploadLessonAsset(courseId, id, audioFile);
    }
    const lyricsImageFile = await fileFromFormData(formData, "lyricsImage");
    if (lyricsImageFile) {
      lyricsImageKey = await uploadLessonAsset(courseId, id, lyricsImageFile);
    }
  }

  await createLesson({
    id,
    courseId,
    title,
    type,
    summary,
    body,
    lyricsText,
    videoKey,
    audioKey,
    lyricsImageKey,
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

export async function updateLessonAction(
  courseId: string,
  lessonId: string,
  formData: FormData
) {
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "video") as LessonType;
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim() || null;
  const lyricsText = String(formData.get("lyricsText") ?? "").trim() || null;

  let videoKey: string | null = null;
  let audioKey: string | null = null;
  let lyricsImageKey: string | null = null;

  if (type === "video") {
    const videoFile = await fileFromFormData(formData, "video");
    if (videoFile) {
      videoKey = await uploadLessonAsset(courseId, lessonId, videoFile);
    }
  }

  if (type === "audio") {
    const audioFile = await fileFromFormData(formData, "audio");
    if (audioFile) {
      audioKey = await uploadLessonAsset(courseId, lessonId, audioFile);
    }
    const lyricsImageFile = await fileFromFormData(formData, "lyricsImage");
    if (lyricsImageFile) {
      lyricsImageKey = await uploadLessonAsset(courseId, lessonId, lyricsImageFile);
    }
  }

  await updateLesson(lessonId, {
    title,
    type,
    summary,
    body,
    lyricsText,
    videoKey,
    audioKey,
    lyricsImageKey,
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

export async function deleteLessonAction(courseId: string, lessonId: string) {
  await deleteLesson(lessonId);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

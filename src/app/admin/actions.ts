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
  updateLessonFields,
  updateLessonMedia,
  clearLessonMedia,
  deleteLesson,
  type LessonType,
} from "@/lib/db";
import { getSignedUploadUrl, deleteObject } from "@/lib/s3";
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

export type LessonTextFields = {
  title: string;
  type: LessonType;
  summary: string | null;
  body: string | null;
  lyricsText: string | null;
};

export async function saveLessonTextAction(
  courseId: string,
  lessonId: string | null,
  fields: LessonTextFields
) {
  if (!fields.title.trim()) {
    throw new Error("Title is required");
  }

  if (lessonId) {
    await updateLessonFields(lessonId, fields);
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/courses/${courseId}`);
    return lessonId;
  }

  const id = slugify(fields.title);
  await createLesson({
    id,
    courseId,
    title: fields.title,
    type: fields.type,
    summary: fields.summary,
    body: fields.body,
    lyricsText: fields.lyricsText,
    videoKey: null,
    audioKey: null,
    lyricsImageKey: null,
  });
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}`);
  return id;
}

export async function requestLessonUploadUrlAction(
  courseId: string,
  lessonId: string,
  filename: string,
  contentType: string
) {
  return getSignedUploadUrl(courseId, lessonId, filename, contentType);
}

export async function attachLessonMediaAction(
  courseId: string,
  lessonId: string,
  media: {
    videoKey?: string | null;
    audioKey?: string | null;
    lyricsImageKey?: string | null;
  }
) {
  await updateLessonMedia(lessonId, media);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}`);
}

export async function removeLessonMediaAction(
  courseId: string,
  lessonId: string,
  field: "video" | "audio" | "lyricsImage"
) {
  if (field !== "video" && field !== "audio" && field !== "lyricsImage") {
    throw new Error("Invalid media field");
  }

  const oldKey = await clearLessonMedia(lessonId, field);
  if (oldKey) {
    try {
      await deleteObject(oldKey);
    } catch (error) {
      console.error("Failed to delete S3 object for removed media:", error);
    }
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}`);
}

export async function deleteLessonAction(courseId: string, lessonId: string) {
  await deleteLesson(lessonId);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

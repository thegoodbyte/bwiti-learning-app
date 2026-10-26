"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lesson, LessonType } from "@/lib/db";
import {
  saveLessonTextAction,
  requestLessonUploadUrlAction,
  attachLessonMediaAction,
  removeLessonMediaAction,
} from "../../../actions";

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
      <div
        className="h-full bg-black dark:bg-white transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function LessonForm({
  courseId,
  lesson,
}: {
  courseId: string;
  lesson?: Lesson;
}) {
  const router = useRouter();
  const [type, setType] = useState<LessonType>(lesson?.type ?? "video");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState<number | null>(null);
  const [imageProgress, setImageProgress] = useState<number | null>(null);

  const [hasVideo, setHasVideo] = useState(Boolean(lesson?.videoKey));
  const [hasAudio, setHasAudio] = useState(Boolean(lesson?.audioKey));
  const [hasLyricsImage, setHasLyricsImage] = useState(Boolean(lesson?.lyricsImageKey));
  const [removingField, setRemovingField] = useState<
    "video" | "audio" | "lyricsImage" | null
  >(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const lyricsImageInputRef = useRef<HTMLInputElement>(null);

  async function handleRemoveMedia(field: "video" | "audio" | "lyricsImage") {
    if (!lesson) return;
    setRemovingField(field);
    try {
      await removeLessonMediaAction(courseId, lesson.id, field);
      if (field === "video") setHasVideo(false);
      if (field === "audio") setHasAudio(false);
      if (field === "lyricsImage") setHasLyricsImage(false);
      router.refresh();
    } catch (err) {
      console.error("Remove media error:", err);
      setError(err instanceof Error ? err.message : "Failed to remove file.");
    } finally {
      setRemovingField(null);
    }
  }

  async function uploadFile(
    lessonId: string,
    file: File,
    onProgress: (percent: number) => void
  ) {
    const { url, key } = await requestLessonUploadUrlAction(
      courseId,
      lessonId,
      file.name,
      file.type || "application/octet-stream"
    );
    await uploadWithProgress(url, file, onProgress);
    return key;
  }

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const form = formEvent.currentTarget;
      const formData = new FormData(form);
      const title = String(formData.get("title") ?? "").trim();
      const summary = String(formData.get("summary") ?? "").trim() || null;
      const body = String(formData.get("body") ?? "").trim() || null;
      const lyricsText = String(formData.get("lyricsText") ?? "").trim() || null;

      if (!title) {
        setError("Title is required.");
        setSubmitting(false);
        return;
      }

      const lessonId = await saveLessonTextAction(courseId, lesson?.id ?? null, {
        title,
        type,
        summary,
        body,
        lyricsText,
      });

      const videoFile = type === "video" ? videoInputRef.current?.files?.[0] : undefined;
      const audioFile = type === "audio" ? audioInputRef.current?.files?.[0] : undefined;
      const lyricsImageFile =
        type === "audio" ? lyricsImageInputRef.current?.files?.[0] : undefined;

      const media: {
        videoKey?: string | null;
        audioKey?: string | null;
        lyricsImageKey?: string | null;
      } = {};

      if (videoFile) {
        media.videoKey = await uploadFile(lessonId, videoFile, setVideoProgress);
      }
      if (audioFile) {
        media.audioKey = await uploadFile(lessonId, audioFile, setAudioProgress);
      }
      if (lyricsImageFile) {
        media.lyricsImageKey = await uploadFile(
          lessonId,
          lyricsImageFile,
          setImageProgress
        );
      }

      if (Object.keys(media).length > 0) {
        await attachLessonMediaAction(courseId, lessonId, media);
      }

      router.push(`/admin/courses/${courseId}`);
    } catch (err) {
      console.error("Lesson save/upload error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          name="title"
          defaultValue={lesson?.title}
          required
          disabled={submitting}
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
      </label>

      <fieldset className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="video"
            checked={type === "video"}
            disabled={submitting}
            onChange={() => setType("video")}
          />
          Video lesson
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="audio"
            checked={type === "audio"}
            disabled={submitting}
            onChange={() => setType("audio")}
          />
          Audio lesson
        </label>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        Summary
        <input
          name="summary"
          defaultValue={lesson?.summary ?? ""}
          disabled={submitting}
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Body text
        <textarea
          name="body"
          defaultValue={lesson?.body ?? ""}
          rows={4}
          disabled={submitting}
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
      </label>

      {type === "video" && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="flex items-center gap-2">
            Video file{hasVideo ? " (replace)" : ""}
            {hasVideo && (
              <button
                type="button"
                onClick={() => handleRemoveMedia("video")}
                disabled={submitting || removingField === "video"}
                className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
              >
                {removingField === "video" ? "Removing…" : "Remove"}
              </button>
            )}
          </span>
          <input
            type="file"
            name="video"
            accept="video/*"
            ref={videoInputRef}
            disabled={submitting}
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
          />
          {videoProgress !== null && <ProgressBar percent={videoProgress} />}
        </label>
      )}

      {type === "audio" && (
        <>
          <label className="flex flex-col gap-1 text-sm">
            <span className="flex items-center gap-2">
              Audio file{hasAudio ? " (replace)" : ""}
              {hasAudio && (
                <button
                  type="button"
                  onClick={() => handleRemoveMedia("audio")}
                  disabled={submitting || removingField === "audio"}
                  className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                >
                  {removingField === "audio" ? "Removing…" : "Remove"}
                </button>
              )}
            </span>
            <input
              type="file"
              name="audio"
              accept="audio/*"
              ref={audioInputRef}
              disabled={submitting}
              className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
            />
            {audioProgress !== null && <ProgressBar percent={audioProgress} />}
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="flex items-center gap-2">
              Lyrics image{hasLyricsImage ? " (replace)" : ""}
              {hasLyricsImage && (
                <button
                  type="button"
                  onClick={() => handleRemoveMedia("lyricsImage")}
                  disabled={submitting || removingField === "lyricsImage"}
                  className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                >
                  {removingField === "lyricsImage" ? "Removing…" : "Remove"}
                </button>
              )}
            </span>
            <input
              type="file"
              name="lyricsImage"
              accept="image/*"
              ref={lyricsImageInputRef}
              disabled={submitting}
              className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
            />
            {imageProgress !== null && <ProgressBar percent={imageProgress} />}
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Lyrics text
            <textarea
              name="lyricsText"
              defaultValue={lesson?.lyricsText ?? ""}
              rows={6}
              disabled={submitting}
              className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
            />
          </label>
        </>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {submitting ? "Uploading…" : lesson ? "Save lesson" : "Create lesson"}
      </button>
    </form>
  );
}

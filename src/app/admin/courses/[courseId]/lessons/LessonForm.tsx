"use client";

import { useState } from "react";
import type { Lesson, LessonType } from "@/lib/db";

export function LessonForm({
  action,
  lesson,
}: {
  action: (formData: FormData) => void;
  lesson?: Lesson;
}) {
  const [type, setType] = useState<LessonType>(lesson?.type ?? "video");

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          name="title"
          defaultValue={lesson?.title}
          required
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
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Body text
        <textarea
          name="body"
          defaultValue={lesson?.body ?? ""}
          rows={4}
          className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
        />
      </label>

      {type === "video" && (
        <label className="flex flex-col gap-1 text-sm">
          Video file{lesson?.videoKey ? " (replace)" : ""}
          <input
            type="file"
            name="video"
            accept="video/*"
            className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
          />
        </label>
      )}

      {type === "audio" && (
        <>
          <label className="flex flex-col gap-1 text-sm">
            Audio file{lesson?.audioKey ? " (replace)" : ""}
            <input
              type="file"
              name="audio"
              accept="audio/*"
              className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Lyrics image{lesson?.lyricsImageKey ? " (replace)" : ""}
            <input
              type="file"
              name="lyricsImage"
              accept="image/*"
              className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Lyrics text
            <textarea
              name="lyricsText"
              defaultValue={lesson?.lyricsText ?? ""}
              rows={6}
              className="rounded-md border border-black/15 dark:border-white/20 px-3 py-2 bg-transparent"
            />
          </label>
        </>
      )}

      <button
        type="submit"
        className="self-start rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium"
      >
        {lesson ? "Save lesson" : "Create lesson"}
      </button>
    </form>
  );
}

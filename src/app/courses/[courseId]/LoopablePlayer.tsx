"use client";

import { useRef, useState } from "react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function LoopablePlayer({
  src,
  type,
}: {
  src: string;
  type: "video" | "audio";
}) {
  const mediaRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [looping, setLooping] = useState(false);
  const [duration, setDuration] = useState(0);

  function handleTimeUpdate() {
    const media = mediaRef.current;
    if (!media || !looping || loopStart === null || loopEnd === null) return;
    if (media.currentTime >= loopEnd) {
      media.currentTime = loopStart;
      if (media.paused) media.play();
    }
  }

  function setStart() {
    const media = mediaRef.current;
    if (!media) return;
    const time = media.currentTime;
    setLoopStart(time);
    if (loopEnd !== null && time >= loopEnd) {
      setLoopEnd(null);
      setLooping(false);
    }
  }

  function setEnd() {
    const media = mediaRef.current;
    if (!media) return;
    const time = media.currentTime;
    if (loopStart !== null && time <= loopStart) return;
    setLoopEnd(time);
  }

  function clearLoop() {
    setLoopStart(null);
    setLoopEnd(null);
    setLooping(false);
  }

  const hasRange = loopStart !== null && loopEnd !== null;

  const mediaProps = {
    ref: mediaRef,
    controls: true,
    src,
    onTimeUpdate: handleTimeUpdate,
    onLoadedMetadata: (event: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) =>
      setDuration(event.currentTarget.duration),
    className: type === "video" ? "w-full rounded-md" : "w-full",
  };

  return (
    <div className="flex flex-col gap-2">
      {type === "video" ? <video {...mediaProps} /> : <audio {...mediaProps} />}
      {duration > 0 && (
        <div className="relative h-1.5 w-full rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
          {hasRange && (
            <div
              className="absolute inset-y-0 bg-amber-400 dark:bg-amber-500"
              style={{
                left: `${(loopStart! / duration) * 100}%`,
                width: `${((loopEnd! - loopStart!) / duration) * 100}%`,
              }}
            />
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={setStart}
          className="rounded border border-black/15 dark:border-white/20 px-2 py-1 hover:border-black/30 dark:hover:border-white/40"
        >
          Set loop start
        </button>
        <button
          type="button"
          onClick={setEnd}
          disabled={loopStart === null}
          className="rounded border border-black/15 dark:border-white/20 px-2 py-1 hover:border-black/30 dark:hover:border-white/40 disabled:opacity-40"
        >
          Set loop end
        </button>
        <button
          type="button"
          onClick={() => setLooping((prev) => !prev)}
          disabled={!hasRange}
          className={`rounded border px-2 py-1 disabled:opacity-40 ${
            looping
              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
              : "border-black/15 dark:border-white/20 hover:border-black/30 dark:hover:border-white/40"
          }`}
        >
          {looping ? "Looping" : "Loop"}
        </button>
        {hasRange && (
          <span className="text-gray-500 dark:text-gray-400">
            {formatTime(loopStart!)} – {formatTime(loopEnd!)}
          </span>
        )}
        {(loopStart !== null || loopEnd !== null) && (
          <button
            type="button"
            onClick={clearLoop}
            className="text-gray-500 dark:text-gray-400 hover:underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

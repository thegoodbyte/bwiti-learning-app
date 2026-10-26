import "server-only";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export type LessonType = "video" | "audio";

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  type: LessonType;
  summary: string | null;
  body: string | null;
  lyricsText: string | null;
  videoKey: string | null;
  audioKey: string | null;
  lyricsImageKey: string | null;
  position: number;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  position: number;
};

export type CourseWithLessonCount = Course & { lessonCount: number };
export type CourseWithLessons = Course & { lessons: Lesson[] };

export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('video', 'audio')),
      summary TEXT,
      body TEXT,
      lyrics_text TEXT,
      video_key TEXT,
      audio_key TEXT,
      lyrics_image_key TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

function mapLesson(row: {
  id: string;
  course_id: string;
  title: string;
  type: LessonType;
  summary: string | null;
  body: string | null;
  lyrics_text: string | null;
  video_key: string | null;
  audio_key: string | null;
  lyrics_image_key: string | null;
  position: number;
}): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    type: row.type,
    summary: row.summary,
    body: row.body,
    lyricsText: row.lyrics_text,
    videoKey: row.video_key,
    audioKey: row.audio_key,
    lyricsImageKey: row.lyrics_image_key,
    position: row.position,
  };
}

export async function listCourses(): Promise<CourseWithLessonCount[]> {
  const { rows } = await pool.query(`
    SELECT c.id, c.title, c.description, c.position, COUNT(l.id)::int AS lesson_count
    FROM courses c
    LEFT JOIN lessons l ON l.course_id = c.id
    GROUP BY c.id, c.title, c.description, c.position
    ORDER BY c.position, c.created_at
  `);
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    position: row.position,
    lessonCount: row.lesson_count,
  }));
}

export async function getCourseWithLessons(
  courseId: string
): Promise<CourseWithLessons | null> {
  const courseResult = await pool.query(
    "SELECT id, title, description, position FROM courses WHERE id = $1",
    [courseId]
  );
  if (courseResult.rows.length === 0) {
    return null;
  }
  const lessonsResult = await pool.query(
    `SELECT id, course_id, title, type, summary, body, lyrics_text, video_key, audio_key, lyrics_image_key, position
     FROM lessons WHERE course_id = $1 ORDER BY position, created_at`,
    [courseId]
  );
  const course = courseResult.rows[0];
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    position: course.position,
    lessons: lessonsResult.rows.map(mapLesson),
  };
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  const { rows } = await pool.query(
    `SELECT id, course_id, title, type, summary, body, lyrics_text, video_key, audio_key, lyrics_image_key, position
     FROM lessons WHERE id = $1`,
    [lessonId]
  );
  return rows.length > 0 ? mapLesson(rows[0]) : null;
}

export async function createCourse(course: {
  id: string;
  title: string;
  description: string;
}) {
  await pool.query(
    "INSERT INTO courses (id, title, description) VALUES ($1, $2, $3)",
    [course.id, course.title, course.description]
  );
}

export async function updateCourse(
  courseId: string,
  fields: { title: string; description: string }
) {
  await pool.query(
    "UPDATE courses SET title = $1, description = $2 WHERE id = $3",
    [fields.title, fields.description, courseId]
  );
}

export async function deleteCourse(courseId: string) {
  await pool.query("DELETE FROM courses WHERE id = $1", [courseId]);
}

export async function createLesson(lesson: {
  id: string;
  courseId: string;
  title: string;
  type: LessonType;
  summary: string | null;
  body: string | null;
  lyricsText: string | null;
  videoKey: string | null;
  audioKey: string | null;
  lyricsImageKey: string | null;
}) {
  await pool.query(
    `INSERT INTO lessons
      (id, course_id, title, type, summary, body, lyrics_text, video_key, audio_key, lyrics_image_key)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      lesson.id,
      lesson.courseId,
      lesson.title,
      lesson.type,
      lesson.summary,
      lesson.body,
      lesson.lyricsText,
      lesson.videoKey,
      lesson.audioKey,
      lesson.lyricsImageKey,
    ]
  );
}

export async function updateLesson(
  lessonId: string,
  fields: {
    title: string;
    type: LessonType;
    summary: string | null;
    body: string | null;
    lyricsText: string | null;
    videoKey: string | null;
    audioKey: string | null;
    lyricsImageKey: string | null;
  }
) {
  await pool.query(
    `UPDATE lessons SET
      title = $1, type = $2, summary = $3, body = $4, lyrics_text = $5,
      video_key = COALESCE($6, video_key),
      audio_key = COALESCE($7, audio_key),
      lyrics_image_key = COALESCE($8, lyrics_image_key)
     WHERE id = $9`,
    [
      fields.title,
      fields.type,
      fields.summary,
      fields.body,
      fields.lyricsText,
      fields.videoKey,
      fields.audioKey,
      fields.lyricsImageKey,
      lessonId,
    ]
  );
}

export async function deleteLesson(lessonId: string) {
  await pool.query("DELETE FROM lessons WHERE id = $1", [lessonId]);
}

export async function countCourses(): Promise<number> {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM courses");
  return rows[0].count;
}

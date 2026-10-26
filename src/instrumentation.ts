export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) {
    return;
  }

  const { ensureSchema, countCourses, createCourse, createLesson } = await import(
    "@/lib/db"
  );

  try {
    await ensureSchema();

    if ((await countCourses()) > 0) {
      return;
    }
  } catch (error) {
    console.error("Skipping schema/seed setup, database unreachable:", error);
    return;
  }

  const seedCourses = [
    {
      id: "intro-to-bwiti",
      title: "Introduction to Bwiti",
      description:
        "An overview of Bwiti tradition, its origins, and its role in Central African spiritual life.",
      lessons: [
        {
          id: "origins",
          title: "Origins and History",
          summary: "Where the Bwiti tradition comes from and how it has evolved.",
        },
        {
          id: "beliefs",
          title: "Core Beliefs",
          summary: "The spiritual framework and worldview at the heart of Bwiti practice.",
        },
      ],
    },
    {
      id: "iboga-safety",
      title: "Iboga Safety and Preparation",
      description:
        "What to know before participating in an iboga ceremony, including health screening and preparation.",
      lessons: [
        {
          id: "health-screening",
          title: "Health Screening",
          summary: "Medical contraindications and why pre-screening matters.",
        },
      ],
    },
  ];

  for (const course of seedCourses) {
    await createCourse({
      id: course.id,
      title: course.title,
      description: course.description,
    });
    for (const lesson of course.lessons) {
      await createLesson({
        id: lesson.id,
        courseId: course.id,
        title: lesson.title,
        type: "audio",
        summary: lesson.summary,
        body: null,
        lyricsText: null,
        videoKey: null,
        audioKey: null,
        lyricsImageKey: null,
      });
    }
  }
}

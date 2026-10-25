export type Lesson = {
  id: string;
  title: string;
  summary: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

export const courses: Course[] = [
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
      {
        id: "community",
        title: "Community and Initiation",
        summary: "How initiates join and participate in the Bwiti community.",
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
      {
        id: "diet-and-mindset",
        title: "Diet and Mindset Preparation",
        summary: "Physical and mental preparation in the days before a ceremony.",
      },
      {
        id: "aftercare",
        title: "Aftercare",
        summary: "Integrating the experience and supporting recovery afterward.",
      },
    ],
  },
  {
    id: "ceremony-traditions",
    title: "Ceremony Traditions",
    description:
      "An introduction to the structure, music, and roles involved in a traditional Bwiti ceremony.",
    lessons: [
      {
        id: "roles",
        title: "Ceremony Roles",
        summary: "Who leads a ceremony and the responsibilities they carry.",
      },
      {
        id: "music",
        title: "Music and Ritual",
        summary: "The use of harp, song, and rhythm throughout a ceremony.",
      },
      {
        id: "stages",
        title: "Stages of a Ceremony",
        summary: "What typically happens from start to finish.",
      },
    ],
  },
];

export function getCourse(courseId: string): Course | undefined {
  return courses.find((course) => course.id === courseId);
}

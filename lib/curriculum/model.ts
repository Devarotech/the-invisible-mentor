export type Exam = "JAMB" | "WAEC" | "NECO";

export type LearningObjective = {
  id: string;
  title: string;
  description: string;
};

export type LearningNode = {
  id: string;
  title: string;
  description?: string;
  prerequisites?: string[];
  objectives?: LearningObjective[];
};

export type Topic = LearningNode & {
  type: "topic";
  subjectId: string;
  examRelevance?: Partial<Record<Exam, number>>;
  subtopics: LearningNode[];
};

export type Subject = {
  id: string;
  name: string;
  exams: Exam[];
  topics: Topic[];
};

export type Curriculum = {
  version: string;
  subjects: Subject[];
};

export const curriculumV1: Curriculum = {
  version: "0.1.0-prototype",
  subjects: [
    {
      id: "mathematics",
      name: "Mathematics",
      exams: ["JAMB", "WAEC", "NECO"],
      topics: [
        {
          id: "math-algebra",
          type: "topic",
          subjectId: "mathematics",
          title: "Algebra",
          description: "Using symbols, expressions and equations to represent and solve problems.",
          examRelevance: { JAMB: 1.2, WAEC: 1.2, NECO: 1.2 },
          subtopics: [
            {
              id: "math-linear-equations",
              title: "Linear equations",
              prerequisites: [],
              objectives: [
                {
                  id: "obj-linear-1",
                  title: "Solve one-variable linear equations",
                  description: "Solve equations using inverse operations and verify solutions.",
                },
              ],
            },
            {
              id: "math-quadratic-equations",
              title: "Quadratic equations",
              prerequisites: ["math-linear-equations"],
              objectives: [
                {
                  id: "obj-quadratic-1",
                  title: "Solve quadratic equations",
                  description: "Use factorisation and the quadratic formula to find solutions.",
                },
                {
                  id: "obj-quadratic-2",
                  title: "Interpret quadratic solutions",
                  description: "Connect roots of a quadratic equation to its graph and problem context.",
                },
              ],
            },
          ],
        },
        {
          id: "math-statistics",
          type: "topic",
          subjectId: "mathematics",
          title: "Statistics",
          description: "Collecting, representing and interpreting numerical data.",
          examRelevance: { JAMB: 1, WAEC: 1, NECO: 1 },
          subtopics: [
            {
              id: "math-averages",
              title: "Measures of central tendency",
              prerequisites: [],
              objectives: [
                {
                  id: "obj-averages-1",
                  title: "Calculate mean, median and mode",
                  description: "Calculate and interpret common measures of central tendency.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "english",
      name: "English",
      exams: ["JAMB", "WAEC", "NECO"],
      topics: [
        {
          id: "english-reading",
          type: "topic",
          subjectId: "english",
          title: "Reading comprehension",
          description: "Understanding, interpreting and evaluating written passages.",
          examRelevance: { JAMB: 1.2, WAEC: 1.2, NECO: 1.2 },
          subtopics: [
            {
              id: "english-main-idea",
              title: "Main idea and supporting details",
              prerequisites: [],
              objectives: [
                {
                  id: "obj-reading-1",
                  title: "Identify the main idea",
                  description: "Identify the central idea and distinguish it from supporting details.",
                },
              ],
            },
          ],
        },
        {
          id: "english-vocabulary",
          type: "topic",
          subjectId: "english",
          title: "Vocabulary and word meaning",
          description: "Understanding word meanings, synonyms and antonyms in context.",
          examRelevance: { JAMB: 1.2, WAEC: 1.1, NECO: 1.1 },
          subtopics: [
            {
              id: "english-synonyms",
              title: "Synonyms and antonyms",
              prerequisites: [],
              objectives: [
                {
                  id: "obj-vocabulary-1",
                  title: "Identify synonyms and antonyms",
                  description: "Choose words with similar or opposite meanings, including from context.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "physics",
      name: "Physics",
      exams: ["JAMB", "WAEC", "NECO"],
      topics: [
        {
          id: "physics-motion",
          type: "topic",
          subjectId: "physics",
          title: "Motion",
          description: "Describing movement using distance, displacement, speed and velocity.",
          examRelevance: { JAMB: 1, WAEC: 1, NECO: 1 },
          subtopics: [
            {
              id: "physics-speed",
              title: "Speed and velocity",
              prerequisites: [],
              objectives: [
                {
                  id: "obj-speed-1",
                  title: "Recognise speed and its units",
                  description: "Identify speed as distance travelled per unit time and recognise metres per second.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "biology",
      name: "Biology",
      exams: ["JAMB", "WAEC", "NECO"],
      topics: [
        {
          id: "biology-cell-biology",
          type: "topic",
          subjectId: "biology",
          title: "Cell biology",
          description: "Understanding cell structures and their functions.",
          examRelevance: { JAMB: 1, WAEC: 1, NECO: 1 },
          subtopics: [
            {
              id: "biology-cell-structure",
              title: "Cell structures and functions",
              prerequisites: [],
              objectives: [
                {
                  id: "obj-cell-1",
                  title: "Identify major cell structures",
                  description: "Identify the nucleus and describe its role in controlling cell activities.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export function getSubject(id: string) {
  return curriculumV1.subjects.find((subject) => subject.id === id);
}

export function getTopic(id: string) {
  for (const subject of curriculumV1.subjects) {
    const topic = subject.topics.find((item) => item.id === id);
    if (topic) return topic;
  }
  return undefined;
}

export function getLearningNode(id: string) {
  for (const subject of curriculumV1.subjects) {
    for (const topic of subject.topics) {
      if (topic.id === id) return topic;
      const subtopic = topic.subtopics.find((item) => item.id === id);
      if (subtopic) return subtopic;
    }
  }
  return undefined;
}

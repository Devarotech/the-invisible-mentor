import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const examEnum = pgEnum("exam", ["JAMB", "WAEC", "NECO"]);
export const masteryLevelEnum = pgEnum("mastery_level", [
  "foundational",
  "developing",
  "proficient",
]);

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: text("auth_user_id").unique(),
  displayName: text("display_name").notNull(),
  schoolName: text("school_name"),
  className: text("class_name"),
  careerGoal: text("career_goal"),
  learningPreferences: jsonb("learning_preferences"),
  studyAvailabilityMinutes: integer("study_availability_minutes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const examPreparations = pgTable(
  "exam_preparations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    exam: examEnum("exam").notNull(),
    targetDate: date("target_date"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    studentExamUnique: uniqueIndex("exam_preparations_student_exam_idx").on(
      table.studentId,
      table.exam,
    ),
  }),
);

export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const studentSubjects = pgTable(
  "student_subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
    exam: examEnum("exam").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    studentSubjectExamUnique: uniqueIndex("student_subject_exam_idx").on(
      table.studentId,
      table.subjectId,
      table.exam,
    ),
  }),
);

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
    parentTopicId: uuid("parent_topic_id"),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    curriculumVersion: text("curriculum_version").notNull(),
    examRelevance: real("exam_relevance"),
    sourceId: uuid("source_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    subjectSlugUnique: uniqueIndex("topics_subject_slug_idx").on(table.subjectId, table.slug),
  }),
);

export const learningObjectives = pgTable("learning_objectives", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const topicPrerequisites = pgTable(
  "topic_prerequisites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    topicId: uuid("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
    prerequisiteTopicId: uuid("prerequisite_topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => ({
    prerequisiteUnique: uniqueIndex("topic_prerequisites_unique_idx").on(
      table.topicId,
      table.prerequisiteTopicId,
    ),
  }),
);

export const contentSources = pgTable("content_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  publisher: text("publisher"),
  url: text("url"),
  version: text("version"),
  licenseNotes: text("license_notes"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  exam: examEnum("exam"),
  prompt: text("prompt").notNull(),
  questionType: text("question_type").notNull(),
  difficulty: integer("difficulty").notNull(),
  explanation: text("explanation"),
  correctAnswer: text("correct_answer"),
  options: jsonb("options"),
  sourceId: uuid("source_id").references(() => contentSources.id, { onDelete: "set null" }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const assessmentAttempts = pgTable("assessment_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").references(() => questions.id, { onDelete: "set null" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  exam: examEnum("exam"),
  answer: text("answer"),
  isCorrect: boolean("is_correct").notNull(),
  responseTimeSeconds: integer("response_time_seconds"),
  confidence: integer("confidence"),
  attemptNumber: integer("attempt_number").default(1).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const topicMastery = pgTable(
  "topic_mastery",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
    exam: examEnum("exam").notNull(),
    score: real("score").default(0).notNull(),
    level: masteryLevelEnum("level").default("foundational").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    correct: integer("correct").default(0).notNull(),
    recentAccuracy: real("recent_accuracy").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    studentTopicExamUnique: uniqueIndex("topic_mastery_student_topic_exam_idx").on(
      table.studentId,
      table.topicId,
      table.exam,
    ),
  }),
);

export const studyPlans = pgTable("study_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  examPreparationId: uuid("exam_preparation_id").references(() => examPreparations.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  planDate: date("plan_date").notNull(),
  availableMinutes: integer("available_minutes").notNull(),
  generatedReason: text("generated_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const studyPlanItems = pgTable("study_plan_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  studyPlanId: uuid("study_plan_id").notNull().references(() => studyPlans.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  activityType: text("activity_type").notNull(),
  allocatedMinutes: integer("allocated_minutes").notNull(),
  priorityScore: real("priority_score"),
  completed: boolean("completed").default(false).notNull(),
  position: integer("position").notNull(),
});

export const learningSessions = pgTable("learning_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  sessionType: text("session_type").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  durationSeconds: integer("duration_seconds"),
  metadata: jsonb("metadata"),
});

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  assessmentAttempts,
  examPreparations,
  students,
  subjects,
  topicMastery,
  topics,
} from "@/lib/db/schema";
import { calculateTopicMastery } from "@/lib/learning/mastery";

const exams = new Set(["JAMB", "WAEC", "NECO"]);

const diagnosticAnswerKey: Record<string, { subject: string; correctAnswer: string }> = {
  "math-algebra": { subject: "Mathematics", correctAnswer: "4" },
  "english-vocabulary": { subject: "English", correctAnswer: "Quick" },
  "physics-motion": { subject: "Physics", correctAnswer: "Speed" },
  "biology-cell-biology": { subject: "Biology", correctAnswer: "Nucleus" },
};

type Answer = {
  subject: string;
  topicId: string;
  answer: string;
};

type Body = {
  studentId?: string;
  exam?: string;
  answers?: Answer[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;

    if (!body.studentId || !body.exam || !exams.has(body.exam) || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json({ error: "Incomplete diagnostic submission." }, { status: 400 });
    }

    const answersAreValid = body.answers.every((item) => {
      const expected = diagnosticAnswerKey[item.topicId];
      return Boolean(
        expected &&
        expected.subject === item.subject &&
        typeof item.answer === "string" &&
        item.answer.length > 0
      );
    });

    if (!answersAreValid) {
      return NextResponse.json({ error: "The diagnostic contains an unsupported question or answer." }, { status: 400 });
    }

    const db = getDb();
    const student = await db.select().from(students).where(eq(students.id, body.studentId)).limit(1);

    if (!student[0]) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const exam = body.exam as "JAMB" | "WAEC" | "NECO";
    const preparation = await db
      .select()
      .from(examPreparations)
      .where(and(eq(examPreparations.studentId, body.studentId), eq(examPreparations.exam, exam)))
      .limit(1);

    if (!preparation[0]) {
      return NextResponse.json({ error: "Exam preparation not found." }, { status: 404 });
    }

    const score = body.answers.filter(
      (item) => item.answer === diagnosticAnswerKey[item.topicId].correctAnswer,
    ).length;

    for (const item of body.answers) {
      const subject = await db
        .select({ id: subjects.id })
        .from(subjects)
        .where(eq(subjects.name, item.subject))
        .limit(1);

      const topic = subject[0]
        ? await db
            .select({ id: topics.id })
            .from(topics)
            .where(and(eq(topics.subjectId, subject[0].id), eq(topics.slug, item.topicId)))
            .limit(1)
        : [];

      await db.insert(assessmentAttempts).values({
        studentId: body.studentId,
        topicId: topic[0]?.id ?? null,
        exam,
        answer: item.answer,
        isCorrect: item.answer === diagnosticAnswerKey[item.topicId].correctAnswer,
        attemptNumber: 1,
        metadata: { source: "diagnostic", curriculumTopicId: item.topicId },
      });

      if (topic[0]) {
        const previous = await db
          .select()
          .from(assessmentAttempts)
          .where(and(
            eq(assessmentAttempts.studentId, body.studentId),
            eq(assessmentAttempts.topicId, topic[0].id),
            eq(assessmentAttempts.exam, exam),
          ));

        const mastery = calculateTopicMastery(
          item.subject,
          item.topicId,
          previous.map((attempt) => ({ correct: attempt.isCorrect })),
        );

        await db.insert(topicMastery).values({
          studentId: body.studentId,
          topicId: topic[0].id,
          exam,
          score: mastery.score,
          level: mastery.level,
          attempts: mastery.attempts,
          correct: mastery.correct,
          recentAccuracy: mastery.recentAccuracy,
        }).onConflictDoUpdate({
          target: [topicMastery.studentId, topicMastery.topicId, topicMastery.exam],
          set: {
            score: mastery.score,
            level: mastery.level,
            attempts: mastery.attempts,
            correct: mastery.correct,
            recentAccuracy: mastery.recentAccuracy,
            updatedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      score,
      total: body.answers.length,
      percentage: body.answers.length ? Math.round((score / body.answers.length) * 100) : 0,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Diagnostic submission failed:", error);
    return NextResponse.json({ error: "Unable to save the diagnostic." }, { status: 500 });
  }
}

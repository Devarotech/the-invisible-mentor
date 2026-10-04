import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  examPreparations,
  students,
  studentSubjects,
  subjects,
  topicMastery,
  topics,
} from "@/lib/db/schema";
import { rankLearningPriorities, buildDailyPlan, type TopicMastery } from "@/lib/learning/mastery";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const exam = searchParams.get("exam");

    if (!studentId || !exam || !["JAMB", "WAEC", "NECO"].includes(exam)) {
      return NextResponse.json({ error: "studentId and a valid exam are required." }, { status: 400 });
    }

    const db = getDb();
    const student = await db.select().from(students).where(eq(students.id, studentId)).limit(1);

    if (!student[0]) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const preparation = await db
      .select()
      .from(examPreparations)
      .where(and(eq(examPreparations.studentId, studentId), eq(examPreparations.exam, exam as "JAMB" | "WAEC" | "NECO")))
      .limit(1);

    const selectedSubjects = await db
      .select({ id: subjects.id, name: subjects.name })
      .from(studentSubjects)
      .innerJoin(subjects, eq(studentSubjects.subjectId, subjects.id))
      .where(and(
        eq(studentSubjects.studentId, studentId),
        eq(studentSubjects.exam, exam as "JAMB" | "WAEC" | "NECO"),
      ));

    const subjectIds = selectedSubjects.map((subject) => subject.id);
    const masteryRows = subjectIds.length
      ? await db
          .select({
            subject: subjects.name,
            topic: topics.title,
            score: topicMastery.score,
            level: topicMastery.level,
            attempts: topicMastery.attempts,
            correct: topicMastery.correct,
            recentAccuracy: topicMastery.recentAccuracy,
          })
          .from(topicMastery)
          .innerJoin(topics, eq(topicMastery.topicId, topics.id))
          .innerJoin(subjects, eq(topics.subjectId, subjects.id))
          .where(and(
            eq(topicMastery.studentId, studentId),
            eq(topicMastery.exam, exam as "JAMB" | "WAEC" | "NECO"),
            inArray(topics.subjectId, subjectIds),
          ))
      : [];

    const tracked: TopicMastery[] = masteryRows.map((row) => ({
      subject: row.subject,
      topic: row.topic,
      score: row.score,
      level: row.level,
      attempts: row.attempts,
      correct: row.correct,
      recentAccuracy: row.recentAccuracy,
    }));

    const priorities = rankLearningPriorities(tracked);
    const availableMinutes = student[0].studyAvailabilityMinutes ?? 30;
    const plan = buildDailyPlan(priorities, availableMinutes);

    return NextResponse.json({
      student: student[0],
      examPreparation: preparation[0] ?? null,
      subjects: selectedSubjects,
      mastery: tracked,
      priorities,
      dailyPlan: plan,
    });
  } catch (error) {
    console.error("Dashboard read failed:", error);
    return NextResponse.json({ error: "Unable to load the learning dashboard." }, { status: 500 });
  }
}

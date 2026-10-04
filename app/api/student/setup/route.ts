import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  students,
  examPreparations,
  subjects,
  studentSubjects,
  topics,
  learningObjectives,
} from "@/lib/db/schema";
import { curriculumV1 } from "@/lib/curriculum/model";

const exams = new Set(["JAMB", "WAEC", "NECO"]);

type SetupBody = {
  name?: string;
  exam?: string;
  subjects?: string[];
  goal?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SetupBody;

    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json({ error: "A valid name is required." }, { status: 400 });
    }

    if (!body.exam || !exams.has(body.exam)) {
      return NextResponse.json({ error: "A valid exam is required." }, { status: 400 });
    }

    if (!Array.isArray(body.subjects) || body.subjects.length === 0) {
      return NextResponse.json({ error: "Choose at least one subject." }, { status: 400 });
    }

    const db = getDb();

    const [student] = await db.insert(students).values({
      displayName: body.name.trim(),
      careerGoal: body.goal?.trim() || null,
    }).returning();

    const [examPreparation] = await db.insert(examPreparations).values({
      studentId: student.id,
      exam: body.exam as "JAMB" | "WAEC" | "NECO",
      active: true,
    }).returning();

    const selected = [...new Set(body.subjects.map((value) => value.trim()).filter(Boolean))];
    const subjectRecords: { id: string; name: string; slug: string }[] = [];

    for (const name of selected) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      const existing = await db.select().from(subjects).where(eq(subjects.slug, slug)).limit(1);
      const subject = existing[0] ?? (await db.insert(subjects).values({ name, slug }).returning())[0];
      subjectRecords.push(subject);
    }

    for (const subject of subjectRecords) {
      await db.insert(studentSubjects).values({
        studentId: student.id,
        subjectId: subject.id,
        exam: body.exam as "JAMB" | "WAEC" | "NECO",
      }).onConflictDoNothing();

      const curriculumSubject = curriculumV1.subjects.find(
        (item) => item.name.toLowerCase() === subject.name.toLowerCase(),
      );

      if (!curriculumSubject) continue;

      for (const topic of curriculumSubject.topics) {
        const existingTopic = await db
          .select()
          .from(topics)
          .where(and(eq(topics.subjectId, subject.id), eq(topics.slug, topic.id)))
          .limit(1);

        const topicWasCreated = !existingTopic[0];
        const topicRecord = existingTopic[0] ?? (await db.insert(topics).values({
          subjectId: subject.id,
          title: topic.title,
          slug: topic.id,
          description: topic.description ?? null,
          curriculumVersion: curriculumV1.version,
          examRelevance: topic.examRelevance?.[body.exam as "JAMB" | "WAEC" | "NECO"] ?? 1,
        }).returning())[0];

        if (!topicWasCreated) continue;

        for (const objective of topic.subtopics.flatMap((node) => node.objectives ?? [])) {
          await db.insert(learningObjectives).values({
            topicId: topicRecord.id,
            title: objective.title,
            description: objective.description,
          });
        }
      }
    }

    return NextResponse.json({
      studentId: student.id,
      examPreparationId: examPreparation.id,
    });
  } catch (error) {
    console.error("Student setup failed:", error);
    return NextResponse.json({ error: "Unable to create the student profile." }, { status: 500 });
  }
}

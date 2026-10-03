import { Curriculum, curriculumV1, Topic } from "../curriculum/model";
import { LearningPriority, TopicMastery, rankLearningPriorities } from "./mastery";

export type TopicProgress = {
  topicId: string;
  mastery: TopicMastery;
};

export function buildPrioritiesFromCurriculum(
  curriculum: Curriculum,
  progress: TopicProgress[],
  exam: "JAMB" | "WAEC" | "NECO",
): LearningPriority[] {
  const topics: TopicMastery[] = [];

  for (const subject of curriculum.subjects) {
    for (const topic of subject.topics) {
      const saved = progress.find((item) => item.topicId === topic.id);
      topics.push(saved?.mastery ?? {
        subject: subject.name,
        topic: topic.title,
        score: 0,
        level: "foundational",
        attempts: 0,
        correct: 0,
        recentAccuracy: 0,
      });
    }
  }

  const examWeights: Record<string, number> = {};
  for (const subject of curriculum.subjects) {
    for (const topic of subject.topics) {
      examWeights[`${subject.name}:${topic.title}`] = topic.examRelevance?.[exam] ?? 1;
    }
  }

  return rankLearningPriorities(topics, { examWeight: examWeights });
}

export function getDefaultCurriculum() {
  return curriculumV1;
}

export function getTopicById(topicId: string): Topic | undefined {
  for (const subject of curriculumV1.subjects) {
    const topic = subject.topics.find((item) => item.id === topicId);
    if (topic) return topic;
  }
  return undefined;
}
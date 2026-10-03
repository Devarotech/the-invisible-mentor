export type MasteryLevel = "foundational" | "developing" | "proficient";

export type TopicMastery = {
  subject: string;
  topic: string;
  score: number;
  level: MasteryLevel;
  attempts: number;
  correct: number;
  recentAccuracy: number;
};

export type LearningPriority = TopicMastery & {
  priorityScore: number;
  reason: string;
};

export function masteryLevel(score: number): MasteryLevel {
  if (score < 40) return "foundational";
  if (score < 70) return "developing";
  return "proficient";
}

export function calculateTopicMastery(
  subject: string,
  topic: string,
  attempts: { correct: boolean }[],
): TopicMastery {
  const attemptsCount = attempts.length;
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const recent = attempts.slice(-5);
  const recentCorrect = recent.filter((attempt) => attempt.correct).length;

  const accuracy = attemptsCount ? (correct / attemptsCount) * 100 : 0;
  const recentAccuracy = recent.length ? (recentCorrect / recent.length) * 100 : 0;

  // Recent performance matters more because it better reflects the student's current state.
  const score = Math.round(accuracy * 0.4 + recentAccuracy * 0.6);

  return {
    subject,
    topic,
    score,
    level: masteryLevel(score),
    attempts: attemptsCount,
    correct,
    recentAccuracy: Math.round(recentAccuracy),
  };
}

export function rankLearningPriorities(
  topics: TopicMastery[],
  options?: { examWeight?: Record<string, number> },
): LearningPriority[] {
  const examWeight = options?.examWeight ?? {};

  return topics
    .map((topic) => {
      const masteryGap = 100 - topic.score;
      const weight = examWeight[`${topic.subject}:${topic.topic}`] ?? 1;
      const priorityScore = Math.round(masteryGap * weight);

      const reason =
        topic.score < 40
          ? "Major mastery gap"
          : topic.score < 70
            ? "Needs more guided practice"
            : "Maintain with revision";

      return { ...topic, priorityScore, reason };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function buildDailyPlan(
  priorities: LearningPriority[],
  availableMinutes: number,
) {
  const minutes = Math.max(15, availableMinutes);
  const plan: { subject: string; topic: string; minutes: number; mode: string }[] = [];

  for (const priority of priorities) {
    if (plan.reduce((total, item) => total + item.minutes, 0) >= minutes) break;

    const remaining = minutes - plan.reduce((total, item) => total + item.minutes, 0);
    const allocation =
      priority.level === "foundational"
        ? Math.min(35, remaining)
        : priority.level === "developing"
          ? Math.min(25, remaining)
          : Math.min(15, remaining);

    plan.push({
      subject: priority.subject,
      topic: priority.topic,
      minutes: allocation,
      mode: priority.level === "foundational" ? "Learn + guided practice" : priority.level === "developing" ? "Practice + feedback" : "Spaced revision",
    });
  }

  return plan;
}

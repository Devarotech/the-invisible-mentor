import { buildDailyPlan, calculateTopicMastery, rankLearningPriorities } from "./mastery";

const quadratic = calculateTopicMastery(
  "Mathematics",
  "Quadratic Equations",
  [
    { correct: false },
    { correct: false },
    { correct: true },
    { correct: false },
    { correct: false },
  ],
);

const comprehension = calculateTopicMastery(
  "English",
  "Reading Comprehension",
  [
    { correct: true },
    { correct: true },
    { correct: true },
    { correct: true },
    { correct: false },
  ],
);

const priorities = rankLearningPriorities([quadratic, comprehension], {
  examWeight: {
    "Mathematics:Quadratic Equations": 1.5,
  },
});

const plan = buildDailyPlan(priorities, 60);

if (quadratic.level !== "foundational") {
  throw new Error("Quadratic equations should be foundational in this test.");
}

if (priorities[0].topic !== "Quadratic Equations") {
  throw new Error("The larger mastery gap should be prioritised.");
}

if (plan.reduce((total, item) => total + item.minutes, 0) > 60) {
  throw new Error("Daily plan exceeded available study time.");
}

console.log("Mastery engine tests passed.");

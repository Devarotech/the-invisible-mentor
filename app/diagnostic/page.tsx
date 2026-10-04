"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type Profile = {
  name: string;
  exam: string;
  subjects: string[];
  goal: string;
  studentId: string;
};

const questions = [
  {
    topicId: "math-linear-equations",
    subject: "Mathematics",
    question: "If 2x + 6 = 14, what is x?",
    options: ["2", "4", "6", "8"],
    answer: "4",
  },
  {
    topicId: "english-reading",
    subject: "English",
    question: "Choose the word closest in meaning to “rapid”.",
    options: ["Slow", "Quick", "Weak", "Quiet"],
    answer: "Quick",
  },
  {
    topicId: "physics-foundations",
    subject: "Physics",
    question: "Which quantity is measured in metres per second?",
    options: ["Force", "Energy", "Speed", "Mass"],
    answer: "Speed",
  },
  {
    topicId: "biology-cell-biology",
    subject: "Biology",
    question: "Which structure controls most activities of a cell?",
    options: ["Cell wall", "Nucleus", "Vacuole", "Ribosome"],
    answer: "Nucleus",
  },
];

export default function Diagnostic() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("invisible-mentor-profile");
    if (!raw) {
      router.replace("/onboarding");
      return;
    }
    setProfile(JSON.parse(raw));
  }, [router]);

  const visibleQuestions = useMemo(() => {
    if (!profile) return [];
    return questions.filter((question) => profile.subjects.includes(question.subject));
  }, [profile]);

  if (!profile) {
    return <main className="min-h-screen bg-slate-950 p-8 text-white">Preparing your diagnostic...</main>;
  }

  if (!visibleQuestions.length) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-bold">One more step</h1>
          <p className="mt-2 text-slate-400">This first diagnostic needs a supported core subject. We’ll expand the assessment bank as we build the learning engine.</p>
          <button onClick={() => router.push("/")} className="mt-6 rounded-full bg-blue-600 px-5 py-3 font-semibold">Return home</button>
        </div>
      </main>
    );
  }

  const question = visibleQuestions[current];

  function choose(option: string) {
    setAnswers((old) => ({ ...old, [current]: option }));
  }

  function finish() {
    setFinished(true);
    const score = visibleQuestions.reduce(
      (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
      0
    );

    const diagnostic = {
      score,
      total: visibleQuestions.length,
      completedAt: new Date().toISOString(),
      answers,
    };

    try {
      const response = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.studentId,
          exam: profile.exam,
          answers: visibleQuestions.map((item, index) => ({
            subject: item.subject,
            topicId: item.topicId,
            answer: answers[index],
            correctAnswer: item.answer,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Unable to save diagnostic");
      }

      const saved = await response.json();
      localStorage.setItem(
        "invisible-mentor-diagnostic",
        JSON.stringify({ ...diagnostic, ...saved }),
      );
    } catch (error) {
      console.error(error);
      setFinished(false);
      return;
    }
  }

  if (finished) {
    const score = visibleQuestions.reduce(
      (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
      0
    );

    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-2xl pt-12">
          <CheckCircle2 className="text-emerald-400" size={44} />
          <p className="mt-6 text-sm text-blue-400">DIAGNOSTIC COMPLETE</p>
          <h1 className="mt-2 text-4xl font-black">Nice start, {profile.name}.</h1>
          <p className="mt-4 text-slate-400">
            You answered {score} of {visibleQuestions.length} correctly. This is only a baseline — the mentor will keep learning from your practice.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold"
          >
            See my learning plan <ArrowRight size={18} />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-2xl pt-8 sm:pt-16">
        <p className="text-sm text-slate-400">Diagnostic · {profile.exam}</p>
        <div className="mt-3 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${((current + 1) / visibleQuestions.length) * 100}%` }} />
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-7 sm:p-9">
          <span className="text-sm font-medium text-blue-400">{question.subject}</span>
          <h1 className="mt-3 text-2xl font-bold leading-tight">{question.question}</h1>

          <div className="mt-8 grid gap-3">
            {question.options.map((option) => {
              const selected = answers[current] === option;
              return (
                <button
                  key={option}
                  onClick={() => choose(option)}
                  className={`rounded-2xl border p-4 text-left transition ${selected ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/30"}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              disabled={!answers[current]}
              onClick={() => (current === visibleQuestions.length - 1 ? finish() : setCurrent((value) => value + 1))}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {current === visibleQuestions.length - 1 ? "Finish diagnostic" : "Next"}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

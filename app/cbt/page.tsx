"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, CheckCircle2, Clock3, Flag, House, RotateCcw } from "lucide-react";

type Question = {
  id: number;
  subject: string;
  topic: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

const questions: Question[] = [
  { id: 1, subject: "English", topic: "Vocabulary", prompt: "Choose the word closest in meaning to “rapid”.", options: ["Slow", "Quick", "Weak", "Quiet"], answer: "Quick", explanation: "Rapid means happening or moving at great speed; quick is the closest synonym." },
  { id: 2, subject: "English", topic: "Grammar", prompt: "Choose the grammatically correct sentence.", options: ["She have finished her work.", "She has finished her work.", "She having finished her work.", "She were finished her work."], answer: "She has finished her work.", explanation: "The singular subject “she” takes “has” in the present perfect tense." },
  { id: 3, subject: "English", topic: "Parts of speech", prompt: "In “The bright sun rose,” which word is an adjective?", options: ["The", "bright", "sun", "rose"], answer: "bright", explanation: "“Bright” describes the noun “sun,” so it is an adjective." },
  { id: 4, subject: "Chemistry", topic: "Atoms", prompt: "Which particle has a negative electric charge?", options: ["Proton", "Neutron", "Electron", "Nucleus"], answer: "Electron", explanation: "Electrons carry a negative charge; protons are positive and neutrons are neutral." },
  { id: 5, subject: "Chemistry", topic: "Acids and bases", prompt: "A solution with a pH of 3 is best described as:", options: ["Acidic", "Neutral", "Alkaline", "A salt only"], answer: "Acidic", explanation: "At ordinary reference conditions, pH values below 7 are acidic." },
  { id: 6, subject: "Chemistry", topic: "Elements", prompt: "What is the chemical symbol for sodium?", options: ["So", "S", "Na", "N"], answer: "Na", explanation: "Sodium's symbol is Na, derived from its Latin name, natrium." },
  { id: 7, subject: "Physics", topic: "Speed", prompt: "A runner covers 100 metres in 20 seconds. What is the average speed?", options: ["2 m/s", "5 m/s", "20 m/s", "2000 m/s"], answer: "5 m/s", explanation: "Average speed = distance ÷ time = 100 ÷ 20 = 5 m/s." },
  { id: 8, subject: "Physics", topic: "SI units", prompt: "Which SI unit is used to measure force?", options: ["Joule", "Watt", "Newton", "Pascal"], answer: "Newton", explanation: "Force is measured in newtons (N)." },
  { id: 9, subject: "Physics", topic: "Energy", prompt: "Which instrument measures electric current?", options: ["Voltmeter", "Ammeter", "Thermometer", "Barometer"], answer: "Ammeter", explanation: "An ammeter measures electric current in a circuit." },
  { id: 10, subject: "Biology", topic: "Cell biology", prompt: "Which cell structure controls most activities of a typical cell?", options: ["Cell wall", "Nucleus", "Vacuole", "Ribosome"], answer: "Nucleus", explanation: "The nucleus contains genetic material and regulates many cell activities." },
  { id: 11, subject: "Biology", topic: "Photosynthesis", prompt: "Which gas is absorbed by green plants during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: "Carbon dioxide", explanation: "Plants use carbon dioxide and water, with light energy, to make glucose during photosynthesis." },
  { id: 12, subject: "Biology", topic: "Ecology", prompt: "An organism that makes its own food is called a:", options: ["Consumer", "Decomposer", "Producer", "Parasite"], answer: "Producer", explanation: "Producers, such as green plants, make organic food using light or chemical energy." },
];

const DURATION_SECONDS = 20 * 60;
const SUBJECTS = ["English", "Chemistry", "Physics", "Biology"];
const STORAGE_KEY = "invisible-mentor-cbt-demo-v1";

type SavedAttempt = { deadline: number; answers: Record<number, string>; bookmarks: number[]; submitted: boolean; };

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return [hours, minutes, secs].map((part) => String(part).padStart(2, "0")).join(":");
}

export default function CbtSimulatorPage() {
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [activeSubject, setActiveSubject] = useState("All");

  useEffect(() => {
    let saved: SavedAttempt | null = null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw) as SavedAttempt;
    } catch {
      saved = null;
    }

    if (saved?.submitted) {
      setAnswers(saved.answers ?? {});
      setBookmarks(saved.bookmarks ?? []);
      setDeadline(saved.deadline);
      setSubmitted(true);
    } else if (saved && saved.deadline > Date.now()) {
      setAnswers(saved.answers ?? {});
      setBookmarks(saved.bookmarks ?? []);
      setDeadline(saved.deadline);
    } else {
      const newDeadline = Date.now() + DURATION_SECONDS * 1000;
      setDeadline(newDeadline);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ deadline: newDeadline, answers: {}, bookmarks: [], submitted: false }));
    }
    setNow(Date.now());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || submitted || deadline === null) return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, [ready, submitted, deadline]);

  const remaining = deadline === null ? DURATION_SECONDS : Math.max(0, Math.ceil((deadline - now) / 1000));
  const currentQuestion = questions[current];
  const correctCount = questions.reduce((total, question) => total + (answers[question.id] === question.answer ? 1 : 0), 0);
  const answeredCount = Object.keys(answers).filter((id) => questions.some((question) => question.id === Number(id))).length;

  const persist = useCallback((nextAnswers: Record<number, string>, nextBookmarks: number[], nextSubmitted = submitted) => {
    if (deadline === null) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ deadline, answers: nextAnswers, bookmarks: nextBookmarks, submitted: nextSubmitted }));
  }, [deadline, submitted]);

  const finish = useCallback((automatic = false) => {
    setSubmitted(true);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ deadline, answers, bookmarks, submitted: true }));
    if (automatic) setNow(Date.now());
  }, [deadline, answers, bookmarks]);

  useEffect(() => {
    if (ready && !submitted && deadline !== null && remaining <= 0) finish(true);
  }, [ready, submitted, deadline, remaining, finish]);

  function selectAnswer(option: string) {
    const next = { ...answers, [currentQuestion.id]: option };
    setAnswers(next);
    persist(next, bookmarks);
  }

  function toggleBookmark() {
    const next = bookmarks.includes(currentQuestion.id)
      ? bookmarks.filter((id) => id !== currentQuestion.id)
      : [...bookmarks, currentQuestion.id];
    setBookmarks(next);
    persist(answers, next);
  }

  function resetAttempt() {
    const newDeadline = Date.now() + DURATION_SECONDS * 1000;
    setCurrent(0);
    setAnswers({});
    setBookmarks([]);
    setSubmitted(false);
    setDeadline(newDeadline);
    setNow(Date.now());
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ deadline: newDeadline, answers: {}, bookmarks: [], submitted: false }));
  }

  if (!ready) return <main className="min-h-screen bg-slate-50 p-6 text-slate-900">Preparing your exam…</main>;

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft size={16} /> Back to dashboard</Link>
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={30} /></div>
            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-emerald-700">Mock exam completed</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Good effort. Keep improving.</h1>
            <p className="mt-3 text-slate-600">This is a demonstration question set, not an official JAMB paper.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Score</p><p className="mt-1 text-3xl font-black">{Math.round((correctCount / questions.length) * 100)}%</p></div>
              <div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Correct</p><p className="mt-1 text-3xl font-black">{correctCount}<span className="text-base font-medium text-slate-400"> / {questions.length}</span></p></div>
              <div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Unanswered</p><p className="mt-1 text-3xl font-black">{questions.length - answeredCount}</p></div>
            </div>
            <h2 className="mt-9 text-xl font-bold">Review your answers</h2>
            <div className="mt-4 space-y-4">
              {questions.map((question) => {
                const isCorrect = answers[question.id] === question.answer;
                return <article key={question.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">{question.subject} · {question.topic}</span><span className={isCorrect ? "text-sm font-bold text-emerald-700" : "text-sm font-bold text-rose-700"}>{isCorrect ? "Correct" : "Review needed"}</span></div>
                  <p className="mt-2 font-semibold">{question.id}. {question.prompt}</p>
                  <p className="mt-2 text-sm text-slate-600">Your answer: {answers[question.id] ?? "Not answered"}</p>
                  <p className="text-sm text-emerald-800">Correct answer: {question.answer}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{question.explanation}</p>
                </article>;
              })}
            </div>
            <button onClick={resetAttempt} className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"><RotateCcw size={17} /> Try again</button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3"><Link href="/dashboard" aria-label="Back to dashboard" className="rounded-full p-2 hover:bg-slate-100"><ArrowLeft size={20} /></Link><div><p className="font-bold">JAMB CBT Simulator</p><p className="text-xs text-slate-500">Practice mode · Demo paper</p></div></div>
          <div className={remaining < 120 ? "flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 font-mono font-bold text-rose-700" : "flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 font-mono font-bold"}><Clock3 size={18} />{formatTime(remaining)}</div>
          <button onClick={() => { if (window.confirm("Submit your mock exam now? You will not be able to change your answers after submission.")) finish(); }} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600">Submit exam</button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-5">
            {["All", ...SUBJECTS].map((subject) => <button key={subject} onClick={() => setActiveSubject(subject)} className={activeSubject === subject ? "rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white" : "rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"}>{subject}</button>)}
          </div>
          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">Question {current + 1} of {questions.length}</p>
            <button onClick={toggleBookmark} className={bookmarks.includes(currentQuestion.id) ? "inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700" : "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"}><Bookmark size={17} fill={bookmarks.includes(currentQuestion.id) ? "currentColor" : "none"} />{bookmarks.includes(currentQuestion.id) ? "Bookmarked" : "Bookmark"}</button>
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-orange-600">{currentQuestion.subject} · {currentQuestion.topic}</p>
          <h1 className="mt-3 max-w-3xl text-xl font-bold leading-relaxed sm:text-2xl">{currentQuestion.prompt}</h1>
          <div className="mt-7 grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const selected = answers[currentQuestion.id] === option;
              return <button key={option} onClick={() => selectAnswer(option)} className={selected ? "flex items-start gap-3 rounded-2xl border-2 border-orange-500 bg-orange-50 p-4 text-left" : "flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-left hover:border-slate-400 hover:bg-slate-50"}>
                <span className={selected ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white" : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-sm font-bold text-slate-600"}>{String.fromCharCode(65 + index)}</span>
                <span className="pt-1 font-medium">{option}</span>
              </button>;
            })}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <button disabled={current === 0} onClick={() => setCurrent((value) => Math.max(0, value - 1))} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <button onClick={() => setCurrent((value) => Math.min(questions.length - 1, value + 1))} disabled={current === questions.length - 1} className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">Next question</button>
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">Question palette</h2>
          <p className="mt-1 text-sm text-slate-500">{answeredCount} of {questions.length} answered</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {questions.map((question, index) => <button key={question.id} onClick={() => setCurrent(index)} aria-label={`Go to question ${question.id}`} className={current === index ? "relative h-11 rounded-xl border-2 border-slate-950 bg-slate-950 font-bold text-white" : answers[question.id] ? "relative h-11 rounded-xl bg-emerald-100 font-bold text-emerald-800" : "relative h-11 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"}>{question.id}{bookmarks.includes(question.id) && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500" />}</button>)}
          </div>
          <div className="mt-5 space-y-2 text-xs text-slate-500"><p>🟩 Answered</p><p>⬜ Not answered</p><p>🟠 Bookmarked for review</p></div>
          <div className="mt-6 rounded-2xl bg-orange-50 p-4"><p className="font-bold text-orange-900">Before you submit</p><p className="mt-1 text-sm leading-5 text-orange-800">{questions.length - answeredCount} question(s) are unanswered. You can revisit them using the question palette.</p></div>
          <p className="mt-4 text-xs leading-5 text-slate-400"><Flag size={13} className="mr-1 inline" />Demo only: answers are saved in this browser tab. Database-backed exam history will be added after this UI is tested.</p>
        </aside>
      </div>
    </main>
  );
}

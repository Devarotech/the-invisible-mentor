"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = ["About you", "Your exam", "Subjects", "Your goal"];
const subjects = ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics"];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [exam, setExam] = useState("JAMB");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");

  const canContinue = useMemo(() => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 2) return selectedSubjects.length >= 1;
    if (step === 3) return goal.trim().length >= 3;
    return true;
  }, [step, name, selectedSubjects, goal]);

  function toggleSubject(subject: string) {
    setSelectedSubjects((current) =>
      current.includes(subject)
        ? current.filter((item) => item !== subject)
        : [...current, subject]
    );
  }

  async function continueStep() {
    if (!canContinue) {
      setError(step === 0 ? "Please enter your name." : step === 2 ? "Choose at least one subject." : "Tell your mentor what you want to achieve.");
      return;
    }
    setError("");

    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    const profile = {
      name: name.trim(),
      exam,
      subjects: selectedSubjects,
      goal: goal.trim(),
      createdAt: new Date().toISOString(),
      onboardingVersion: 1,
    };

    try {
      const response = await fetch("/api/student/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "We could not save your profile. Please try again.");
        return;
      }

      localStorage.setItem(
        "invisible-mentor-profile",
        JSON.stringify({ ...profile, studentId: data.studentId }),
      );
      router.push("/diagnostic");
    } catch {
      setError("We could not reach the learning service. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
          ← The Invisible Mentor
        </Link>

        <div className="mt-12 flex gap-2">
          {steps.map((item, index) => (
            <div
              key={item}
              className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-blue-500" : "bg-white/10"}`}
            />
          ))}
        </div>

        <p className="mt-5 text-sm text-slate-400">
          Step {step + 1} of {steps.length} · {steps[step]}
        </p>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-7 sm:p-9">
          {step === 0 && (
            <>
              <h1 className="text-3xl font-bold">Let’s get to know you.</h1>
              <p className="mt-2 text-slate-400">Your mentor needs a little context before teaching you.</p>
              <label className="mt-8 block text-sm font-medium text-slate-300">Your name</label>
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="What should we call you?"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-4 outline-none ring-blue-500 transition focus:ring-2"
              />
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-3xl font-bold">Which exam are you preparing for?</h1>
              <p className="mt-2 text-slate-400">You can change this later if your plan changes.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["JAMB", "WAEC", "NECO"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setExam(item)}
                    className={`rounded-2xl border p-5 text-left transition ${exam === item ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/30"}`}
                  >
                    <span className="font-bold">{item}</span>
                    <span className="mt-1 block text-xs text-slate-400">Build my preparation around this exam</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-3xl font-bold">What subjects are you taking?</h1>
              <p className="mt-2 text-slate-400">Pick every subject you want your mentor to track.</p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {subjects.map((subject) => {
                  const selected = selectedSubjects.includes(subject);
                  return (
                    <button
                      type="button"
                      key={subject}
                      onClick={() => toggleSubject(subject)}
                      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${selected ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/30"}`}
                    >
                      <span>{subject}</span>
                      {selected && <Check size={17} className="text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-3xl font-bold">What do you want to achieve?</h1>
              <p className="mt-2 text-slate-400">Your goal helps the mentor understand where you are going.</p>
              <textarea
                autoFocus
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="For example: I want to study Computer Science and score 300+ in JAMB."
                className="mt-8 min-h-40 w-full rounded-2xl border border-white/10 bg-white/5 p-4 outline-none ring-blue-500 transition focus:ring-2"
              />
            </>
          )}

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

          <div className="mt-10 flex justify-between gap-3">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => {
                setError("");
                setStep((current) => Math.max(0, current - 1));
              }}
              className="rounded-full border border-white/10 px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-30"
            >
              Back
            </button>

            <button
              type="button"
              onClick={continueStep}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              {step === 3 ? "Start diagnostic" : "Continue"}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

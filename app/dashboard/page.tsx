"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrainCircuit, CalendarDays, Target } from "lucide-react";

type Profile = { name: string; exam: string; subjects: string[]; goal: string; studentId: string };
type Diagnostic = { score: number; total: number };
type Learning = {
  priorities: { subject: string; topic: string; score: number; level: string; reason: string }[];
  dailyPlan: { subject: string; topic: string; minutes: number; mode: string }[];
};

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [learning, setLearning] = useState<Learning | null>(null);

  useEffect(() => {
    const profileRaw = localStorage.getItem("invisible-mentor-profile");
    const diagnosticRaw = localStorage.getItem("invisible-mentor-diagnostic");
    if (profileRaw) setProfile(JSON.parse(profileRaw));
    if (diagnosticRaw) setDiagnostic(JSON.parse(diagnosticRaw));
  }, []);

  useEffect(() => {
    if (!profile?.studentId) return;

    fetch(
      `/api/student/dashboard?studentId=${encodeURIComponent(profile.studentId)}&exam=${encodeURIComponent(profile.exam)}`,
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load dashboard");
        return response.json();
      })
      .then((data) => setLearning(data))
      .catch((error) => console.error(error));
  }, [profile]);

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <Link href="/onboarding" className="text-blue-400">Start onboarding →</Link>
      </main>
    );
  }

  const score = diagnostic ? Math.round((diagnostic.score / diagnostic.total) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-bold">The Invisible Mentor<span className="text-blue-600">.</span></Link>
          <span className="text-sm text-slate-500">{profile.exam} preparation</span>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm font-medium text-blue-600">YOUR LEARNING CENTRE</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Good morning, {profile.name} 👋</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Your mentor is starting with what we know about you and will refine the plan as you learn.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <BrainCircuit className="text-blue-400" />
            <p className="mt-6 text-sm text-slate-400">Diagnostic baseline</p>
            <p className="mt-1 text-3xl font-black">{score}%</p>
            <p className="mt-2 text-sm text-slate-400">Not a final ability score. We keep updating it.</p>
          </div>

          <div className="rounded-3xl border bg-white p-6">
            <Target className="text-blue-600" />
            <p className="mt-6 text-sm text-slate-500">Subjects tracked</p>
            <p className="mt-1 text-3xl font-black">{profile.subjects.length}</p>
            <p className="mt-2 text-sm text-slate-500">{profile.subjects.join(" · ")}</p>
          </div>

          <div className="rounded-3xl border bg-white p-6">
            <CalendarDays className="text-blue-600" />
            <p className="mt-6 text-sm text-slate-500">Next action</p>
            <p className="mt-1 text-xl font-black">
              {learning?.dailyPlan[0]?.topic ?? "Building your plan"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Your next activity is ranked from the learning data we have so far.
            </p>
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-7">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Focus next</p>
            <div className="mt-5 space-y-3">
              {learning?.priorities.slice(0, 3).map((item) => (
                <div key={`${item.subject}-${item.topic}`} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold">{item.topic}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.subject} · {item.score}% mastery · {item.reason}
                  </p>
                </div>
              ))}
              {!learning && <p className="text-slate-500">Loading your personalized priorities…</p>}
              {learning?.priorities.length === 0 && (
                <p className="text-slate-500">
                  Complete more diagnostic and practice questions to unlock topic priorities.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-7">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Today’s plan</p>
            <div className="mt-5 space-y-3">
              {learning?.dailyPlan.map((item, index) => (
                <div
                  key={`${item.subject}-${item.topic}-${index}`}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-bold">{item.topic}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.mode}</p>
                  </div>
                  <span className="font-bold text-blue-600">{item.minutes}m</span>
                </div>
              ))}
              {!learning && <p className="text-slate-500">Building your plan…</p>}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border bg-white p-7">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Your goal</p>
          <p className="mt-3 text-lg text-slate-700">{profile.goal}</p>
        </section>
      </div>
    </main>
  );
}

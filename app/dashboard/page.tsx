"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrainCircuit, CalendarDays, Target } from "lucide-react";

type Profile = { name: string; exam: string; subjects: string[]; goal: string };
type Diagnostic = { score: number; total: number };

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);

  useEffect(() => {
    const profileRaw = localStorage.getItem("invisible-mentor-profile");
    const diagnosticRaw = localStorage.getItem("invisible-mentor-diagnostic");
    if (profileRaw) setProfile(JSON.parse(profileRaw));
    if (diagnosticRaw) setDiagnostic(JSON.parse(diagnosticRaw));
  }, []);

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
            <p className="mt-1 text-xl font-black">Start a focused lesson</p>
            <p className="mt-2 text-sm text-slate-500">The next version will rank this from mastery, prerequisites and exam date.</p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border bg-white p-7">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Your goal</p>
          <p className="mt-3 text-lg text-slate-700">{profile.goal}</p>
        </section>
      </div>
    </main>
  );
}

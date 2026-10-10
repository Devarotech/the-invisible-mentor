import Link from "next/link";
import { ArrowRight, BrainCircuit, CalendarDays, ClipboardCheck, Sparkles, Target } from "lucide-react";

const pillars = [
  ["Learns you", "Builds a living picture of what you know and what you need next.", BrainCircuit],
  ["Adapts to you", "Turns assessment and practice into a changing study plan.", Target],
  ["Keeps you on track", "Connects your time and exam date to realistic daily actions.", CalendarDays],
] as const;

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <b className="text-lg">The Invisible Mentor<span className="text-blue-600">.</span></b>
        <Link href="/onboarding" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">Start learning</Link>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"><Sparkles size={15} />Personal AI study mentor</div>
          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">Study with a mentor that gets better at helping you.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Personalised preparation for WAEC, NECO and JAMB through assessment, adaptive study plans, practice and exam simulations.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white hover:bg-blue-700">Build my study plan <ArrowRight size={18} /></Link>
            <Link href="/cbt" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-900 hover:bg-slate-50"><ClipboardCheck size={18} />Try CBT simulator</Link>
          </div>
        </div>

        <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl">
          <p className="text-sm text-slate-400">Good morning, Amina 👋</p>
          <h2 className="mt-2 text-2xl font-bold">Here’s what you need today.</h2>
          {["Mathematics · Quadratic equations", "Biology · Cell structure", "English · Reading comprehension"].map((item, index) => (
            <div key={item} className="mt-3 flex justify-between gap-3 rounded-2xl bg-white/10 p-4"><span className="font-semibold">{item}</span><span className="shrink-0 text-xs text-slate-400">{index ? "Practice" : "Priority gap"}</span></div>
          ))}
          <Link href="/cbt" className="mt-5 flex items-center justify-between rounded-2xl bg-orange-500 px-4 py-3 font-bold hover:bg-orange-600"><span>Start a practice exam</span><ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">The difference</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold">Not another question bank. A learning system built around the student.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pillars.map(([title, description, Icon]) => <div key={title} className="rounded-3xl border p-6"><Icon className="text-blue-600" /><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>)}
          </div>
        </div>
      </section>
    </main>
  );
}

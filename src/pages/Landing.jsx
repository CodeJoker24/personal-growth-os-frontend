import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare, Code2, BookOpen, PenLine, Wallet, Target, Timer, Award,
  ArrowRight, Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui.jsx';

const FEATURES = [
  { icon: CheckSquare, name: 'Habits', desc: 'Build streaks that stick, with a 28-day activity heatmap.' },
  { icon: Code2, name: 'Coding', desc: 'Track projects, skills, and bugs solved as you grow.' },
  { icon: BookOpen, name: 'Study', desc: 'Plan subjects and topics, log hours, hit target scores.' },
  { icon: PenLine, name: 'Journal', desc: 'Daily reflection — what worked, what to fix tomorrow.' },
  { icon: Wallet, name: 'Finance', desc: 'Income, expenses, and where your money actually goes.' },
  { icon: Target, name: 'Goals', desc: 'Long-term targets with deadlines and progress bars.' },
  { icon: Timer, name: 'Focus Timer', desc: 'A Pomodoro timer you fully control, down to the second.' },
  { icon: Award, name: 'Achievements', desc: '10 badges that unlock automatically as you grow.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-panel text-textPrimary">
      <nav className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <p className="font-mono text-copper text-xs tracking-[0.2em] uppercase">Personal Growth OS</p>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-textDim hover:text-textPrimary">Sign in</Link>
          <Link to="/register">
            <Button className="text-sm">Get started</Button>
          </Link>
        </div>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-copper bg-copper/10 px-3 py-1.5 rounded-full mb-6">
          <Sparkles size={13} /> Your life, one dashboard
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
          A command center for<br />building the life you want
        </h1>
        <p className="text-textDim text-base md:text-lg mt-5 max-w-xl mx-auto">
          Habits, coding progress, study plans, journaling, and finances — tracked in one place,
          not scattered across five apps you stop using after a week.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to="/register">
            <Button className="flex items-center gap-2 text-sm px-5 py-3">
              Start for free <ArrowRight size={15} />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" className="text-sm px-5 py-3">I already have an account</Button>
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.name} className="bg-panelRaised border border-panelBorder rounded-2xl p-5">
                <div className="w-9 h-9 rounded-xl bg-copper/10 flex items-center justify-center mb-3">
                  <Icon size={17} className="text-copper" />
                </div>
                <p className="font-medium text-sm">{f.name}</p>
                <p className="text-xs text-textDim mt-1 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-panelBorder text-center text-xs text-textDim">
        Built for people who want to see the whole picture, not just today's to-do list.
      </footer>
    </div>
  );
}

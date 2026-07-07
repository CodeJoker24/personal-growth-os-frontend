import React from 'react';
import {
  Flame, Award, Bug, Sparkles, GraduationCap, BookText, PiggyBank,
  Receipt, Timer, Rocket, Lock,
} from 'lucide-react';
import { Card, SectionLabel } from './ui.jsx';

function computeBadges({ habits, projects, skills, subjects, journalEntries, txns }) {
  const focusSessions = Number(localStorage.getItem('pgos_focus_sessions') || '0');
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.current_streak), 0);
  const totalBugs = projects.reduce((sum, p) => sum + (p.bugs_solved || 0), 0);
  const maxSkill = skills.reduce((max, s) => Math.max(max, s.percentage), 0);
  const anySubjectComplete = subjects.some((s) => s.completion >= 100);
  const balance = txns.reduce(
    (sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
    0
  );

  return [
    {
      icon: Rocket,
      name: 'First Steps',
      description: 'Create your first habit.',
      earned: habits.length >= 1,
    },
    {
      icon: Flame,
      name: 'Week Warrior',
      description: 'Reach a 7-day streak on any habit.',
      earned: maxStreak >= 7,
    },
    {
      icon: Award,
      name: 'Iron Streak',
      description: 'Reach a 30-day streak on any habit.',
      earned: maxStreak >= 30,
    },
    {
      icon: Bug,
      name: 'Bug Hunter',
      description: 'Solve 10 or more bugs across your projects.',
      earned: totalBugs >= 10,
    },
    {
      icon: Sparkles,
      name: 'Skill Builder',
      description: 'Get any tracked skill to 50%.',
      earned: maxSkill >= 50,
    },
    {
      icon: GraduationCap,
      name: 'Scholar',
      description: 'Complete 100% of topics in a study subject.',
      earned: anySubjectComplete,
    },
    {
      icon: BookText,
      name: 'Journalist',
      description: 'Write 5 or more journal entries.',
      earned: journalEntries >= 5,
    },
    {
      icon: PiggyBank,
      name: 'Saver',
      description: 'Reach a positive balance of ₦10,000 or more.',
      earned: balance >= 10000,
    },
    {
      icon: Receipt,
      name: 'Budget Boss',
      description: 'Log 10 or more finance transactions.',
      earned: txns.length >= 10,
    },
    {
      icon: Timer,
      name: 'Deep Work',
      description: 'Complete 5 focus timer sessions.',
      earned: focusSessions >= 5,
    },
  ];
}

export default function Achievements({ habits = [], projects = [], skills = [], subjects = [], journalEntries = 0, txns = [] }) {
  const badges = computeBadges({ habits, projects, skills, subjects, journalEntries, txns });
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Achievements</SectionLabel>
        <span className="text-xs font-mono text-textDim">{earnedCount}/{badges.length}</span>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div key={badge.name} className="flex flex-col items-center text-center group relative" title={badge.description}>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1.5 transition ${
                  badge.earned ? 'bg-copper/15 text-copper' : 'bg-panel text-textDim/40'
                }`}
              >
                {badge.earned ? <Icon size={18} /> : <Lock size={15} />}
              </div>
              <span className={`text-[10px] leading-tight ${badge.earned ? 'text-textPrimary' : 'text-textDim/50'}`}>
                {badge.name}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

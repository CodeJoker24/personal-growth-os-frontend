import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import { Flame, CheckSquare, BookOpen, FolderKanban, Wallet, Sparkles } from 'lucide-react';
import client from '../api/client';
import { Card, SectionLabel, Dial } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import FocusTimer from '../components/FocusTimer.jsx';
import StreakHeatmap from '../components/StreakHeatmap.jsx';
import Achievements from '../components/Achievements.jsx';
import WeeklyReport from '../components/WeeklyReport.jsx';

const PIE_COLORS = ['#D97757', '#5FBF9F', '#E0A93B', '#8A5440', '#6B7A99', '#B85C7A'];

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 ${accent.bg}`} />
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent.bg} ${accent.bgOpacity}`}>
          <Icon size={14} className={accent.text} />
        </div>
        <SectionLabel>{label}</SectionLabel>
      </div>
      <p className={`font-mono text-2xl font-semibold ${accent.text}`}>{value}</p>
      {sub && <p className="text-xs text-textDim mt-1">{sub}</p>}
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [habits, setHabits] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [txns, setTxns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [journalCount, setJournalCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      client.get('/dashboard'),
      client.get('/habits'),
      client.get('/study/subjects'),
      client.get('/finance/summary'),
      client.get('/coding/projects?limit=100'),
      client.get('/coding/skills'),
      client.get('/journal?limit=1'),
    ])
      .then(([d, h, s, f, p, sk, j]) => {
        setSummary(d.data);
        setHabits(h.data);
        setSubjects(s.data);
        setTxns(f.data);
        setProjects(p.data.data);
        setSkills(sk.data);
        setJournalCount(j.data.pagination.total);
      })
      .catch(() => setError('Could not load dashboard. Is the backend running?'));
  }, []);

  // Local reminder: while this tab is open, check periodically whether it's past
  // the user's chosen reminder hour and today's habits aren't all done yet.
  useEffect(() => {
    const check = () => {
      const enabled = localStorage.getItem('pgos_reminder_enabled') === 'true';
      if (!enabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      if (!summary) return;

      const reminderHour = Number(localStorage.getItem('pgos_reminder_hour') || '20');
      const now = new Date();
      const todayIso = now.toISOString().slice(0, 10);
      const lastNotified = localStorage.getItem('pgos_last_reminder_date');

      if (now.getHours() >= reminderHour && lastNotified !== todayIso && summary.habits.completed < summary.habits.total) {
        new Notification('Personal Growth OS', {
          body: `You've completed ${summary.habits.completed}/${summary.habits.total} habits today — still time to close the gap.`,
        });
        localStorage.setItem('pgos_last_reminder_date', todayIso);
      }
    };

    check();
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [summary]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Weekly activity: how many habits were completed each of the last 7 days
  const weeklyData = (() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const count = habits.reduce((sum, h) => {
        const hit = h.completions?.some((c) => new Date(c).toISOString().slice(0, 10) === iso);
        return sum + (hit ? 1 : 0);
      }, 0);
      out.push({ day: d.toLocaleDateString(undefined, { weekday: 'short' }), completed: count });
    }
    return out;
  })();

  const studyChartData = subjects.map((s) => ({ subject: s.subject, hours: Number(s.study_hours) }));

  const financeChartData = (() => {
    const now = new Date();
    const thisMonth = txns.filter((t) => {
      const d = new Date(t.txn_date);
      return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const byCategory = {};
    thisMonth.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  })();

  return (
    <div className="max-w-md md:max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-24 md:pb-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] text-textDim uppercase tracking-[0.14em]">{today}</p>
          <h1 className="font-display text-xl md:text-2xl font-semibold mt-1">
            {greeting}{user ? `, ${user.full_name?.split(' ')[0] || user.username}` : ''}
          </h1>
        </div>
        <Sparkles className="text-copper/60" size={22} />
      </div>

      {error && (
        <Card className="mb-4 border-red-400/30">
          <p className="text-sm text-red-400">{error}</p>
        </Card>
      )}

      {!summary && !error && <p className="text-textDim text-sm">Loading your dashboard…</p>}

      {summary && (
        <div className="space-y-4">
          {/* Hero score card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-panelRaised via-panelRaised to-copper/10">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-40 h-40 bg-copper/10 rounded-full blur-3xl pulse-glow" />
            </div>
            <div className="relative flex items-center gap-6">
              <Dial value={summary.daily_score} size={110} color="#D97757" />
              <div>
                <SectionLabel>Daily Score</SectionLabel>
                <p className="text-sm text-textDim leading-relaxed max-w-xs">
                  A live blend of habit completion, journaling, and study hours today.
                  {summary.daily_score >= 70
                    ? ' Strong day — keep the momentum.'
                    : summary.daily_score >= 40
                    ? " Decent start — there's still time to push it higher today."
                    : ' Slow start — one small win now changes the whole score.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Stat row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={CheckSquare}
              label="Habits Today"
              value={`${summary.habits.completed}/${summary.habits.total}`}
              sub={`${summary.habits.percentage}% complete`}
              accent={{ text: 'text-copper', bg: 'bg-copper', bgOpacity: 'bg-opacity-15' }}
            />
            <StatCard
              icon={Flame}
              label="Coding Streak"
              value={`${summary.coding_streak}d`}
              sub="longest active streak"
              accent={{ text: 'text-mint', bg: 'bg-mint', bgOpacity: 'bg-opacity-15' }}
            />
            <StatCard
              icon={BookOpen}
              label="Study Hours"
              value={summary.study_hours_week}
              sub="logged total"
              accent={{ text: 'text-warnAmber', bg: 'bg-warnAmber', bgOpacity: 'bg-opacity-15' }}
            />
            <StatCard
              icon={FolderKanban}
              label="Projects"
              value={summary.projects.count}
              sub={`avg ${summary.projects.avg_progress}% progress`}
              accent={{ text: 'text-copper', bg: 'bg-copper', bgOpacity: 'bg-opacity-15' }}
            />
          </div>

          <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
            {/* Weekly activity chart */}
            <Card>
              <SectionLabel>Weekly Habit Activity</SectionLabel>
              <div className="h-40 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-panel-border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: 'rgb(var(--color-text-dim))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: 'rgb(var(--color-text-dim))', fontSize: 11 }} axisLine={false} tickLine={false} width={20} />
                    <Tooltip
                      contentStyle={{ background: 'rgb(var(--color-panel-raised))', border: '1px solid rgb(var(--color-panel-border))', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: 'rgb(var(--color-text-primary))' }}
                    />
                    <Bar dataKey="completed" fill="#D97757" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Study hours by subject */}
            <Card>
              <SectionLabel>Study Hours by Subject</SectionLabel>
              {studyChartData.length === 0 ? (
                <p className="text-sm text-textDim mt-4">Add subjects on the Study tab to see this chart.</p>
              ) : (
                <div className="h-40 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studyChartData} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-panel-border))" horizontal={false} />
                      <XAxis type="number" tick={{ fill: 'rgb(var(--color-text-dim))', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="subject" type="category" tick={{ fill: 'rgb(var(--color-text-dim))', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                      <Tooltip
                        contentStyle={{ background: 'rgb(var(--color-panel-raised))', border: '1px solid rgb(var(--color-panel-border))', borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: 'rgb(var(--color-text-primary))' }}
                      />
                      <Bar dataKey="hours" fill="#E0A93B" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <Achievements
            habits={habits}
            projects={projects}
            skills={skills}
            subjects={subjects}
            journalEntries={journalCount}
            txns={txns}
          />

          <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
            <FocusTimer />
            <StreakHeatmap habits={habits} />
          </div>

          <WeeklyReport />

          <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
            {/* Finance breakdown */}
            <Card>
              <SectionLabel>Spending Breakdown (This Month)</SectionLabel>
              <div className="flex items-center gap-2 mb-3 mt-2">
                <Wallet size={14} className="text-copper" />
                <span className="font-mono text-copper text-lg">₦{summary.finance.balance.toLocaleString()}</span>
                <span className="text-xs text-textDim">balance</span>
              </div>
              {financeChartData.length === 0 ? (
                <p className="text-sm text-textDim">No expenses logged this month yet.</p>
              ) : (
                <div className="h-44 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={financeChartData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={62} paddingAngle={3}>
                        {financeChartData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'rgb(var(--color-panel-raised))', border: '1px solid rgb(var(--color-panel-border))', borderRadius: 8, fontSize: 12 }}
                        formatter={(value, name) => [`₦${value.toLocaleString()}`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-1.5 pr-1">
                    {financeChartData.map((c, i) => (
                      <div key={c.name} className="flex items-center gap-1.5 text-[11px] text-textDim">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {c.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Recent journal */}
            <Card>
              <SectionLabel>Recent Journal</SectionLabel>
              {summary.recent_journal.length === 0 && (
                <p className="text-sm text-textDim mt-2">No entries yet. Write your first one from the Journal tab.</p>
              )}
              <div className="space-y-3 mt-2">
                {summary.recent_journal.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-copper/40 pl-3">
                    <p className="text-xs text-textDim">
                      {new Date(entry.entry_date).toLocaleDateString()} · {entry.mood || 'no mood set'}
                    </p>
                    <p className="text-sm text-textPrimary">{entry.went_well || 'No notes for this entry.'}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, CalendarDays } from 'lucide-react';
import client from '../api/client';
import { Card, SectionLabel } from './ui.jsx';

function Delta({ current, previous }) {
  if (previous === 0 && current === 0) return <Minus size={13} className="text-textDim" />;
  const diff = current - previous;
  if (diff > 0) return <span className="flex items-center gap-1 text-mint text-xs"><TrendingUp size={13} /> +{diff}</span>;
  if (diff < 0) return <span className="flex items-center gap-1 text-red-400 text-xs"><TrendingDown size={13} /> {diff}</span>;
  return <span className="flex items-center gap-1 text-textDim text-xs"><Minus size={13} /> no change</span>;
}

export default function WeeklyReport() {
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('weekly');

  useEffect(() => {
    client.get(`/reports/${period}`).then((res) => setReport(res.data));
  }, [period]);

  if (!report) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>
          <span className="inline-flex items-center gap-1.5"><CalendarDays size={12} /> Report</span>
        </SectionLabel>
        <div className="flex gap-1">
          {['weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-[10px] px-2 py-1 rounded-md capitalize ${
                period === p ? 'bg-panel text-textPrimary border border-panelBorder' : 'text-textDim'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-textDim">Habit completions</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-lg">{report.habit_completions.current}</span>
            <Delta current={report.habit_completions.current} previous={report.habit_completions.previous} />
          </div>
        </div>
        <div>
          <p className="text-xs text-textDim">Journal entries</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-lg">{report.journal_entries.current}</span>
            <Delta current={report.journal_entries.current} previous={report.journal_entries.previous} />
          </div>
        </div>
        <div>
          <p className="text-xs text-textDim">Money saved</p>
          <p className={`font-mono text-lg ${report.finance.saved >= 0 ? 'text-mint' : 'text-red-400'}`}>
            ₦{report.finance.saved.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-textDim">Longest streak ever</p>
          <p className="font-mono text-lg text-copper">{report.longest_ever_streak}d</p>
        </div>
      </div>

      {(report.best_day || report.worst_day) && (
        <div className="mt-4 pt-3 border-t border-panelBorder flex justify-between text-xs">
          {report.best_day && (
            <span className="text-textDim">
              Best day: <span className="text-textPrimary">{new Date(report.best_day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span> ({report.best_day.completions} done)
            </span>
          )}
          {report.worst_day && (
            <span className="text-textDim">
              Slowest: <span className="text-textPrimary">{new Date(report.worst_day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

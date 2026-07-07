import React from 'react';
import { Card, SectionLabel } from './ui.jsx';

// Builds a 28-day grid (4 weeks x 7 days) showing how many habits were completed
// each day, colored by intensity - like a GitHub contribution graph.
export default function StreakHeatmap({ habits }) {
  const days = 28;
  const today = new Date();
  const cells = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const count = habits.reduce((sum, h) => {
      const hit = h.completions?.some((c) => new Date(c).toISOString().slice(0, 10) === iso);
      return sum + (hit ? 1 : 0);
    }, 0);
    cells.push({ date: d, iso, count });
  }

  const maxCount = Math.max(1, ...cells.map((c) => c.count));

  const colorFor = (count) => {
    if (count === 0) return 'rgb(var(--color-panel-border))';
    const intensity = count / maxCount;
    if (intensity > 0.75) return '#D97757';
    if (intensity > 0.5) return '#C56A4E';
    if (intensity > 0.25) return '#8A5440';
    return '#4A3830';
  };

  // group into weeks (columns), 7 rows each
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <Card>
      <SectionLabel>Last 28 Days</SectionLabel>
      <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            {week.map((cell) => (
              <div
                key={cell.iso}
                title={`${cell.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${cell.count} habit${cell.count === 1 ? '' : 's'} completed`}
                className="w-4 h-4 rounded-[3px]"
                style={{ backgroundColor: colorFor(cell.count) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-textDim">
        <span>Less</span>
        {['rgb(var(--color-panel-border))', '#4A3830', '#8A5440', '#C56A4E', '#D97757'].map((c) => (
          <span key={c} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </Card>
  );
}

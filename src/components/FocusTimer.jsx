import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Timer, Settings2, X, Volume2 } from 'lucide-react';
import { Card, SectionLabel, Input, Button } from './ui.jsx';

// Durations are stored in total seconds so hours/minutes/seconds can all be
// set independently, rather than assuming everything is minutes-only.
const DEFAULT_DURATIONS = { focus: 25 * 60, short_break: 5 * 60, long_break: 15 * 60 };
const MODE_META = {
  focus: { label: 'Focus', color: '#D97757' },
  short_break: { label: 'Short Break', color: '#5FBF9F' },
  long_break: { label: 'Long Break', color: '#E0A93B' },
};

function loadDurations() {
  try {
    const stored = localStorage.getItem('pgos_timer_durations_v2');
    return stored ? { ...DEFAULT_DURATIONS, ...JSON.parse(stored) } : DEFAULT_DURATIONS;
  } catch {
    return DEFAULT_DURATIONS;
  }
}

function secondsToHMS(totalSeconds) {
  return {
    h: Math.floor(totalSeconds / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

function hmsToSeconds({ h, m, s }) {
  return Math.max(1, (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0));
}

// Plays a short two-tone beep using the Web Audio API - no external sound
// file needed, and it works even if the tab has been idle.
function playCompletionSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [880, 1108.73].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.3, now + i * 0.25 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.25 + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.25);
      osc.stop(now + i * 0.25 + 0.32);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // Web Audio unsupported - fail silently rather than break the timer.
  }
}

export default function FocusTimer() {
  const [durations, setDurations] = useState(loadDurations);
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(loadDurations().focus);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState(() => ({
    focus: secondsToHMS(loadDurations().focus),
    short_break: secondsToHMS(loadDurations().short_break),
    long_break: secondsToHMS(loadDurations().long_break),
  }));
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            playCompletionSound();
            if (mode === 'focus') {
              const count = Number(localStorage.getItem('pgos_focus_sessions') || '0') + 1;
              localStorage.setItem('pgos_focus_sessions', String(count));
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const switchMode = (next) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMode(next);
    setSecondsLeft(durations[next]);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(durations[mode]);
  };

  const saveSettings = (e) => {
    e.preventDefault();
    const cleaned = {
      focus: hmsToSeconds(draft.focus),
      short_break: hmsToSeconds(draft.short_break),
      long_break: hmsToSeconds(draft.long_break),
    };
    setDurations(cleaned);
    localStorage.setItem('pgos_timer_durations_v2', JSON.stringify(cleaned));
    clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(cleaned[mode]);
    setShowSettings(false);
  };

  const total = durations[mode];
  const pct = total > 0 ? Math.round(((total - secondsLeft) / total) * 100) : 0;
  const hh = Math.floor(secondsLeft / 3600);
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const display = hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>
          <span className="inline-flex items-center gap-1.5"><Timer size={12} /> Focus Timer</span>
        </SectionLabel>
        <div className="flex items-center gap-1">
          {Object.entries(MODE_META).map(([key, m]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`text-[10px] px-2 py-1 rounded-md transition ${
                mode === key ? 'bg-panel text-textPrimary border border-panelBorder' : 'text-textDim'
              }`}
            >
              {m.label}
            </button>
          ))}
          <button
            onClick={() => { setDraft({ focus: secondsToHMS(durations.focus), short_break: secondsToHMS(durations.short_break), long_break: secondsToHMS(durations.long_break) }); setShowSettings((s) => !s); }}
            className="w-6 h-6 rounded-md flex items-center justify-center text-textDim hover:text-copper hover:bg-panel ml-1"
            title="Set custom durations"
          >
            {showSettings ? <X size={13} /> : <Settings2 size={13} />}
          </button>
        </div>
      </div>

      {showSettings ? (
        <form onSubmit={saveSettings} className="space-y-4">
          <p className="text-xs text-textDim flex items-center gap-1.5"><Volume2 size={13} /> A sound plays when any session ends.</p>
          {Object.entries(MODE_META).map(([key, m]) => (
            <div key={key}>
              <label className="text-[10px] text-textDim block mb-1">{m.label}</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    type="number"
                    min="0"
                    placeholder="H"
                    value={draft[key].h}
                    onChange={(e) => setDraft({ ...draft, [key]: { ...draft[key], h: e.target.value } })}
                  />
                  <span className="text-[9px] text-textDim/60 block text-center mt-0.5">hrs</span>
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="M"
                    value={draft[key].m}
                    onChange={(e) => setDraft({ ...draft, [key]: { ...draft[key], m: e.target.value } })}
                  />
                  <span className="text-[9px] text-textDim/60 block text-center mt-0.5">min</span>
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="S"
                    value={draft[key].s}
                    onChange={(e) => setDraft({ ...draft, [key]: { ...draft[key], s: e.target.value } })}
                  />
                  <span className="text-[9px] text-textDim/60 block text-center mt-0.5">sec</span>
                </div>
              </div>
            </div>
          ))}
          <Button type="submit" className="w-full">Save durations</Button>
        </form>
      ) : (
        <div className="flex items-center gap-5">
          <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
            <svg width={100} height={100} className="-rotate-90">
              <circle cx={50} cy={50} r={radius} stroke="rgb(var(--color-panel-border))" strokeWidth={7} fill="none" />
              <circle
                cx={50}
                cy={50}
                r={radius}
                stroke={MODE_META[mode].color}
                strokeWidth={7}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-base font-semibold">{display}</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm text-textDim mb-3">
              {running
                ? `${MODE_META[mode].label} session running…`
                : secondsLeft === 0
                ? 'Session complete!'
                : `${MODE_META[mode].label} session ready.`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setRunning((r) => !r)}
                disabled={secondsLeft === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-copper text-panel disabled:opacity-40"
              >
                {running ? <Pause size={14} /> : <Play size={14} />}
                {running ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm bg-panel border border-panelBorder text-textDim hover:text-textPrimary"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

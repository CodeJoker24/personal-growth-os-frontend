import React from 'react';

// Card: the base panel used throughout the app - like a module on an instrument panel.
export function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-panelRaised border border-panelBorder rounded-2xl p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-textDim mb-2">
      {children}
    </p>
  );
}

// Dial: the app's signature element - a circular gauge instead of a flat progress bar,
// echoing an instrument-panel dial.
export function Dial({ value = 0, size = 96, stroke = 8, label, sublabel, color = '#D97757' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(var(--color-panel-border))"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="-mt-[64px] flex flex-col items-center" style={{ marginTop: -size / 1.5 }}>
        <span className="font-mono font-semibold text-lg text-textPrimary">{clamped}%</span>
      </div>
      {label && <span className="mt-2 text-xs text-textDim text-center">{label}</span>}
      {sublabel && <span className="text-[10px] text-textDim/70">{sublabel}</span>}
    </div>
  );
}

// Slim horizontal bar for lists (habits, topics) where a full dial is too heavy.
export function Bar({ value = 0, color = '#D97757' }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-1.5 bg-panelBorder rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function StatCard({ label, value, sub, accent = 'text-copper' }) {
  return (
    <Card>
      <SectionLabel>{label}</SectionLabel>
      <p className={`font-mono text-2xl font-semibold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-textDim mt-1">{sub}</p>}
    </Card>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'px-4 py-2.5 rounded-xl text-sm font-medium transition active:scale-[0.98]';
  const variants = {
    primary: 'bg-copper text-panel hover:bg-[#e08a67]',
    ghost: 'bg-panelRaised border border-panelBorder text-textPrimary hover:border-copper/50',
    danger: 'bg-transparent text-red-400 hover:bg-red-400/10',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <Card className="flex flex-col items-center text-center py-10 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-copper/10 flex items-center justify-center mb-4">
          <Icon size={22} className="text-copper" />
        </div>
      )}
      <p className="font-medium text-textPrimary">{title}</p>
      {description && <p className="text-sm text-textDim mt-1.5 max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full bg-panel border border-panelBorder rounded-xl px-3.5 py-2.5 text-sm text-textPrimary placeholder:text-textDim/60 outline-none focus:border-copper/60 ${props.className || ''}`}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full bg-panel border border-panelBorder rounded-xl px-3.5 py-2.5 text-sm text-textPrimary placeholder:text-textDim/60 outline-none focus:border-copper/60 resize-none ${props.className || ''}`}
    />
  );
}

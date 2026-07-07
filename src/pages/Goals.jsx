import React, { useEffect, useState } from 'react';
import { Target, Calendar, Trash2 } from 'lucide-react';
import client from '../api/client';
import { Card, SectionLabel, Button, Input, Textarea, Bar, EmptyState } from '../components/ui.jsx';

const STATUS_STYLES = {
  active: { label: 'Active', className: 'text-copper bg-copper/10' },
  completed: { label: 'Completed', className: 'text-mint bg-mint/10' },
  abandoned: { label: 'Abandoned', className: 'text-textDim bg-panel' },
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', target: '', deadline: '' });

  const load = () => {
    client.get('/goals').then((res) => setGoals(res.data));
  };

  useEffect(load, []);

  const addGoal = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await client.post('/goals', form);
    setForm({ title: '', description: '', target: '', deadline: '' });
    setShowForm(false);
    load();
  };

  const updateProgress = async (goal, delta) => {
    const progress = Math.max(0, Math.min(100, goal.progress + delta));
    const status = progress === 100 ? 'completed' : goal.status === 'completed' ? 'active' : goal.status;
    await client.put(`/goals/${goal.id}`, { progress, status });
    load();
  };

  const setStatus = async (goal, status) => {
    await client.put(`/goals/${goal.id}`, { status });
    load();
  };

  const remove = async (id) => {
    await client.delete(`/goals/${id}`);
    load();
  };

  return (
    <div className="max-w-md md:max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-24 md:pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold">Goals</h1>
        <Button variant="ghost" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ New goal'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <form onSubmit={addGoal} className="space-y-3">
            <Input placeholder="Goal title (e.g. Learn React)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Target (e.g. Save ₦100,000)" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
            <Textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div>
              <label className="text-xs text-textDim flex items-center gap-1.5 mb-1"><Calendar size={13} /> Deadline (optional)</label>
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Create goal</Button>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {goals.map((g) => {
          const style = STATUS_STYLES[g.status];
          const daysLeft = g.deadline
            ? Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24))
            : null;
          return (
            <Card key={g.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.className}`}>{style.label}</span>
                    {g.target && <span className="text-[11px] text-textDim">{g.target}</span>}
                  </div>
                  <p className="font-medium">{g.title}</p>
                  {g.description && <p className="text-xs text-textDim mt-1">{g.description}</p>}
                  {daysLeft !== null && (
                    <p className="text-[11px] text-textDim mt-1">
                      {daysLeft >= 0 ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : `${Math.abs(daysLeft)} days overdue`}
                    </p>
                  )}
                </div>
                <button onClick={() => remove(g.id)} className="text-textDim hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-textDim mb-1">
                  <span>Progress</span>
                  <span className="font-mono">{g.progress}%</span>
                </div>
                <Bar value={g.progress} />
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                <Button variant="ghost" onClick={() => updateProgress(g, -10)}>-10%</Button>
                <Button variant="ghost" onClick={() => updateProgress(g, 10)}>+10%</Button>
                {g.status !== 'completed' && (
                  <Button variant="ghost" onClick={() => setStatus(g, 'completed')}>Mark complete</Button>
                )}
                {g.status !== 'abandoned' && g.status !== 'completed' && (
                  <Button variant="ghost" onClick={() => setStatus(g, 'abandoned')}>Abandon</Button>
                )}
              </div>
            </Card>
          );
        })}

        {goals.length === 0 && !showForm && (
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="Set something concrete to work toward — a skill, a savings target, an exam score."
            actionLabel="Create your first goal"
            onAction={() => setShowForm(true)}
          />
        )}
      </div>
    </div>
  );
}

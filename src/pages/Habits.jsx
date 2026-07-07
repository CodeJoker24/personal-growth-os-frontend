import React, { useEffect, useState } from 'react';
import { CheckSquare } from 'lucide-react';
import client from '../api/client';
import { Card, SectionLabel, Button, Input, Bar, EmptyState } from '../components/ui.jsx';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('general');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    client
      .get('/habits')
      .then((res) => setHabits(res.data))
      .catch(() => setError('Could not load habits.'));
  };

  useEffect(load, []);

  const addHabit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await client.post('/habits', { name, category });
      setName('');
      setShowForm(false);
      load();
    } catch {
      setError('Could not create habit.');
    }
  };

  const toggle = async (id) => {
    await client.post(`/habits/${id}/toggle`);
    load();
  };

  const remove = async (id) => {
    await client.delete(`/habits/${id}`);
    load();
  };

  return (
    <div className="max-w-md md:max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-24 md:pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold">Habits</h1>
        <Button onClick={() => setShowForm((s) => !s)} variant="ghost">
          {showForm ? 'Cancel' : '+ New habit'}
        </Button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {showForm && (
        <Card className="mb-4">
          <form onSubmit={addHabit} className="space-y-3">
            <Input placeholder="Habit name (e.g. Code for 1 hour)" value={name} onChange={(e) => setName(e.target.value)} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-panel border border-panelBorder rounded-xl px-3.5 py-2.5 text-sm"
            >
              <option value="general">General</option>
              <option value="coding">Coding</option>
              <option value="study">Study</option>
              <option value="health">Health</option>
              <option value="discipline">Discipline</option>
            </select>
            <Button type="submit" className="w-full">Add habit</Button>
          </form>
        </Card>
      )}

      {habits.length === 0 && !showForm && (
        <EmptyState
          icon={CheckSquare}
          title="No habits yet"
          description="Add your first habit and start building a streak. Consistency compounds faster than you'd think."
          actionLabel="Add your first habit"
          onAction={() => setShowForm(true)}
        />
      )}

      <div className="space-y-3">
        {habits.map((habit) => (
          <Card key={habit.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SectionLabel>{habit.category}</SectionLabel>
                <p className="font-medium">{habit.name}</p>
                <p className="text-xs text-textDim mt-1">
                  🔥 {habit.current_streak}-day streak · best {habit.longest_streak}
                </p>
                <div className="mt-2">
                  <Bar value={Math.min(habit.current_streak * 10, 100)} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-3">
                <button
                  onClick={() => toggle(habit.id)}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center text-lg ${
                    habit.done_today
                      ? 'bg-copper border-copper text-panel'
                      : 'border-panelBorder text-textDim'
                  }`}
                >
                  ✓
                </button>
                <button onClick={() => remove(habit.id)} className="text-[11px] text-textDim hover:text-red-400">
                  remove
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

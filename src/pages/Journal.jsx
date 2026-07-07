import React, { useEffect, useState } from 'react';
import { PenLine } from 'lucide-react';
import client from '../api/client';
import { Card, SectionLabel, Button, Input, Textarea, EmptyState } from '../components/ui.jsx';

const MOODS = ['😔 Low', '😐 Okay', '🙂 Good', '😄 Great'];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    mood: '',
    went_well: '',
    problems_faced: '',
    lessons_learned: '',
    tomorrow_plan: '',
  });

  const load = (pageNum = 1, append = false) => {
    client.get(`/journal?page=${pageNum}&limit=10`).then((res) => {
      setEntries((prev) => (append ? [...prev, ...res.data.data] : res.data.data));
      setPage(res.data.pagination.page);
      setTotalPages(res.data.pagination.totalPages);
    });
  };

  useEffect(() => load(1), []);

  const submit = async (e) => {
    e.preventDefault();
    await client.post('/journal', form);
    setForm({ mood: '', went_well: '', problems_faced: '', lessons_learned: '', tomorrow_plan: '' });
    setShowForm(false);
    load(1);
  };

  const remove = async (id) => {
    await client.delete(`/journal/${id}`);
    load(1);
  };

  return (
    <div className="max-w-md md:max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-24 md:pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold">Journal</h1>
        <Button variant="ghost" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : "+ Today's entry"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4 space-y-3">
          <div>
            <SectionLabel>Mood</SectionLabel>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, mood: m })}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    form.mood === m ? 'border-copper bg-copper/10 text-copper' : 'border-panelBorder text-textDim'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <SectionLabel>What went well</SectionLabel>
              <Textarea rows={2} value={form.went_well} onChange={(e) => setForm({ ...form, went_well: e.target.value })} />
            </div>
            <div>
              <SectionLabel>Problems faced</SectionLabel>
              <Textarea rows={2} value={form.problems_faced} onChange={(e) => setForm({ ...form, problems_faced: e.target.value })} />
            </div>
            <div>
              <SectionLabel>Lessons learned</SectionLabel>
              <Textarea rows={2} value={form.lessons_learned} onChange={(e) => setForm({ ...form, lessons_learned: e.target.value })} />
            </div>
            <div>
              <SectionLabel>Tomorrow's plan</SectionLabel>
              <Textarea rows={2} value={form.tomorrow_plan} onChange={(e) => setForm({ ...form, tomorrow_plan: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Save entry</Button>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <div className="flex justify-between items-start mb-2">
              <SectionLabel>
                {new Date(entry.entry_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                {entry.mood ? ` · ${entry.mood}` : ''}
              </SectionLabel>
              <button onClick={() => remove(entry.id)} className="text-[11px] text-textDim hover:text-red-400">
                remove
              </button>
            </div>
            {entry.went_well && <p className="text-sm mb-1"><span className="text-textDim">Went well: </span>{entry.went_well}</p>}
            {entry.problems_faced && <p className="text-sm mb-1"><span className="text-textDim">Challenges: </span>{entry.problems_faced}</p>}
            {entry.lessons_learned && <p className="text-sm mb-1"><span className="text-textDim">Lessons: </span>{entry.lessons_learned}</p>}
            {entry.tomorrow_plan && <p className="text-sm"><span className="text-textDim">Tomorrow: </span>{entry.tomorrow_plan}</p>}
          </Card>
        ))}
        {entries.length === 0 && !showForm && (
          <EmptyState
            icon={PenLine}
            title="No journal entries yet"
            description="Reflection compounds just like habits do. Write about today — what went well, what didn't."
            actionLabel="Write your first entry"
            onAction={() => setShowForm(true)}
          />
        )}
      </div>

      {page < totalPages && (
        <button
          onClick={() => load(page + 1, true)}
          className="w-full text-center text-sm text-copper mt-4 py-2"
        >
          Load more entries
        </button>
      )}
    </div>
  );
}

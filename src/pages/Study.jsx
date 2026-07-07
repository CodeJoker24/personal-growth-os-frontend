import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import client from '../api/client';
import { Card, SectionLabel, Button, Input, Bar, EmptyState } from '../components/ui.jsx';

export default function Study() {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [topicInputs, setTopicInputs] = useState({});

  const load = () => {
    client.get('/study/subjects').then((res) => setSubjects(res.data));
  };

  useEffect(load, []);

  const addSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    await client.post('/study/subjects', { subject: subjectName });
    setSubjectName('');
    setShowForm(false);
    load();
  };

  const updateField = async (subject, field, value) => {
    await client.put(`/study/subjects/${subject.id}`, { [field]: value });
    load();
  };

  const removeSubject = async (id) => {
    await client.delete(`/study/subjects/${id}`);
    load();
  };

  const addTopic = async (subjectId) => {
    const name = (topicInputs[subjectId] || '').trim();
    if (!name) return;
    await client.post(`/study/subjects/${subjectId}/topics`, { name });
    setTopicInputs({ ...topicInputs, [subjectId]: '' });
    load();
  };

  const toggleTopic = async (topicId) => {
    await client.put(`/study/topics/${topicId}/toggle`);
    load();
  };

  return (
    <div className="max-w-md md:max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-24 md:pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-semibold">Study Planner</h1>
        <Button variant="ghost" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Subject'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <form onSubmit={addSubject} className="space-y-3">
            <Input placeholder="Subject (e.g. Physics)" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} />
            <Button type="submit" className="w-full">Add subject</Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {subjects.map((s) => (
          <Card key={s.id}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <SectionLabel>Topic completion: {s.completion}%</SectionLabel>
                <p className="font-medium">{s.subject}</p>
              </div>
              <button onClick={() => removeSubject(s.id)} className="text-[11px] text-textDim hover:text-red-400">
                remove
              </button>
            </div>
            <Bar value={s.completion} color="#E0A93B" />

            <div className="mt-3 space-y-1.5">
              {s.topics.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={t.completed} onChange={() => toggleTopic(t.id)} className="accent-copper" />
                  <span className={t.completed ? 'line-through text-textDim' : ''}>{t.name}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Add topic"
                value={topicInputs[s.id] || ''}
                onChange={(e) => setTopicInputs({ ...topicInputs, [s.id]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addTopic(s.id)}
              />
              <Button variant="ghost" onClick={() => addTopic(s.id)}>Add</Button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <p className="text-xs text-textDim mb-1">Mock score</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={s.mock_score}
                    onChange={(e) => updateField(s, 'mock_score', Number(e.target.value))}
                  />
                  <span className="text-xs text-textDim">/ {s.target_score}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-textDim mb-1">Study hours</p>
                <Input
                  type="number"
                  value={s.study_hours}
                  onChange={(e) => updateField(s, 'study_hours', Number(e.target.value))}
                />
              </div>
            </div>
          </Card>
        ))}
        {subjects.length === 0 && !showForm && (
          <EmptyState
            icon={BookOpen}
            title="No subjects yet"
            description="Add Mathematics, Physics, Chemistry, or English to start tracking topics and mock scores."
            actionLabel="Add your first subject"
            onAction={() => setShowForm(true)}
          />
        )}
      </div>
    </div>
  );
}

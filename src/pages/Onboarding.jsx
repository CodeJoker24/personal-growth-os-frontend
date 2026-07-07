import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, BookOpen, PartyPopper, ArrowRight } from 'lucide-react';
import client from '../api/client';
import { Card, Button, Input } from '../components/ui.jsx';

const STEPS = ['habit', 'study', 'done'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [habitName, setHabitName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [saving, setSaving] = useState(false);

  const finish = () => navigate('/');

  const addHabit = async () => {
    if (habitName.trim()) {
      setSaving(true);
      try {
        await client.post('/habits', { name: habitName, category: 'general' });
      } catch {
        /* non-blocking - onboarding shouldn't get stuck on a network hiccup */
      } finally {
        setSaving(false);
      }
    }
    setStep(1);
  };

  const addSubject = async () => {
    if (subjectName.trim()) {
      setSaving(true);
      try {
        await client.post('/study/subjects', { subject: subjectName });
      } catch {
        /* non-blocking */
      } finally {
        setSaving(false);
      }
    }
    setStep(2);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-1.5 mb-8 justify-center">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-copper' : i < step ? 'w-4 bg-copper/50' : 'w-4 bg-panelBorder'
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <Card className="text-center py-8 px-6">
            <div className="w-12 h-12 rounded-2xl bg-copper/10 flex items-center justify-center mx-auto mb-4">
              <CheckSquare size={22} className="text-copper" />
            </div>
            <h1 className="font-display text-lg font-semibold mb-2">Let's set up your first habit</h1>
            <p className="text-sm text-textDim mb-5">
              Something you want to do consistently — coding, reading, exercise, anything.
            </p>
            <Input
              placeholder="e.g. Code for 1 hour"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="mb-4"
            />
            <Button onClick={addHabit} disabled={saving} className="w-full flex items-center justify-center gap-1.5">
              Continue <ArrowRight size={14} />
            </Button>
            <button onClick={() => setStep(1)} className="text-xs text-textDim mt-3">Skip this step</button>
          </Card>
        )}

        {step === 1 && (
          <Card className="text-center py-8 px-6">
            <div className="w-12 h-12 rounded-2xl bg-warnAmber/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={22} className="text-warnAmber" />
            </div>
            <h1 className="font-display text-lg font-semibold mb-2">Add a subject you're studying</h1>
            <p className="text-sm text-textDim mb-5">
              JAMB prep, a course, a certification — whatever you're working toward.
            </p>
            <Input
              placeholder="e.g. Physics"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="mb-4"
            />
            <Button onClick={addSubject} disabled={saving} className="w-full flex items-center justify-center gap-1.5">
              Continue <ArrowRight size={14} />
            </Button>
            <button onClick={() => setStep(2)} className="text-xs text-textDim mt-3">Skip this step</button>
          </Card>
        )}

        {step === 2 && (
          <Card className="text-center py-8 px-6">
            <div className="w-12 h-12 rounded-2xl bg-mint/10 flex items-center justify-center mx-auto mb-4">
              <PartyPopper size={22} className="text-mint" />
            </div>
            <h1 className="font-display text-lg font-semibold mb-2">You're set up</h1>
            <p className="text-sm text-textDim mb-5">
              Your command center is ready. Everything else — coding projects, journal, finances —
              you can add as you go.
            </p>
            <Button onClick={finish} className="w-full">Go to Dashboard</Button>
          </Card>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { FolderKanban, Sparkles } from 'lucide-react';
import client from '../api/client';
import { Card, SectionLabel, Button, Input, Textarea, Bar, EmptyState } from '../components/ui.jsx';

export default function Coding() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [tab, setTab] = useState('projects');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', technology: '', progress: 0 });
  const [skillForm, setSkillForm] = useState({ skill_name: '', percentage: 0 });

  const load = () => {
    client.get('/coding/projects?limit=50').then((res) => setProjects(res.data.data));
    client.get('/coding/skills').then((res) => setSkills(res.data));
  };

  useEffect(load, []);

  const addProject = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await client.post('/coding/projects', form);
    setForm({ name: '', description: '', technology: '', progress: 0 });
    setShowProjectForm(false);
    load();
  };

  const updateProgress = async (project, delta) => {
    const progress = Math.max(0, Math.min(100, project.progress + delta));
    await client.put(`/coding/projects/${project.id}`, { ...project, progress });
    load();
  };

  const incrementBugs = async (project) => {
    await client.put(`/coding/projects/${project.id}`, { ...project, bugs_solved: project.bugs_solved + 1 });
    load();
  };

  const removeProject = async (id) => {
    await client.delete(`/coding/projects/${id}`);
    load();
  };

  const addSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.skill_name.trim()) return;
    await client.post('/coding/skills', skillForm);
    setSkillForm({ skill_name: '', percentage: 0 });
    setShowSkillForm(false);
    load();
  };

  const updateSkill = async (skill, delta) => {
    const percentage = Math.max(0, Math.min(100, skill.percentage + delta));
    await client.put(`/coding/skills/${skill.id}`, { percentage });
    load();
  };

  return (
    <div className="max-w-md md:max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-24 md:pb-10">
      <h1 className="font-display text-xl font-semibold mb-4">Coding Progress</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('projects')}
          className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'projects' ? 'bg-copper text-panel' : 'bg-panelRaised text-textDim'}`}
        >
          Projects
        </button>
        <button
          onClick={() => setTab('skills')}
          className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'skills' ? 'bg-copper text-panel' : 'bg-panelRaised text-textDim'}`}
        >
          Skills
        </button>
      </div>

      {tab === 'projects' && (
        <>
          <div className="flex justify-end mb-3">
            <Button variant="ghost" onClick={() => setShowProjectForm((s) => !s)}>
              {showProjectForm ? 'Cancel' : '+ New project'}
            </Button>
          </div>

          {showProjectForm && (
            <Card className="mb-4">
              <form onSubmit={addProject} className="space-y-3">
                <Input placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input
                  placeholder="Technologies (e.g. React, Node.js)"
                  value={form.technology}
                  onChange={(e) => setForm({ ...form, technology: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <Button type="submit" className="w-full">Create project</Button>
              </form>
            </Card>
          )}

          <div className="space-y-3">
            {projects.map((p) => (
              <Card key={p.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <SectionLabel>{p.technology || 'no stack set'}</SectionLabel>
                    <p className="font-medium">{p.name}</p>
                    {p.description && <p className="text-xs text-textDim mt-1">{p.description}</p>}
                  </div>
                  <button onClick={() => removeProject(p.id)} className="text-[11px] text-textDim hover:text-red-400">
                    remove
                  </button>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-textDim mb-1">
                    <span>Progress</span>
                    <span className="font-mono">{p.progress}%</span>
                  </div>
                  <Bar value={p.progress} />
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" onClick={() => updateProgress(p, -10)}>-10%</Button>
                  <Button variant="ghost" onClick={() => updateProgress(p, 10)}>+10%</Button>
                  <Button variant="ghost" onClick={() => incrementBugs(p)}>🐛 solved ({p.bugs_solved})</Button>
                </div>
              </Card>
            ))}
            {projects.length === 0 && !showProjectForm && (
              <EmptyState
                icon={FolderKanban}
                title="No projects tracked yet"
                description="Log what you're building — progress, tech stack, and bugs solved along the way."
                actionLabel="Add your first project"
                onAction={() => setShowProjectForm(true)}
              />
            )}
          </div>
        </>
      )}

      {tab === 'skills' && (
        <>
          <div className="flex justify-end mb-3">
            <Button variant="ghost" onClick={() => setShowSkillForm((s) => !s)}>
              {showSkillForm ? 'Cancel' : '+ New skill'}
            </Button>
          </div>

          {showSkillForm && (
            <Card className="mb-4">
              <form onSubmit={addSkill} className="space-y-3">
                <Input
                  placeholder="Skill name (e.g. React)"
                  value={skillForm.skill_name}
                  onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })}
                />
                <Button type="submit" className="w-full">Add skill</Button>
              </form>
            </Card>
          )}

          <div className="space-y-3">
            {skills.map((s) => (
              <Card key={s.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{s.skill_name}</span>
                  <span className="font-mono text-copper">{s.percentage}%</span>
                </div>
                <Bar value={s.percentage} color="#5FBF9F" />
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" onClick={() => updateSkill(s, -5)}>-5%</Button>
                  <Button variant="ghost" onClick={() => updateSkill(s, 5)}>+5%</Button>
                </div>
              </Card>
            ))}
            {skills.length === 0 && !showSkillForm && (
              <EmptyState
                icon={Sparkles}
                title="No skills tracked yet"
                description="Add the languages and tools you're growing in, and watch the percentages climb."
                actionLabel="Add your first skill"
                onAction={() => setShowSkillForm(true)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

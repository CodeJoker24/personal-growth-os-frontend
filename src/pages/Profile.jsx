import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, Globe2, AtSign, LogOut, KeyRound, Check, Sun, Moon, Bell, Mail, Trash2, AlertTriangle, Shield } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Card, SectionLabel, Button, Input } from '../components/ui.jsx';

function initialsOf(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ full_name: '', username: '', phone: '', address: '', state: '' });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState(() => localStorage.getItem('pgos_reminder_enabled') === 'true');
  const [reminderHour, setReminderHour] = useState(() => localStorage.getItem('pgos_reminder_hour') || '20');
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const toggleReminders = async () => {
    if (!reminderEnabled) {
      if (typeof Notification === 'undefined') return;
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission !== 'granted') return;
    }
    const next = !reminderEnabled;
    setReminderEnabled(next);
    localStorage.setItem('pgos_reminder_enabled', String(next));
  };

  const updateReminderHour = (hour) => {
    setReminderHour(hour);
    localStorage.setItem('pgos_reminder_hour', hour);
  };

  const [emailForm, setEmailForm] = useState({ new_email: '', current_password: '' });
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  const changeEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');
    setEmailSaving(true);
    try {
      const { data } = await client.put('/users/me/email', emailForm);
      setProfile((p) => ({ ...p, email: data.email }));
      setEmailForm({ new_email: '', current_password: '' });
      setEmailSuccess('Email updated.');
      setTimeout(() => setEmailSuccess(''), 2500);
    } catch (err) {
      setEmailError(err.response?.data?.error || 'Could not update email.');
    } finally {
      setEmailSaving(false);
    }
  };

  const [deleteForm, setDeleteForm] = useState({ password: '', confirmed: false });
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteForm.confirmed) {
      setDeleteError('Please confirm you understand this cannot be undone.');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      await client.delete('/users/me', { data: { password: deleteForm.password } });
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Could not delete account.');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    client.get('/users/me').then((res) => {
      setProfile(res.data);
      setForm({
        full_name: res.data.full_name || '',
        username: res.data.username || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        state: res.data.state || '',
      });
    });
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSavedMsg('');
    try {
      const { data } = await client.put('/users/me', form);
      setProfile(data);
      updateUser({ username: data.username, full_name: data.full_name });
      setSavedMsg('Saved.');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.new_password !== pwForm.confirm) {
      setPwError('New password and confirmation do not match.');
      return;
    }
    setPwSaving(true);
    try {
      await client.put('/users/me/password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwSuccess('Password updated.');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
      setTimeout(() => setPwSuccess(''), 2500);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Could not change password.');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-md md:max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-24 md:pb-10">
      <h1 className="font-display text-xl font-semibold mb-6">Profile</h1>

      <div className="md:grid md:grid-cols-5 md:gap-6 space-y-4 md:space-y-0">
        <Card className="md:col-span-2 flex flex-col items-center text-center py-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-copper to-copperDim flex items-center justify-center text-2xl font-display font-semibold text-panel mb-4">
            {initialsOf(form.full_name || user?.username)}
          </div>
          <p className="font-medium text-lg">{form.full_name || user?.username}</p>
          <p className="text-sm text-textDim">@{user?.username}</p>
          <p className="text-sm text-textDim mt-1 flex items-center gap-1.5">
            <AtSign size={13} /> {profile?.email}
          </p>
          {profile?.created_at && (
            <p className="text-xs text-textDim/70 mt-4">
              Member since {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          )}
        </Card>

        <div className="md:col-span-3 space-y-4">
          {user?.role === 'admin' && (
            <Link to="/admin" className="block">
              <Card className="flex items-center justify-between hover:border-copper/40 transition">
                <span className="flex items-center gap-2 text-sm">
                  <Shield size={16} className="text-copper" /> Admin Dashboard
                </span>
                <span className="text-xs text-textDim">View platform stats →</span>
              </Card>
            </Link>
          )}
          <Card>
            <SectionLabel>Personal information</SectionLabel>
            <form onSubmit={saveProfile} className="space-y-3 mt-2">
              <div>
                <label className="text-xs text-textDim flex items-center gap-1.5 mb-1"><User size={13} /> Full name</label>
                <Input
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-textDim flex items-center gap-1.5 mb-1"><AtSign size={13} /> Username</label>
                <Input
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-textDim flex items-center gap-1.5 mb-1"><Phone size={13} /> Phone number</label>
                <Input
                  placeholder="e.g. 080..."
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-textDim flex items-center gap-1.5 mb-1"><MapPin size={13} /> Address</label>
                <Input
                  placeholder="Street address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-textDim flex items-center gap-1.5 mb-1"><Globe2 size={13} /> State</label>
                <Input
                  placeholder="e.g. Lagos"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex items-center gap-3 pt-1">
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
                {savedMsg && (
                  <span className="text-mint text-sm flex items-center gap-1"><Check size={14} /> {savedMsg}</span>
                )}
              </div>
            </form>
          </Card>

          <Card>
            <SectionLabel>Security</SectionLabel>
            <form onSubmit={changePassword} className="space-y-3 mt-2">
              <div>
                <label className="text-xs text-textDim flex items-center gap-1.5 mb-1"><KeyRound size={13} /> Current password</label>
                <Input
                  type="password"
                  value={pwForm.current_password}
                  onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-textDim mb-1 block">New password</label>
                <Input
                  type="password"
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-textDim mb-1 block">Confirm new password</label>
                <Input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                />
              </div>
              {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
              <div className="flex items-center gap-3 pt-1">
                <Button type="submit" variant="ghost" disabled={pwSaving}>
                  {pwSaving ? 'Updating…' : 'Change password'}
                </Button>
                {pwSuccess && (
                  <span className="text-mint text-sm flex items-center gap-1"><Check size={14} /> {pwSuccess}</span>
                )}
              </div>
            </form>
          </Card>

          <Card>
            <SectionLabel>Change Email</SectionLabel>
            <form onSubmit={changeEmail} className="space-y-3 mt-2">
              <div>
                <label className="text-xs text-textDim flex items-center gap-1.5 mb-1"><Mail size={13} /> New email</label>
                <Input
                  type="email"
                  placeholder={profile?.email || 'new@example.com'}
                  value={emailForm.new_email}
                  onChange={(e) => setEmailForm({ ...emailForm, new_email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-textDim mb-1 block">Confirm with your password</label>
                <Input
                  type="password"
                  value={emailForm.current_password}
                  onChange={(e) => setEmailForm({ ...emailForm, current_password: e.target.value })}
                />
              </div>
              {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
              <div className="flex items-center gap-3 pt-1">
                <Button type="submit" variant="ghost" disabled={emailSaving}>
                  {emailSaving ? 'Updating…' : 'Change email'}
                </Button>
                {emailSuccess && (
                  <span className="text-mint text-sm flex items-center gap-1"><Check size={14} /> {emailSuccess}</span>
                )}
              </div>
            </form>
          </Card>

          <Card>
            <SectionLabel>Appearance</SectionLabel>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-sm">
                {theme === 'dark' ? <Moon size={15} className="text-copper" /> : <Sun size={15} className="text-copper" />}
                <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                  theme === 'dark' ? 'bg-copper justify-end' : 'bg-panelBorder justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-panel" />
              </button>
            </div>
          </Card>

          <Card>
            <SectionLabel>Reminders</SectionLabel>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-sm">
                <Bell size={15} className="text-copper" />
                <span>Daily habit reminder</span>
              </div>
              <button
                onClick={toggleReminders}
                className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                  reminderEnabled ? 'bg-copper justify-end' : 'bg-panelBorder justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-panel" />
              </button>
            </div>
            {reminderEnabled && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-textDim">Remind me at</span>
                <select
                  value={reminderHour}
                  onChange={(e) => updateReminderHour(e.target.value)}
                  className="bg-panel border border-panelBorder rounded-lg px-2 py-1 text-xs"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {h === 0 ? '12:00 AM' : h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {notifPermission === 'denied' && (
              <p className="text-xs text-red-400 mt-2">
                Notifications are blocked in your browser settings. Enable them there to use reminders.
              </p>
            )}
            <p className="text-[11px] text-textDim/70 mt-2">
              Reminders fire while this app is open in a browser tab — they won't wake your phone if the
              app is fully closed. That needs a backend push service, which we can add later if you want it.
            </p>
          </Card>

          <Card className="border-red-400/20">
            <SectionLabel>Danger Zone</SectionLabel>
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-textDim">Permanently delete your account and all your data.</p>
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 shrink-0 ml-3">
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            ) : (
              <form onSubmit={deleteAccount} className="space-y-3 mt-2">
                <p className="text-xs text-red-400 flex items-start gap-1.5">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  This deletes every habit, project, journal entry, goal, and transaction you have. There is no undo.
                </p>
                <Input
                  type="password"
                  placeholder="Enter your password to confirm"
                  value={deleteForm.password}
                  onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                />
                <label className="flex items-center gap-2 text-xs text-textDim">
                  <input
                    type="checkbox"
                    checked={deleteForm.confirmed}
                    onChange={(e) => setDeleteForm({ ...deleteForm, confirmed: e.target.checked })}
                    className="accent-red-400"
                  />
                  I understand this cannot be undone.
                </label>
                {deleteError && <p className="text-red-400 text-sm">{deleteError}</p>}
                <div className="flex gap-2">
                  <Button type="submit" variant="danger" disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Permanently delete my account'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <Button variant="danger" onClick={logout} className="w-full flex items-center justify-center gap-2">
            <LogOut size={15} /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

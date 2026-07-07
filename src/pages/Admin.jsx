import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, UserCheck, TrendingUp, Flame, BookOpen, Search, ShieldOff, Shield, Ban, CheckCircle2 } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, SectionLabel, StatCard, Input } from '../components/ui.jsx';

export default function Admin() {
  const { user: me } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    client.get('/admin/stats').then((res) => setStats(res.data)).catch(() => setError('Could not load admin stats.'));
  }, []);

  const loadUsers = (pageNum = 1, searchTerm = search) => {
    client
      .get(`/admin/users?page=${pageNum}&limit=20${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`)
      .then((res) => {
        setUsers(res.data.data);
        setPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.totalPages);
      })
      .catch(() => setError('Could not load users.'));
  };

  useEffect(() => loadUsers(1), []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(1, search);
  };

  const toggleRole = async (u) => {
    setActionError('');
    const nextRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await client.put(`/admin/users/${u.id}/role`, { role: nextRole });
      loadUsers(page, search);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not update role.');
    }
  };

  const toggleSuspend = async (u) => {
    setActionError('');
    try {
      await client.put(`/admin/users/${u.id}/suspend`, { suspended: !u.suspended });
      loadUsers(page, search);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not update suspension.');
    }
  };

  const growthData = stats?.growth.map((g) => ({
    day: new Date(g.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    signups: g.count,
  })) || [];

  return (
    <div className="max-w-md md:max-w-5xl mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-24 md:pb-10">
      <h1 className="font-display text-xl font-semibold mb-1">Admin</h1>
      <p className="text-sm text-textDim mb-6">Platform-wide stats and user management.</p>

      {error && <Card className="border-red-400/30 mb-4"><p className="text-sm text-red-400">{error}</p></Card>}
      {!stats && !error && <p className="text-sm text-textDim">Loading…</p>}

      {stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Users" value={stats.users.total_users} accent="text-copper" />
            <StatCard
              label="Active (7d)"
              value={stats.users.active_users_7d}
              sub={`${stats.users.active_users_30d} in 30d`}
              accent="text-mint"
            />
            <StatCard
              label="New Users (7d)"
              value={stats.users.new_users_7d}
              sub={`${stats.users.new_users_30d} in 30d`}
              accent="text-warnAmber"
            />
            <StatCard label="Suspended" value={stats.users.suspended_users} accent="text-red-400" />
          </div>

          <Card>
            <SectionLabel>Signups — Last 30 Days</SectionLabel>
            <div className="h-40 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-panel-border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'rgb(var(--color-text-dim))', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: 'rgb(var(--color-text-dim))', fontSize: 11 }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip
                    contentStyle={{ background: 'rgb(var(--color-panel-raised))', border: '1px solid rgb(var(--color-panel-border))', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="signups" fill="#D97757" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
            <Card>
              <SectionLabel>Most Popular Habits</SectionLabel>
              {stats.popular_habits.length === 0 ? (
                <p className="text-sm text-textDim mt-2">No habits logged across any account yet.</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {stats.popular_habits.map((h, i) => (
                    <div key={h.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-textDim font-mono text-xs w-4">{i + 1}.</span> {h.name}
                      </span>
                      <span className="font-mono text-copper">{h.user_count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <SectionLabel>Platform Averages</SectionLabel>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-textDim"><BookOpen size={14} /> Avg. study hours</span>
                  <span className="font-mono">{stats.averages.study_hours}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-textDim"><Flame size={14} /> Avg. coding streak</span>
                  <span className="font-mono">{stats.averages.coding_streak}d</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-textDim"><TrendingUp size={14} /> Total projects</span>
                  <span className="font-mono">{stats.totals.projects}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-textDim"><Users size={14} /> Journal entries</span>
                  <span className="font-mono">{stats.totals.journal_entries}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Users</SectionLabel>
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs py-1.5"
                />
                <button type="submit" className="text-textDim hover:text-copper"><Search size={15} /></button>
              </form>
            </div>

            {actionError && <p className="text-red-400 text-xs mb-2">{actionError}</p>}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-textDim text-xs border-b border-panelBorder">
                    <th className="pb-2 pr-4">User</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Joined</th>
                    <th className="pb-2 pr-4">Last active</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-panelBorder/50">
                      <td className="py-2 pr-4">
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-textDim">{u.email}</p>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit ${u.role === 'admin' ? 'bg-copper/15 text-copper' : 'bg-panel text-textDim'}`}>
                            {u.role}
                          </span>
                          {u.suspended && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full w-fit bg-red-400/15 text-red-400">suspended</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-xs text-textDim">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-2 pr-4 text-xs text-textDim flex items-center gap-1">
                        <UserCheck size={12} />
                        {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'never'}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => toggleRole(u)}
                            disabled={u.id === me?.id}
                            title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                            className="p-1.5 rounded-md text-textDim hover:text-copper hover:bg-panel disabled:opacity-30"
                          >
                            {u.role === 'admin' ? <ShieldOff size={14} /> : <Shield size={14} />}
                          </button>
                          <button
                            onClick={() => toggleSuspend(u)}
                            disabled={u.id === me?.id}
                            title={u.suspended ? 'Reactivate account' : 'Suspend account'}
                            className="p-1.5 rounded-md text-textDim hover:text-red-400 hover:bg-panel disabled:opacity-30"
                          >
                            {u.suspended ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-xs text-textDim">
                <button
                  onClick={() => loadUsers(page - 1, search)}
                  disabled={page <= 1}
                  className="disabled:opacity-30"
                >
                  ← Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  onClick={() => loadUsers(page + 1, search)}
                  disabled={page >= totalPages}
                  className="disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

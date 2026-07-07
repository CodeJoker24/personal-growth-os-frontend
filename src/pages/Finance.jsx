import React, { useEffect, useState } from 'react';
import { Wallet, Download } from 'lucide-react';
import client from '../api/client';
import { Card, SectionLabel, Button, Input, EmptyState } from '../components/ui.jsx';

const CATEGORIES = ['Food', 'Transport', 'Learning', 'Entertainment', 'Other'];

export default function Finance() {
  const [txns, setTxns] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allForExport, setAllForExport] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'Food', note: '' });

  // Paginated list for display; the unpaginated summary endpoint drives the
  // income/expense totals so they stay accurate regardless of which page you're on.
  const loadList = (pageNum = 1, append = false) => {
    client.get(`/finance?page=${pageNum}&limit=15`).then((res) => {
      setTxns((prev) => (append ? [...prev, ...res.data.data] : res.data.data));
      setPage(res.data.pagination.page);
      setTotalPages(res.data.pagination.totalPages);
    });
  };

  const loadSummary = () => {
    client.get('/finance/summary').then((res) => {
      setAllForExport(res.data);
      const income = res.data.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = res.data.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
      setTotals({ income, expense });
    });
  };

  const loadAll = () => {
    loadList(1);
    loadSummary();
  };

  useEffect(loadAll, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount) return;
    await client.post('/finance', { ...form, amount: Number(form.amount) });
    setForm({ type: 'expense', amount: '', category: 'Food', note: '' });
    setShowForm(false);
    loadAll();
  };

  const remove = async (id) => {
    await client.delete(`/finance/${id}`);
    loadAll();
  };

  const exportCsv = () => {
    const header = 'Date,Type,Category,Amount,Note\n';
    const rows = allForExport
      .map((t) => `${t.txn_date},${t.type},${t.category},${t.amount},"${(t.note || '').replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { income, expense } = totals;

  return (
    <div className="max-w-md md:max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-24 md:pb-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-xl font-semibold">Finance</h1>
        <div className="flex gap-2">
          {allForExport.length > 0 && (
            <Button variant="ghost" onClick={exportCsv} className="flex items-center gap-1.5">
              <Download size={14} /> Export
            </Button>
          )}
          <Button variant="ghost" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : '+ Transaction'}
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <div className="flex justify-between">
          <div>
            <SectionLabel>Income</SectionLabel>
            <p className="font-mono text-mint text-lg">₦{income.toLocaleString()}</p>
          </div>
          <div>
            <SectionLabel>Expenses</SectionLabel>
            <p className="font-mono text-red-400 text-lg">₦{expense.toLocaleString()}</p>
          </div>
          <div>
            <SectionLabel>Balance</SectionLabel>
            <p className="font-mono text-copper text-lg">₦{(income - expense).toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {showForm && (
        <Card className="mb-4">
          <form onSubmit={submit} className="space-y-3">
            <div className="flex gap-2">
              {['income', 'expense'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`flex-1 py-2 rounded-xl text-sm capitalize ${
                    form.type === t ? 'bg-copper text-panel' : 'bg-panel border border-panelBorder text-textDim'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Amount (₦)"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-panel border border-panelBorder rounded-xl px-3.5 py-2.5 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Input placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            <Button type="submit" className="w-full">Save transaction</Button>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {txns.map((t) => (
          <Card key={t.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{t.category}</p>
              <p className="text-xs text-textDim">
                {new Date(t.txn_date).toLocaleDateString()} {t.note && `· ${t.note}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-mono text-sm ${t.type === 'income' ? 'text-mint' : 'text-red-400'}`}>
                {t.type === 'income' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
              </span>
              <button onClick={() => remove(t.id)} className="text-[11px] text-textDim hover:text-red-400">✕</button>
            </div>
          </Card>
        ))}
        {txns.length === 0 && !showForm && (
          <EmptyState
            icon={Wallet}
            title="No transactions logged yet"
            description="Track income and expenses to see your monthly balance and spending breakdown."
            actionLabel="Log your first transaction"
            onAction={() => setShowForm(true)}
          />
        )}
      </div>

      {page < totalPages && (
        <button
          onClick={() => loadList(page + 1, true)}
          className="w-full text-center text-sm text-copper mt-4 py-2"
        >
          Load more transactions
        </button>
      )}
    </div>
  );
}

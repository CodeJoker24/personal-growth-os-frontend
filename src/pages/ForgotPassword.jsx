import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import client from '../api/client';
import { Card, Button, Input } from '../components/ui.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/forgot-password', { email });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-mono text-copper text-xs tracking-[0.2em] uppercase mb-2">Personal Growth OS</p>
          <h1 className="font-display text-2xl font-semibold">Reset your password</h1>
        </div>

        {!result ? (
          <form onSubmit={submit} className="space-y-3">
            <Input type="email" placeholder="Your account email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        ) : (
          <Card className="text-center py-6 px-5">
            <KeyRound size={22} className="text-copper mx-auto mb-3" />
            <p className="text-sm text-textPrimary mb-3">{result.message}</p>
            {result.dev_reset_token && (
              <div className="text-left bg-panel rounded-xl p-3 mt-3">
                <p className="text-[11px] text-warnAmber mb-2">
                  No email service is set up yet, so here's your reset token directly (this would normally be emailed):
                </p>
                <p className="font-mono text-[11px] text-textDim break-all">{result.dev_reset_token}</p>
                <Link
                  to={`/reset-password?token=${result.dev_reset_token}`}
                  className="inline-block mt-3 text-copper text-sm"
                >
                  Continue to reset password →
                </Link>
              </div>
            )}
          </Card>
        )}

        <p className="text-center text-sm text-textDim mt-6">
          <Link to="/login" className="text-copper">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

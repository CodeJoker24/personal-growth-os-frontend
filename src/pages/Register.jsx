import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, Button, Input } from '../components/ui.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationInfo, setVerificationInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(username, email, password);
      setVerificationInfo(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-mono text-copper text-xs tracking-[0.2em] uppercase mb-2">Personal Growth OS</p>
          <h1 className="font-display text-2xl font-semibold">
            {verificationInfo ? 'Almost there' : 'Set up your command center'}
          </h1>
        </div>

        {!verificationInfo ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="text-center text-sm text-textDim mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-copper">Sign in</Link>
            </p>
          </>
        ) : (
          <Card className="text-center py-6 px-5">
            <MailCheck size={22} className="text-copper mx-auto mb-3" />
            <p className="text-sm text-textPrimary mb-3">
              Your account is ready. Verify your email to keep it fully secure.
            </p>
            {verificationInfo.dev_verification_token && (
              <div className="text-left bg-panel rounded-xl p-3 mt-3">
                <p className="text-[11px] text-warnAmber mb-2">
                  No email service is set up yet, so here's your verification link directly:
                </p>
                <Link
                  to={`/verify-email?token=${verificationInfo.dev_verification_token}`}
                  className="text-copper text-sm"
                >
                  Verify my email →
                </Link>
              </div>
            )}
            <Button onClick={() => navigate('/onboarding')} className="w-full mt-4">
              Continue for now
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

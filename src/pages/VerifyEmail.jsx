import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MailCheck, XCircle } from 'lucide-react';
import client from '../api/client';
import { Card } from '../components/ui.jsx';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token found in the link.');
      return;
    }
    client
      .post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.response?.data?.error || 'Could not verify this email.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-mono text-copper text-xs tracking-[0.2em] uppercase mb-2">Personal Growth OS</p>
        </div>

        <Card className="text-center py-8 px-6">
          {status === 'verifying' && <p className="text-sm text-textDim">Verifying your email…</p>}
          {status === 'success' && (
            <>
              <MailCheck size={26} className="text-mint mx-auto mb-3" />
              <p className="font-medium mb-1">Email verified</p>
              <p className="text-sm text-textDim">You're all set.</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle size={26} className="text-red-400 mx-auto mb-3" />
              <p className="font-medium mb-1">Verification failed</p>
              <p className="text-sm text-textDim">{errorMsg}</p>
            </>
          )}
          <Link to="/" className="inline-block mt-5 text-copper text-sm">Go to app →</Link>
        </Card>
      </div>
    </div>
  );
}

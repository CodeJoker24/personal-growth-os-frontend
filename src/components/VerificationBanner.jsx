import React, { useState } from 'react';
import { MailWarning, X } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

export default function VerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);

  if (!user || user.email_verified || dismissed) return null;

  const resend = async () => {
    const { data } = await client.post('/auth/resend-verification', { email: user.email });
    setSent(true);
    setDevToken(data.dev_verification_token || null);
  };

  return (
    <div className="bg-warnAmber/10 border-b border-warnAmber/20 px-4 py-2.5 text-xs flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-warnAmber">
        <MailWarning size={14} className="shrink-0" />
        {sent ? (
          devToken ? (
            <span>
              New link generated —{' '}
              <a href={`/verify-email?token=${devToken}`} className="underline">verify now</a>
            </span>
          ) : (
            'Verification link sent.'
          )
        ) : (
          <span>
            Please verify your email.{' '}
            <button onClick={resend} className="underline">Resend link</button>
          </span>
        )}
      </span>
      <button onClick={() => setDismissed(true)} className="text-warnAmber/70 hover:text-warnAmber shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

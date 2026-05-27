import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../lib/firebase';

type Portal = 'farmer' | 'supplier';

export default function WebLogin() {
  const navigate = useNavigate();
  const [portal, setPortal] = useState<Portal>('farmer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-primary p-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-white">
          <Leaf className="h-9 w-9 text-brand-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white">AgriRecord</h1>
        <p className="text-sm text-brand-accent-light">Precision Farm Management</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md rounded-[28px] bg-brand-surface p-7 shadow-[var(--shadow-soft)]"
      >
        <h2 className="font-display text-2xl font-bold">Welcome back</h2>
        <p className="mt-1 text-sm text-brand-muted-foreground">Sign in to continue</p>

        <div className="mt-6 flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setPortal('farmer')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold font-display transition ${
              portal === 'farmer' ? 'bg-brand-primary text-white' : 'text-slate-500'
            }`}
          >
            Farmer
          </button>
          <button
            type="button"
            onClick={() => setPortal('supplier')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold font-display transition ${
              portal === 'supplier' ? 'bg-blue-600 text-white' : 'text-slate-500'
            }`}
          >
            Supplier
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-brand-muted-foreground">
              Email
            </label>
            <div className="flex h-[52px] items-center gap-2 rounded-[14px] border border-brand-border bg-brand-muted px-4">
              <Mail className="h-5 w-5 text-brand-muted-foreground" />
              <input
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder="you@farm.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-brand-muted-foreground">
              Password
            </label>
            <div className="flex h-[52px] items-center gap-2 rounded-[14px] border border-brand-border bg-brand-muted px-4">
              <Lock className="h-5 w-5 text-brand-muted-foreground" />
              <input
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-brand-danger">{error}</p> : null}

        <button
          type="button"
          disabled={loading}
          onClick={() => void handleSignIn()}
          className={`mt-6 h-[54px] w-full rounded-2xl font-display text-base font-semibold text-white shadow-cta disabled:opacity-60 ${
            portal === 'supplier' ? 'bg-blue-600' : 'bg-brand-primary'
          }`}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </motion.div>
    </div>
  );
}

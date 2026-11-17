import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Wallet,
  CalendarDays,
  Bot,
  CreditCard,
  Vote,
  FolderLock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI One-Click Planner',
    desc: 'Generate full day-by-day itineraries & budgets instantly with Gemini AI.',
    badge: 'NEW',
    iconBg: 'bg-amber-500/20 text-amber-400',
  },
  {
    icon: CreditCard,
    title: 'Razorpay Instant Settle',
    desc: 'Settle group debts in one click via UPI, cards & netbanking.',
    iconBg: 'bg-sky-500/20 text-sky-400',
  },
  {
    icon: CalendarDays,
    title: 'Live Itineraries',
    desc: 'Collaborative schedules with time slots, maps & role permissions.',
    iconBg: 'bg-indigo-500/20 text-indigo-400',
  },
  {
    icon: Wallet,
    title: 'Smart Expense Splits',
    desc: 'Automated net balance engine with equal & exact split support.',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    icon: Vote,
    title: 'Real-Time Polls & Sync',
    desc: 'Vote on stays & activities with instant WebSocket live updates.',
    iconBg: 'bg-violet-500/20 text-violet-400',
  },
  {
    icon: FolderLock,
    title: 'Document Vault & Memories',
    desc: 'Centralized tickets, hotel vouchers & shared trip photo gallery.',
    iconBg: 'bg-rose-500/20 text-rose-400',
  },
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const justRegistered = location.state?.registered;
  const from =
    location.state?.from?.pathname
      ? location.state.from.pathname + (location.state.from.search || '')
      : '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-slate-100">
      {/* Left Brand Showcase Panel */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-950 border-r border-slate-800/80 p-10 xl:p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TripSync</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Workspace
          </span>
        </div>

        <div className="relative z-10 max-w-2xl my-auto py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-indigo-300 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI-powered group travel & expense workspace</span>
          </div>

          <h1 className="text-3xl xl:text-5xl font-bold tracking-tight leading-[1.15] text-white">
            Plan together.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">
              Split effortlessly.
            </span>
          </h1>

          <p className="text-slate-400 text-sm xl:text-base mt-3 leading-relaxed">
            Generate AI itineraries in one click, collaborate in real time, store booking documents,
            and settle shared expenses via Razorpay in a distraction-free workspace.
          </p>

          <div className="grid grid-cols-2 gap-3.5 mt-7">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-indigo-500/40 transition backdrop-blur-xs"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${feat.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {feat.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {feat.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-5">
          <span>© 2026 TripSync Inc. All rights reserved.</span>
          <span>Gemini AI • WebSockets • Razorpay • JWT RBAC</span>
        </div>
      </div>

      {/* Right Dark Form Panel */}
      <div className="lg:col-span-6 xl:col-span-5 flex items-center justify-center p-6 sm:p-12 bg-slate-950">
        <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/90 p-8 rounded-3xl shadow-2xl">
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">TripSync</span>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-400 mt-1.5">
              Enter your credentials to access your trip workspaces
            </p>
          </div>

          {justRegistered && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Account created successfully! Please sign in.</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? 'Signing in...' : 'Sign in to Workspace'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-7">
            New to TripSync?{' '}
            <Link
              to="/register"
              className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
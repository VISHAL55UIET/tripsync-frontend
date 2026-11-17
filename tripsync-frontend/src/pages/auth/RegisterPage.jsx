import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Bot,
  CreditCard,
  CalendarDays,
  Wallet,
  Vote,
  FolderLock,
} from 'lucide-react';
import { authApi } from '../../api/authApi';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI One-Click Planner',
    desc: 'Generate complete multi-day itineraries & budgets instantly with Gemini AI.',
    badge: 'AI',
    iconBg: 'bg-amber-500/20 text-amber-400',
  },
  {
    icon: CreditCard,
    title: 'Razorpay Instant Settle',
    desc: 'Pay & settle shared trip balances in one click with verified receipts.',
    iconBg: 'bg-sky-500/20 text-sky-400',
  },
  {
    icon: CalendarDays,
    title: 'Collaborative Schedules',
    desc: 'Invite friends via email with Owner, Editor & Viewer role controls.',
    iconBg: 'bg-indigo-500/20 text-indigo-400',
  },
  {
    icon: Wallet,
    title: 'Smart Debt Simplifier',
    desc: 'Track group expenses and minimize transactions automatically.',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    icon: Vote,
    title: 'Live Polls & WebSockets',
    desc: 'Real-time group voting and instant notifications across devices.',
    iconBg: 'bg-violet-500/20 text-violet-400',
  },
  {
    icon: FolderLock,
    title: 'Ticket Vault & Memories',
    desc: 'Store boarding passes, hotel vouchers & shared trip photos safely.',
    iconBg: 'bg-rose-500/20 text-rose-400',
  },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-800' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd) && pwd.length >= 10) score++;

    if (score === 1) return { score: 1, label: 'Fair', color: 'bg-amber-500' };
    if (score === 2) return { score: 2, label: 'Good', color: 'bg-indigo-500' };
    if (score >= 3) return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 0, label: 'Too short (min 8 chars)', color: 'bg-rose-500' };
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    try {
      await authApi.register(form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err?.message || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-slate-100">
      {/* Left Brand Showcase Panel */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-950 border-r border-slate-800/80 p-10 xl:p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

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
            <span>Free workspace for group trips & shared expenses</span>
          </div>

          <h1 className="text-3xl xl:text-5xl font-bold tracking-tight leading-[1.15] text-white">
            Your next adventure deserves a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              smarter workspace.
            </span>
          </h1>

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
          <span>© 2026 TripSync Inc. • Built for seamless group travel</span>
          <span>Gemini AI • WebSockets • Razorpay</span>
        </div>
      </div>

      {/* Right Sign-Up Form Panel */}
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
              Create your account
            </h2>
            <p className="text-sm text-slate-400 mt-1.5">
              Start planning trips and splitting expenses in seconds
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Vishal Singh"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  maxLength={150}
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
                  minLength={8}
                  maxLength={72}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 8 characters"
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

              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1.5 h-1">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full transition-all ${
                          strength.score >= step ? strength.color : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{strength.label}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              <span>{loading ? 'Creating workspace...' : 'Create Free Account'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-7">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ShieldCheck,
  Globe,
  Send,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 mt-0">
      {/* Top Newsletter & CTA Strip */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Product Updates & Travel Tips</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Stay in sync with new TripSync features
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Get release notes on smart expense splitting, itinerary templates, and multi-currency support.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2.5">
            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Subscribed! Thanks for joining.</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full sm:w-72 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition shrink-0"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Main Multi-Column Navigation Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/dashboard" className="inline-flex items-center gap-2.5 text-white font-bold text-xl">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="tracking-tight">TripSync</span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Collaborative group travel planning, role-based trip workspaces, document vaults, and
              automated expense settlements — built for modern travelers.
            </p>

            {/* Live System Status Pill */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>All API Systems Operational</span>
              </div>
            </div>

            {/* Social Icons (Crisp Inline SVGs) */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X / Twitter"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: Workspace (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Workspace</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  My Trips
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Day Itineraries
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Expense Splitter
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Document Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Account & Security (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Account</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/profile" className="hover:text-white transition">
                  Profile Settings
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition">
                  Change Password
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Role Permissions
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Invitations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a
                  href="http://localhost:8080/swagger-ui.html"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  REST API Docs
                </a>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Spring Boot 4 Engine</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">RBAC Access Control</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Redis Caching</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Compliance (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/profile" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition">
                  Data Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Security Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TripSync Technologies Inc. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>English (IN) • INR (₹)</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>256-bit JWT Secured</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
import { Crown, Edit3, Eye, Shield, User } from 'lucide-react';

const ROLE_CONFIG = {
  // Trip-Level Roles
  OWNER: {
    label: 'OWNER',
    classes: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: Crown,
  },
  EDITOR: {
    label: 'EDITOR',
    classes: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: Edit3,
  },
  VIEWER: {
    label: 'VIEWER',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Eye,
  },

  // System-Level Roles
  ADMIN: {
    label: 'ADMIN',
    classes: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Shield,
  },
  USER: {
    label: 'USER',
    classes: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: User,
  },
};

export default function RoleBadge({ role, showIcon = false, className = '' }) {
  const normalizedRole = role?.toUpperCase() || 'VIEWER';
  const config = ROLE_CONFIG[normalizedRole] || ROLE_CONFIG.VIEWER;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${config.classes} ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
}
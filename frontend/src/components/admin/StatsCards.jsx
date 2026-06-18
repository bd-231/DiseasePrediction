import { Users, Stethoscope, ClipboardList, Clock, CheckCircle } from 'lucide-react';

export default function StatsCards({ analytics }) {
  if (!analytics) return null;

  const stats = [
    {
      label: 'Total Patients',
      value: analytics.total_patients ?? 0,
      icon: Users,
      color: 'text-secondary-500',
      bg: 'bg-secondary-50',
    },
    {
      label: 'Doctors',
      value: analytics.total_doctors ?? 0,
      icon: Stethoscope,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Cases',
      value: analytics.total_cases ?? 0,
      icon: ClipboardList,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: 'Pending Review',
      value: analytics.pending_cases ?? 0,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'Approval Rate',
      value: analytics.approval_rate != null ? `${Math.round(analytics.approval_rate)}%` : '—',
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</span>
            <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <stat.icon size={18} className={stat.color} />
            </div>
          </div>
          <p className="text-2xl font-bold text-primary-800">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

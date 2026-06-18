import { useAuth } from '../../context/AuthContext';
import { Heart, LayoutDashboard, Users, BarChart3, ListChecks, FolderOpen, Plus, ClipboardList, User, LogOut, Stethoscope } from 'lucide-react';

const menuItems = {
  admin: [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  ],
  doctor: [
    { key: 'queue', label: 'Patient Queue', icon: ListChecks },
    { key: 'cases', label: 'Reviewed Cases', icon: FolderOpen },
  ],
  patient: [
    { key: 'submit', label: 'Submit Case', icon: Plus },
    { key: 'cases', label: 'My Cases', icon: ClipboardList },
    { key: 'profile', label: 'Profile', icon: User },
  ],
};

export default function Sidebar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth();
  const items = menuItems[user?.role] || [];
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-secondary-500 rounded-lg flex items-center justify-center">
            <Heart size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-primary-800">
            Health<span className="text-secondary-500">AI</span>
          </span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === item.key
                ? 'bg-secondary-50 text-secondary-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-primary-800'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-secondary-100 flex items-center justify-center">
            <Stethoscope size={16} className="text-secondary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary-800 truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

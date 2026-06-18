import Sidebar from './Sidebar';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children, activeTab, onTabChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-[#fafbfc]">
      <div className="hidden lg:block">
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative">
            <Sidebar
              activeTab={activeTab}
              onTabChange={(t) => { onTabChange(t); setSidebarOpen(false); }}
            />
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsCards from '../components/admin/StatsCards';
import UserTable from '../components/admin/UserTable';
import CreateDoctorModal from '../components/admin/CreateDoctorModal';
import CreatePatientModal from '../components/admin/CreatePatientModal';
import AnalyticsCharts from '../components/admin/AnalyticsCharts';
import { adminAPI } from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getUsers(),
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 size={36} className="animate-spin text-secondary-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-primary-800">Admin Dashboard</h1>
                  <p className="text-slate-500 text-sm">System summary and statistics</p>
                </div>
              </div>
              <StatsCards analytics={analytics} />
              <AnalyticsCharts analytics={analytics} />
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-primary-800">User Management</h1>
                  <p className="text-slate-500 text-sm">Create, activate, deactivate, or reset passwords for doctors and patients</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDoctorModal(true)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus size={16} />
                    Create Doctor
                  </button>
                  <button
                    onClick={() => setShowPatientModal(true)}
                    className="flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus size={16} />
                    Create Patient
                  </button>
                </div>
              </div>
              <UserTable users={users} onRefresh={fetchDashboardData} />
            </>
          )}

          {activeTab === 'analytics' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-primary-800">Analytics</h1>
                <p className="text-slate-500 text-sm">Detailed performance graphs and prediction insights</p>
              </div>
              <AnalyticsCharts analytics={analytics} />
            </>
          )}
        </div>
      )}

      <CreateDoctorModal
        isOpen={showDoctorModal}
        onClose={() => setShowDoctorModal(false)}
        onSuccess={fetchDashboardData}
      />
      <CreatePatientModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        onSuccess={fetchDashboardData}
      />
    </DashboardLayout>
  );
}

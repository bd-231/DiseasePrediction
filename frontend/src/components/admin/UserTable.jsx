import { useState } from 'react';
import { ToggleLeft, ToggleRight, KeyRound, Loader2, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { adminAPI } from '../../api/client';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';

export default function UserTable({ users, onRefresh }) {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [toggling, setToggling] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleToggle = async (userId) => {
    setToggling(userId);
    try {
      await adminAPI.toggleUser(userId);
      toast.success('User status updated');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to toggle user');
    } finally {
      setToggling(null);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      await adminAPI.resetPassword(selectedUser.id, { new_password: newPassword });
      toast.success('Password reset successfully');
      setResetModalOpen(false);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(userToDelete.id);
    try {
      await adminAPI.deleteUser(userToDelete.id);
      toast.success(`${userToDelete.full_name}'s account has been deleted`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user');
    } finally {
      setDeleting(null);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Created</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-primary-800">{u.full_name}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      u.role === 'doctor' ? 'bg-blue-50 text-blue-700' : u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(u.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(u.id)}
                        disabled={toggling === u.id || u.role === 'admin'}
                        className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                        title={u.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {toggling === u.id ? (
                          <Loader2 size={16} className="animate-spin text-slate-400" />
                        ) : u.is_active ? (
                          <ToggleRight size={18} className="text-green-500" />
                        ) : (
                          <ToggleLeft size={18} className="text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => { setSelectedUser(u); setResetModalOpen(true); setNewPassword(''); }}
                        disabled={u.role === 'admin'}
                        className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                        title="Reset Password"
                      >
                        <KeyRound size={16} className="text-slate-500" />
                      </button>
                      <button
                        onClick={() => { setUserToDelete(u); setDeleteModalOpen(true); }}
                        disabled={deleting === u.id || u.role === 'admin'}
                        className="p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-30 transition-colors"
                        title="Delete Account"
                      >
                        {deleting === u.id ? (
                          <Loader2 size={16} className="animate-spin text-red-400" />
                        ) : (
                          <Trash2 size={16} className="text-red-500" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Reset Password" size="sm">
        <p className="text-sm text-slate-600 mb-4">Reset password for <strong>{selectedUser?.full_name}</strong></p>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password (min 6 characters)"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-400 mb-4"
        />
        <div className="flex justify-end gap-3">
          <button onClick={() => setResetModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={handleResetPassword} disabled={resetting} className="px-4 py-2 text-sm font-medium text-white bg-secondary-500 rounded-lg hover:bg-secondary-600 disabled:opacity-50 transition-colors flex items-center gap-2">
            {resetting && <Loader2 size={14} className="animate-spin" />}
            Reset
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setUserToDelete(null); }}
        onConfirm={handleDelete}
        title="Delete Account"
        message={`Are you sure you want to permanently delete ${userToDelete?.full_name}'s account? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </>
  );
}

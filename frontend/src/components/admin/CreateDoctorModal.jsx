import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { adminAPI } from '../../api/client';
import toast from 'react-hot-toast';

export default function CreateDoctorModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', specialization: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createDoctor(form);
      toast.success('Doctor created successfully');
      setForm({ full_name: '', email: '', password: '', specialization: '' });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Doctor Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1.5">Full Name</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-400" placeholder="Dr. John Smith" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1.5">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-400" placeholder="doctor@hospital.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1.5">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-400" placeholder="Min 6 characters" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1.5">Specialization</label>
          <input name="specialization" value={form.specialization} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-400" placeholder="e.g. General Medicine" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-secondary-500 rounded-lg hover:bg-secondary-600 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Create Doctor
          </button>
        </div>
      </form>
    </Modal>
  );
}

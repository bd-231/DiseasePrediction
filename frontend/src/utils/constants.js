export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', emoji: '🔴', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { label: 'High', emoji: '🟠', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  medium: { label: 'Medium', emoji: '🟡', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  low: { label: 'Low', emoji: '🟢', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};
export const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-slate-100', text: 'text-slate-600' },
  under_review: { label: 'Under Review', bg: 'bg-blue-50', text: 'text-blue-600' },
  approved: { label: 'Approved', bg: 'bg-green-50', text: 'text-green-700' },
  modified: { label: 'Modified', bg: 'bg-blue-50', text: 'text-blue-700' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700' },
};

export const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'None') return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
export const formatDateTime = (dateStr) => {
  if (!dateStr || dateStr === 'None') return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
export const formatRelativeTime = (dateStr) => {
  if (!dateStr || dateStr === 'None') return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};
export const truncateId = (id) => id ? id.substring(0, 8) : '';
export const formatSymptom = (s) => s.replace(/_/g, ' ').replace(/\s+/g, ' ').replace(/^\.\d+$/, '').trim().replace(/^\w/, c => c.toUpperCase());

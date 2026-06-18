import { PRIORITY_CONFIG } from '../../utils/constants';
export default function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}>{config.emoji} {config.label}</span>;
}

import { statusColors, statusLabels, type PPEStatus } from '../data/mockData';

export function StatusBadge({ status }: { status: PPEStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

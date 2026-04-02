import { Badge } from '@/components/ui/badge';
import { LeaveStatus, STATUS_LABELS } from '../data/leaveData';

const STATUS_STYLES: Record<LeaveStatus, string> = {
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  PENDING: 'bg-orange-100 text-orange-700 border-orange-200',
  WAITING_HR: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function StatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

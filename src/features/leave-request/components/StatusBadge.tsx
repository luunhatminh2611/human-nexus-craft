import { Badge } from '@/components/ui/badge';
import { LeaveStatus, STATUS_LABELS, STATUS_STYLES } from '../data/leaveData';

export default function StatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

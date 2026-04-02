import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { WorkHistory, getWorkHistorySummary } from '../data/workHistoryType';
import WorkHistoryTable from './WorkHistoryTable';
import WorkHistorySummaryCard from './WorkHistorySummaryCard';
import AddHistoryModal from './AddHistoryModal';

const DEMO_EMPLOYEES = [
  { id: 1, name: 'Nguyễn Văn A' },
  { id: 2, name: 'Trần Thị B' },
  { id: 3, name: 'Lê Văn C' },
];

interface Props {
  allHistories: WorkHistory[];
  onHistoriesChange: (updated: WorkHistory[]) => void;
}

export default function WorkHistoryManagement({ allHistories, onHistoriesChange }: Props) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(1);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const employee = DEMO_EMPLOYEES.find((e) => e.id === selectedEmployeeId)!;
  const histories = allHistories.filter((h) => h.employeeId === selectedEmployeeId);
  const summary = getWorkHistorySummary(histories);

  const handleAddHistory = (entry: Omit<WorkHistory, 'id'>) => {
    onHistoriesChange([...allHistories, { ...entry, id: Date.now() }]);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-medium">Nhân viên:</span>
          <Select
            value={String(selectedEmployeeId)}
            onValueChange={(v) => setSelectedEmployeeId(Number(v))}
          >
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEMO_EMPLOYEES.map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button size="sm" onClick={() => setAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Thêm lịch sử
        </Button>
      </div>

      <WorkHistorySummaryCard employeeName={employee.name} summary={summary} />

      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          📋 Lịch sử làm việc
          {histories.length > 0 && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {histories.length} bản ghi
            </span>
          )}
        </h3>
        <WorkHistoryTable histories={histories} />
      </div>

      <AddHistoryModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        employeeId={selectedEmployeeId}
        onSave={handleAddHistory}
      />
    </div>
  );
}

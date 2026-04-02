import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee, employees, Role } from '../data/leaveData';

interface Props {
  role: Role;
  onRoleChange: (role: Role) => void;
  currentEmployee: Employee;
  onEmployeeChange: (emp: Employee) => void;
}

const ROLE_LABELS: Record<Role, string> = {
  EMPLOYEE: 'Nhân viên',
  MANAGER: 'Quản lý',
  HR: 'Phòng Tổ chức (HR)',
};

export default function RoleSwitcher({ role, onRoleChange, currentEmployee, onEmployeeChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Vai trò:</span>
        <Select value={role} onValueChange={(v) => onRoleChange(v as Role)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {role === 'EMPLOYEE' && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Nhân viên:</span>
          <Select
            value={String(currentEmployee.id)}
            onValueChange={(v) => {
              const emp = employees.find((e) => e.id === Number(v));
              if (emp) onEmployeeChange(emp);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// sections/FormHelpers.tsx
import { AlertCircle } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import type { HealthRecord } from '../MedicalFormModal';

export function Field({
  label, required, error, children, className = '',
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />{error}
        </p>
      )}
    </div>
  );
}

export function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b mb-4">
      <span className="text-primary">{icon}</span>
      <span className="font-semibold text-sm">{title}</span>
    </div>
  );
}

export function SubHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 mt-1">{title}</p>
  );
}

export function ClinicalRow({
  label, valueKey, plKey, form, set,
}: {
  label: string;
  valueKey: keyof HealthRecord;
  plKey: keyof HealthRecord;
  form: Partial<HealthRecord>;
  set: (k: keyof HealthRecord, v: any) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 items-end">
      <div className="col-span-2">
        <Field label={label}>
          <Input
            value={(form[valueKey] as string) ?? ''}
            onChange={e => set(valueKey, e.target.value)}
            placeholder="Mô tả kết quả..."
          />
        </Field>
      </div>
      <Field label="Phân loại">
        <Select
          value={(form[plKey] as number)?.toString() ?? ''}
          onValueChange={v => set(plKey, Number(v))}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            {[1,2,3,4,5].map(i => (
              <SelectItem key={i} value={String(i)}>Loại {i}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

export function CheckGroup({
  items, form, set,
}: {
  items: [keyof HealthRecord, string][];
  form: Partial<HealthRecord>;
  set: (k: keyof HealthRecord, v: any) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {items.map(([k, l]) => (
        <label key={k} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors">
          <Checkbox checked={Boolean(form[k])} onCheckedChange={v => set(k, v)} />
          <span className="text-sm">{l}</span>
        </label>
      ))}
    </div>
  );
}
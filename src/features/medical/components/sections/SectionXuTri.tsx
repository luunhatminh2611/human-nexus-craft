// sections/SectionXuTri.tsx
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FileText } from 'lucide-react';
import { SectionHeader, SubHeader } from './FormHelpers';
import type { HealthRecord } from '../MedicalFormModal';

interface Props {
  form: Partial<HealthRecord>;
  set: (k: keyof HealthRecord, v: any) => void;
}

export default function SectionXuTri({ form, set }: Props) {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
        Xử trí
      </h3>

      <SubHeader title="Hình thức xử trí (cols 93-96)" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          ['xuTriDt', '[93] ĐT - Điều trị'],
          ['xuTriTd', '[94] TD - Theo dõi'],
          ['xuTriCk', '[95] CK - Chuyển khoa'],
          ['luuY',    '[96] Lưu ý'],
        ] as [keyof HealthRecord, string][]).map(([k, l]) => (
          <label
            key={k}
            className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${
              form[k] ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Checkbox checked={Boolean(form[k])} onCheckedChange={v => set(k, v)} />
            <span className="text-sm font-medium">{l}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
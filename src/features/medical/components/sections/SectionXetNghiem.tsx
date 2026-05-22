// sections/SectionXetNghiem.tsx
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { FlaskConical } from 'lucide-react';
import { Field, SectionHeader, SubHeader } from './FormHelpers';
import type { HealthRecord } from '../MedicalFormModal';

interface Props {
  form: Partial<HealthRecord>;
  set: (k: keyof HealthRecord, v: any) => void;
  num: (v: string) => number | undefined;
}

export default function SectionXetNghiem({ form, set, num }: Props) {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
        Kết quả xét nghiệm
      </h3>

      {/* [97-101] Công thức máu */}
      <SubHeader title="Công thức máu (cols 97-101)" />
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <Field label="[97] WBC (K/μL)">
          <Input type="number" step="0.01" value={form.wbc ?? ''} onChange={e => set('wbc', num(e.target.value))} />
        </Field>
        <Field label="[98] RBC (M/μL)">
          <Input type="number" step="0.01" value={form.rbc ?? ''} onChange={e => set('rbc', num(e.target.value))} />
        </Field>
        <Field label="[99] HGB (g/dL)">
          <Input type="number" step="0.1" value={form.hgb ?? ''} onChange={e => set('hgb', num(e.target.value))} />
        </Field>
        <Field label="[100] PLT (K/μL)">
          <Input type="number" step="1" value={form.plt ?? ''} onChange={e => set('plt', num(e.target.value))} />
        </Field>
        <Field label="[101] VSS (mm/h)">
          <Input type="number" step="1" value={form.vss ?? ''} onChange={e => set('vss', num(e.target.value))} />
        </Field>
      </div>

      {/* [102-118] Sinh hóa máu */}
      <SubHeader title="Sinh hóa máu (cols 102-118)" />
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        <Field label="[102] Ure (mmol/L)">
          <Input type="number" step="0.01" value={form.ure ?? ''} onChange={e => set('ure', num(e.target.value))} />
        </Field>
        <Field label="[103] Glucoza (mmol/L)">
          <Input type="number" step="0.01" value={form.glucoza ?? ''} onChange={e => set('glucoza', num(e.target.value))} />
        </Field>
        <Field label="[104] Creatinin (μmol/L)">
          <Input type="number" step="0.1" value={form.creatinin ?? ''} onChange={e => set('creatinin', num(e.target.value))} />
        </Field>
        <Field label="[105] A.Uric (μmol/L)">
          <Input type="number" step="0.1" value={form.auric ?? ''} onChange={e => set('auric', num(e.target.value))} />
        </Field>
        <Field label="[106] Cholesterol (mmol/L)">
          <Input type="number" step="0.01" value={form.cholesterol ?? ''} onChange={e => set('cholesterol', num(e.target.value))} />
        </Field>
        <Field label="[107] Triglycerid (mmol/L)">
          <Input type="number" step="0.01" value={form.triglycerid ?? ''} onChange={e => set('triglycerid', num(e.target.value))} />
        </Field>
        <Field label="[108] HDL (mmol/L)">
          <Input type="number" step="0.01" value={form.hdl ?? ''} onChange={e => set('hdl', num(e.target.value))} />
        </Field>
        <Field label="[109] LDL (mmol/L)">
          <Input type="number" step="0.01" value={form.ldl ?? ''} onChange={e => set('ldl', num(e.target.value))} />
        </Field>
        <Field label="[110] GOT/AST (U/L)">
          <Input type="number" step="0.1" value={form.got ?? ''} onChange={e => set('got', num(e.target.value))} />
        </Field>
        <Field label="[111] GPT/ALT (U/L)">
          <Input type="number" step="0.1" value={form.gpt ?? ''} onChange={e => set('gpt', num(e.target.value))} />
        </Field>
        <Field label="[112] GGT (U/L)">
          <Input type="number" step="0.1" value={form.ggt ?? ''} onChange={e => set('ggt', num(e.target.value))} />
        </Field>
        <Field label="[113] Albumin (g/L)">
          <Input type="number" step="0.1" value={form.albumin ?? ''} onChange={e => set('albumin', num(e.target.value))} />
        </Field>
        <Field label="[114] Bilirubin TP (μmol/L)">
          <Input type="number" step="0.1" value={form.bilirubinTp ?? ''} onChange={e => set('bilirubinTp', num(e.target.value))} />
        </Field>
        <Field label="[115] Bilirubin TT (μmol/L)">
          <Input type="number" step="0.1" value={form.bilirubinTt ?? ''} onChange={e => set('bilirubinTt', num(e.target.value))} />
        </Field>
        <Field label="[116] Bilirubin GT (μmol/L)">
          <Input type="number" step="0.1" value={form.bilirubinGt ?? ''} onChange={e => set('bilirubinGt', num(e.target.value))} />
        </Field>
        <Field label="[117] CKMB (U/L)">
          <Input type="number" step="0.1" value={form.ckmb ?? ''} onChange={e => set('ckmb', num(e.target.value))} />
        </Field>
        <Field label="[118] Canxi (mmol/L)">
          <Input type="number" step="0.01" value={form.canxi ?? ''} onChange={e => set('canxi', num(e.target.value))} />
        </Field>
      </div>

      {/* [119-128] Nước tiểu */}
      <SubHeader title="Nước tiểu (cols 119-128)" />
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <Field label="[119] LEU (Bạch cầu)">
          <Input value={form.ntLeu ?? ''} onChange={e => set('ntLeu', e.target.value)} placeholder="Âm/Dương" />
        </Field>
        <Field label="[120] NIT (Nitrite)">
          <Input value={form.ntNit ?? ''} onChange={e => set('ntNit', e.target.value)} placeholder="Âm/Dương" />
        </Field>
        <Field label="[121] Pro (Protein)">
          <Input value={form.ntPro ?? ''} onChange={e => set('ntPro', e.target.value)} placeholder="Âm/Dương" />
        </Field>
        <Field label="[122] pH">
          <Input type="number" step="0.1" value={form.ntPh ?? ''} onChange={e => set('ntPh', num(e.target.value))} />
        </Field>
        <Field label="[123] Ery (Hồng cầu)">
          <Input value={form.ntEry ?? ''} onChange={e => set('ntEry', e.target.value)} placeholder="Âm/Dương" />
        </Field>
        <Field label="[124] SG (Tỷ trọng)">
          <Input type="number" step="0.001" value={form.ntSg ?? ''} onChange={e => set('ntSg', num(e.target.value))} />
        </Field>
        <Field label="[125] KET (Ketone)">
          <Input value={form.ntKet ?? ''} onChange={e => set('ntKet', e.target.value)} placeholder="Âm/Dương" />
        </Field>
        <Field label="[126] BIL (Bilirubin)">
          <Input value={form.ntBil ?? ''} onChange={e => set('ntBil', e.target.value)} placeholder="Âm/Dương" />
        </Field>
        <Field label="[127] GLU (Glucose)">
          <Input value={form.ntGlu ?? ''} onChange={e => set('ntGlu', e.target.value)} placeholder="Âm/Dương" />
        </Field>
        <Field label="[128] UBG (Urobilinogen)">
          <Input value={form.ntUbg ?? ''} onChange={e => set('ntUbg', e.target.value)} placeholder="Âm/Dương" />
        </Field>
      </div>

      {/* [129-135] Huyết thanh & đặc biệt */}
      <SubHeader title="Huyết thanh học & Đặc biệt (cols 129-135)" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="[129] HbA1C (%)">
          <Input type="number" step="0.01" value={form.hba1c ?? ''} onChange={e => set('hba1c', num(e.target.value))} />
        </Field>
        {/* [134] Nhóm máu */}
        <Field label="[134] Nhóm máu">
          <Select value={form.nhomMau ?? ''} onValueChange={v => set('nhomMau', v)}>
            <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
            <SelectContent>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      {/* Boolean serology */}
      <div className="flex flex-wrap gap-4">
        {([
          ['hbsag', '[130] HBsAg'],
          ['hav',   '[131] HAV'],
          ['hcv',   '[132] HCV'],
          ['hev',   '[133] HEV'],
          ['hpylori','[135] H. Pylori'],
        ] as [keyof HealthRecord, string][]).map(([k, l]) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border hover:bg-muted/50">
            <Checkbox checked={Boolean(form[k])} onCheckedChange={v => set(k, v)} />
            <span className="text-sm font-medium">{l}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${form[k] ? 'bg-red-100 text-red-700' : 'bg-green-100 text-gray-500'}`}>
              {form[k] ? 'Dương tính' : 'Âm tính'}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
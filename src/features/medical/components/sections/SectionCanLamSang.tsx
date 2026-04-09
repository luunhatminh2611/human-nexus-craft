// sections/SectionCanLamSang.tsx
import { Input } from '@/shared/components/ui/input';
import { Activity } from 'lucide-react';
import { Field, SectionHeader, SubHeader } from './FormHelpers';
import type { HealthRecord } from '../MedicalFormModal';

interface Props {
  form: Partial<HealthRecord>;
  set: (k: keyof HealthRecord, v: any) => void;
}

export default function SectionCanLamSang({ form, set }: Props) {
  return (
    <div className="space-y-5">
      <SectionHeader icon={<Activity className="h-4 w-4" />} title="Kết quả Cận lâm sàng" />

      {/* [136-152] Chẩn đoán hình ảnh */}
      <SubHeader title="Chẩn đoán hình ảnh (cols 136-152)" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="[136] Siêu âm ổ bụng">
          <Input value={form.sieuAmOBung ?? ''} onChange={e => set('sieuAmOBung', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[137] Siêu âm tuyến giáp">
          <Input value={form.saTuyenGiap ?? ''} onChange={e => set('saTuyenGiap', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[138] Siêu âm tim">
          <Input value={form.saTim ?? ''} onChange={e => set('saTim', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[139] Siêu âm Doppler mạch / Siêu âm khác">
          <Input value={form.saDopplerMachKhac ?? ''} onChange={e => set('saDopplerMachKhac', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[140] Siêu âm vú">
          <Input value={form.saVu ?? ''} onChange={e => set('saVu', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[141] Điện tim">
          <Input value={form.dienTim ?? ''} onChange={e => set('dienTim', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[142] Nội soi TMH">
          <Input value={form.noiSoiTmh ?? ''} onChange={e => set('noiSoiTmh', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[143] Nội soi dạ dày">
          <Input value={form.noiSoiDaDay ?? ''} onChange={e => set('noiSoiDaDay', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[144] Nội soi đại tràng">
          <Input value={form.noiSoiDaiTrang ?? ''} onChange={e => set('noiSoiDaiTrang', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[145] Chức năng hô hấp">
          <Input value={form.chucNangHoHap ?? ''} onChange={e => set('chucNangHoHap', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[146] Loãng xương">
          <Input value={form.loangXuong ?? ''} onChange={e => set('loangXuong', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[147] Xơ vữa mạch">
          <Input value={form.xoVuaMach ?? ''} onChange={e => set('xoVuaMach', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[148] Lưu huyết não">
          <Input value={form.luuHuyetNao ?? ''} onChange={e => set('luuHuyetNao', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[149] X-quang tim phổi">
          <Input value={form.xquangTimPhoi ?? ''} onChange={e => set('xquangTimPhoi', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[150] X-quang khác">
          <Input value={form.xquangKhac ?? ''} onChange={e => set('xquangKhac', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[151] CT can thiệp">
          <Input value={form.ctCanThiep ?? ''} onChange={e => set('ctCanThiep', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[152] Sinh thiết">
          <Input value={form.sinhThiet ?? ''} onChange={e => set('sinhThiet', e.target.value)} placeholder="Kết quả..." />
        </Field>
      </div>

      {/* [153-158] Cận lâm sàng phụ khoa */}
      <SubHeader title="Cận lâm sàng phụ khoa (cols 153-158)" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="[153] Soi CTC">
          <Input value={form.soiCtc ?? ''} onChange={e => set('soiCtc', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[154] Pap smear">
          <Input value={form.papmer ?? ''} onChange={e => set('papmer', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[155] VIA test (Nghiệm pháp QS CTC với Acid Acetic)">
          <Input value={form.viaTest ?? ''} onChange={e => set('viaTest', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[156] VILI test (Nghiệm pháp QS CTC với Lugol)">
          <Input value={form.viliTest ?? ''} onChange={e => set('viliTest', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[157] XN tế bào cổ tử cung">
          <Input value={form.xnTeBaoCoTuCung ?? ''} onChange={e => set('xnTeBaoCoTuCung', e.target.value)} placeholder="Kết quả..." />
        </Field>
        <Field label="[158] Xét nghiệm HPV">
          <Input value={form.xnHpv ?? ''} onChange={e => set('xnHpv', e.target.value)} placeholder="Kết quả..." />
        </Field>
      </div>
    </div>
  );
}
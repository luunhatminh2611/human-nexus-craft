// sections/SectionMoTaKham.tsx
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Stethoscope } from 'lucide-react';
import { Field, SectionHeader, SubHeader, ClinicalRow } from './FormHelpers';
import type { HealthRecord } from '../MedicalFormModal';

interface Props {
  form: Partial<HealthRecord>;
  set: (k: keyof HealthRecord, v: any) => void;
  num: (v: string) => number | undefined;
}

export default function SectionMoTaKham({ form, set, num }: Props) {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
        Mô tả khám chuyên khoa
      </h3>
      {/* [39-58] Nội khoa */}
      <SubHeader title="Nội khoa" />
      <div className="space-y-3">
        {/* [39-40] Tuần hoàn */}
        <ClinicalRow label="[39] Khám tuần hoàn" valueKey="khamTuanHoan" plKey="plKhamTuanHoan" form={form} set={set} />
        {/* [41-42] Hô hấp */}
        <ClinicalRow label="[41] Khám hô hấp" valueKey="khamHoHap" plKey="plKhamHoHap" form={form} set={set} />
        {/* [43-44] Tiêu hóa */}
        <ClinicalRow label="[43] Khám tiêu hóa" valueKey="khamTieuHoa" plKey="plKhamTieuHoa" form={form} set={set} />
        {/* [45-46] Thận - Tiết niệu */}
        <ClinicalRow label="[45] Khám thận - tiết niệu" valueKey="khamThanTietNieu" plKey="plKhamThanTietNieu" form={form} set={set} />
        {/* [47-48] Nội tiết */}
        <ClinicalRow label="[47] Khám nội tiết" valueKey="khamNoiTiet" plKey="plKhamNoiTiet" form={form} set={set} />
        {/* [49-50] Cơ - Xương - Khớp */}
        <ClinicalRow label="[49] Khám cơ - xương - khớp" valueKey="khamCoXuongKhop" plKey="plKhamCxk" form={form} set={set} />
        {/* [51-52] Thần kinh */}
        <ClinicalRow label="[51] Khám thần kinh" valueKey="khamThanKinh" plKey="plKhamThanKinh" form={form} set={set} />
        {/* [53-54] Tâm thần */}
        <ClinicalRow label="[53] Khám tâm thần" valueKey="khamTamThan" plKey="plKhamTamThan" form={form} set={set} />
        {/* [55-56] Ngoại khoa */}
        <ClinicalRow label="[55] Khám ngoại" valueKey="khamNgoai" plKey="plKhamNgoai" form={form} set={set} />
        {/* [57-58] Da liễu */}
        <ClinicalRow label="[57] Khám da liễu" valueKey="khamDaLieu" plKey="plKhamDaLieu" form={form} set={set} />
      </div>

      {/* [59-71] Sản phụ khoa */}
      <SubHeader title="Sản phụ khoa" />
      {/* [59-60] */}
      <ClinicalRow label="[59] Khám sản phụ khoa" valueKey="khamSanPhuKhoa" plKey="plKhamSanKhoa" form={form} set={set} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/40 rounded-lg">
        {/* [61] Tuổi bắt đầu thấy kinh nguyệt */}
        <Field label="[61] Tuổi bắt đầu thấy kinh nguyệt">
          <Input type="number" value={form.tuoiBatDauKinhNguyet ?? ''} onChange={e => set('tuoiBatDauKinhNguyet', num(e.target.value))} />
        </Field>
        {/* [62] Tính chất kinh nguyệt */}
        <Field label="[62] Tính chất kinh nguyệt">
          <Input value={form.tinhChatKinhNguyet ?? ''} onChange={e => set('tinhChatKinhNguyet', e.target.value)} />
        </Field>
        {/* [63] Chu kỳ kinh */}
        <Field label="[63] Chu kỳ kinh (ngày)">
          <Input type="number" value={form.chuKyKinh ?? ''} onChange={e => set('chuKyKinh', num(e.target.value))} />
        </Field>
        {/* [64] Lượng kinh */}
        <Field label="[64] Lượng kinh (ngày)">
          <Input type="number" value={form.luongKinh ?? ''} onChange={e => set('luongKinh', num(e.target.value))} />
        </Field>
        {/* [65] Đau bụng kinh */}
        {/* [66] Đã lập gia đình */}
        {/* [70] Áp dụng BPTT */}
        <div className="col-span-2 md:col-span-4 flex flex-wrap gap-4 pt-1">
          {([
            ['dauBungKinh', '[65] Đau bụng kinh'],
            ['daLapGiaDinh', '[66] Đã lập gia đình'],
            ['apDungBptt', '[70] Áp dụng BPTT'],
          ] as [keyof HealthRecord, string][]).map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={Boolean(form[k])} onCheckedChange={v => set(k, v)} />
              <span className="text-sm">{l}</span>
            </label>
          ))}
        </div>
        {/* [67] PARA */}
        <Field label="[67] PARA">
          <Input value={form.para ?? ''} onChange={e => set('para', e.target.value)} />
        </Field>
        {/* [68] Số lần mổ sản. phụ khoa */}
        <Field label="[68] Số lần mổ sản. phụ khoa">
          <Input type="number" value={form.soLanMoSanPhuKhoa ?? ''} onChange={e => set('soLanMoSanPhuKhoa', num(e.target.value))} />
        </Field>
        {/* [69] Mô tả rõ mổ sản. phụ khoa */}
        <Field label="[69] Mô tả rõ mổ sản. phụ khoa">
          <Input value={form.moTaMoSanPhuKhoa ?? ''} onChange={e => set('moTaMoSanPhuKhoa', e.target.value)} />
        </Field>
        {/* [71] Mô tả rõ BPTT */}
        <Field label="[71] Mô tả rõ BPTT">
          <Input value={form.moTaBptt ?? ''} onChange={e => set('moTaBptt', e.target.value)} />
        </Field>
      </div>

      {/* [72-77] Mắt */}
      <SubHeader title="Mắt" />
      {/* [72-73] */}
      <ClinicalRow label="[72] Khám mắt" valueKey="khamMat" plKey="plKhamMat" form={form} set={set} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* [74] KQ đo mắt trái (không kính) */}
        <Field label="[74] Mắt trái (không kính)">
          <Input value={form.kqMatTraiKhongKinh ?? ''} onChange={e => set('kqMatTraiKhongKinh', e.target.value)} />
        </Field>
        {/* [75] KQ đo mắt phải (không kính) */}
        <Field label="[75] Mắt phải (không kính)">
          <Input value={form.kqMatPhaiKhongKinh ?? ''} onChange={e => set('kqMatPhaiKhongKinh', e.target.value)} />
        </Field>
        {/* [76] KQ đo mắt trái (có kính) */}
        <Field label="[76] Mắt trái (có kính)">
          <Input value={form.kqMatTraiCoKinh ?? ''} onChange={e => set('kqMatTraiCoKinh', e.target.value)} />
        </Field>
        {/* [77] KQ đo mắt phải (có kính) */}
        <Field label="[77] Mắt phải (có kính)">
          <Input value={form.kqMatPhaiCoKinh ?? ''} onChange={e => set('kqMatPhaiCoKinh', e.target.value)} />
        </Field>
      </div>

      {/* [78-83] Tai - Mũi - Họng */}
      <SubHeader title="Tai - Mũi - Họng" />
      {/* [78-79] */}
      <ClinicalRow label="[78] Khám Tai - Mũi - Họng" valueKey="khamTaiMuiHong" plKey="plKhamTmh" form={form} set={set} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* [80] Nói thường (Tai trái) */}
        <Field label="[80] Nói thường (Tai trái) (m)">
          <Input type="number" value={form.noiThuongTaiTrai ?? ''} onChange={e => set('noiThuongTaiTrai', num(e.target.value))} />
        </Field>
        {/* [81] Nói thường (Tai phải) */}
        <Field label="[81] Nói thường (Tai phải) (m)">
          <Input type="number" value={form.noiThuongTaiPhai ?? ''} onChange={e => set('noiThuongTaiPhai', num(e.target.value))} />
        </Field>
        {/* [82] Nói thầm (Tai trái) */}
        <Field label="[82] Nói thầm (Tai trái) (m)">
          <Input type="number" value={form.noiThamTaiTrai ?? ''} onChange={e => set('noiThamTaiTrai', num(e.target.value))} />
        </Field>
        {/* [83] Nói thầm (Tai phải) */}
        <Field label="[83] Nói thầm (Tai phải) (m)">
          <Input type="number" value={form.noiThamTaiPhai ?? ''} onChange={e => set('noiThamTaiPhai', num(e.target.value))} />
        </Field>
      </div>

      {/* [84-87] Răng - Hàm - Mặt */}
      <SubHeader title="Răng - Hàm - Mặt" />
      {/* [84-85] */}
      <ClinicalRow label="[84] Khám răng - hàm - mặt" valueKey="khamRangHamMat" plKey="plKhamRhm" form={form} set={set} />
      <div className="grid grid-cols-2 gap-3">
        {/* [86] Hàm trên */}
        <Field label="[86] Hàm trên">
          <Input value={form.hamTren ?? ''} onChange={e => set('hamTren', e.target.value)} />
        </Field>
        {/* [87] Hàm dưới */}
        <Field label="[87] Hàm dưới">
          <Input value={form.hamDuoi ?? ''} onChange={e => set('hamDuoi', e.target.value)} />
        </Field>
      </div>

      {/* [88-92] Kết luận lâm sàng */}
      <SubHeader title="Kết luận lâm sàng" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* [88] Kết quả CLS */}
        <Field label="[88] Kết quả CLS">
          <Input value={form.ketQuaCls ?? ''} onChange={e => set('ketQuaCls', e.target.value)} />
        </Field>
        {/* [89] Đánh giá CLS */}
        <Field label="[89] Đánh giá CLS">
          <Input value={form.danhGiaCls ?? ''} onChange={e => set('danhGiaCls', e.target.value)} />
        </Field>
        {/* [90] Mô tả kết luận */}
        <Field label="[90] Mô tả kết luận">
          <Input value={form.moTaKetLuan ?? ''} onChange={e => set('moTaKetLuan', e.target.value)} placeholder="Tóm tắt kết quả khám..." />
        </Field>
        {/* [91] Hướng giải quyết */}
        <Field label="[91] Hướng giải quyết">
          <Input value={form.huongGiaiQuyet ?? ''} onChange={e => set('huongGiaiQuyet', e.target.value)} placeholder="Điều trị, nhập viện, theo dõi..." />
        </Field>
        {/* [92] Người kết luận */}
        <Field label="[92] Người kết luận">
          <Input value={form.nguoiKetLuan ?? ''} onChange={e => set('nguoiKetLuan', e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
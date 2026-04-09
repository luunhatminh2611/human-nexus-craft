// sections/SectionThongTinChung.tsx
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { User } from 'lucide-react';
import { Field, SectionHeader, SubHeader } from './FormHelpers';
import type { HealthRecord } from '../MedicalFormModal';

interface Props {
  form: Partial<HealthRecord>;
  set: (k: keyof HealthRecord, v: any) => void;
  errors: Record<string, string>;
  num: (v: string) => number | undefined;
}

export default function SectionThongTinChung({ form, set, errors, num }: Props) {
  return (
    <div className="space-y-5">
      <SectionHeader icon={<User className="h-4 w-4" />} title="Thông tin chung" />

      {/* === THÔNG TIN CHUNG (cols 0-5) === */}
      <SubHeader title="Thông tin nhân viên" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* [0] Mã BHXH */}
        <Field label="Mã BHXH" required error={errors.maBhxh}>
          <Input
            value={form.maBhxh ?? ''}
            onChange={e => set('maBhxh', e.target.value)}
            placeholder="Mã BHXH"
            className={errors.maBhxh ? 'border-red-500' : ''}
          />
        </Field>
        {/* [1] Họ và tên */}
        <Field label="Họ và tên">
          <Input value={form.hoVaTen ?? ''} onChange={e => set('hoVaTen', e.target.value)} />
        </Field>
        {/* [2] Năm sinh */}
        <Field label="Năm sinh">
          <Input type="number" value={form.namSinh ?? ''} onChange={e => set('namSinh', num(e.target.value))} placeholder="1990" />
        </Field>
        {/* [3] Chức danh */}
        <Field label="Chức danh">
          <Input value={form.chucDanh ?? ''} onChange={e => set('chucDanh', e.target.value)} />
        </Field>
        {/* [4] Công trường / Phân xưởng / Phòng ban */}
        <Field label="Công trường / Phân xưởng / Phòng ban">
          <Input value={form.congTruong ?? ''} onChange={e => set('congTruong', e.target.value)} />
        </Field>
        {/* [5] Đơn vị */}
        <Field label="Đơn vị">
          <Input value={form.donVi ?? ''} onChange={e => set('donVi', e.target.value)} />
        </Field>
      </div>

      {/* === KẾT QUẢ (cols 6-38) === */}
      <SubHeader title="Kết quả khám" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* [6] Ngày khám */}
        <Field label="Ngày khám" required error={errors.ngayKham}>
          <Input
            type="date"
            value={form.ngayKham ?? ''}
            onChange={e => set('ngayKham', e.target.value)}
            className={errors.ngayKham ? 'border-red-500' : ''}
          />
        </Field>
        {/* [7] Chiều cao */}
        <Field label="Chiều cao (cm)">
          <Input type="number" value={form.chieuCao ?? ''} onChange={e => set('chieuCao', num(e.target.value))} />
        </Field>
        {/* [8] Cân nặng */}
        <Field label="Cân nặng (kg)">
          <Input type="number" value={form.canNang ?? ''} onChange={e => set('canNang', num(e.target.value))} />
        </Field>
        {/* [9] Mạch */}
        <Field label="Mạch (lần/phút)">
          <Input type="number" value={form.mach ?? ''} onChange={e => set('mach', num(e.target.value))} />
        </Field>
        {/* [10] Huyết áp */}
        <Field label="Huyết áp (mmHg)">
          <Input value={form.huyetAp ?? ''} onChange={e => set('huyetAp', e.target.value)} placeholder="120/80" />
        </Field>
        {/* [11] PL Thể lực */}
        <Field label="PL Thể lực">
          <Select value={form.plTheLuc?.toString() ?? ''} onValueChange={v => set('plTheLuc', Number(v))}>
            <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
            <SelectContent>{[1, 2, 3, 4, 5].map(i => <SelectItem key={i} value={String(i)}>Loại {i}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        {/* [12] PL Sức khỏe */}
        <Field label="PL Sức khỏe">
          <Select value={form.plSucKhoe?.toString() ?? ''} onValueChange={v => set('plSucKhoe', Number(v))}>
            <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
            <SelectContent>{[1, 2, 3, 4, 5].map(i => <SelectItem key={i} value={String(i)}>Loại {i}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        {/* [13] Bệnh thông thường */}
        <Field label="Bệnh thông thường">
          <Input value={form.benhThongThuong ?? ''} onChange={e => set('benhThongThuong', e.target.value)} />
        </Field>
        {/* [14] Mã bệnh thông thường */}
        <Field label="Mã bệnh thông thường (ICD-10)">
          <Input value={form.maBenhThongThuong ?? ''} onChange={e => set('maBenhThongThuong', e.target.value)} placeholder="ICD-10" />
        </Field>
        {/* [15] Số ngày nghỉ ốm */}
        <Field label="Số ngày nghỉ ốm">
          <Input type="number" value={form.soNgayNghiOm ?? ''} onChange={e => set('soNgayNghiOm', num(e.target.value))} />
        </Field>
        {/* [16] Bệnh mãn tính */}
        <Field label="Bệnh mãn tính">
          <Input value={form.benhManTinh ?? ''} onChange={e => set('benhManTinh', e.target.value)} />
        </Field>
        {/* [17] Mã bệnh mãn tính */}
        <Field label="Mã bệnh mãn tính (ICD-10)">
          <Input value={form.maBenhManTinh ?? ''} onChange={e => set('maBenhManTinh', e.target.value)} placeholder="ICD-10" />
        </Field>
        {/* [18] Phân loại nghề nghiệp */}
        <Field label="Phân loại nghề nghiệp">
          <Select value={form.phanLoaiNgheNghiep?.toString() ?? ''} onValueChange={v => set('phanLoaiNgheNghiep', Number(v))}>
            <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
            <SelectContent>{[1, 2, 3, 4, 5].map(i => <SelectItem key={i} value={String(i)}>Loại {i}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>

      {/* [19-24] Tai nạn lao động */}
      <div>
        <SubHeader title="Tai nạn lao động" />
        <div className="flex flex-wrap gap-6 mb-3">
          {/* [19] NLĐ tiếp xúc trực tiếp với các yếu tố có hại */}
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={Boolean(form.nldTiepXucYeuToCoHai)} onCheckedChange={v => set('nldTiepXucYeuToCoHai', v)} />
            <span className="text-sm">[19] NLĐ tiếp xúc trực tiếp với các yếu tố có hại</span>
          </label>
          {/* [20] Bị tai nạn lao động */}
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={Boolean(form.biTaiNanLaoDong)} onCheckedChange={v => set('biTaiNanLaoDong', v)} />
            <span className="text-sm">[20] Bị tai nạn lao động</span>
          </label>
        </div>
        {form.biTaiNanLaoDong && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/40 rounded-lg">
            {/* [21] Ngày bị tai nạn lao động */}
            <Field label="[21] Ngày bị TNLĐ">
              <Input type="date" value={form.ngayBiTaiNanLaoDong ?? ''} onChange={e => set('ngayBiTaiNanLaoDong', e.target.value)} />
            </Field>
            {/* [22] Số ngày điều trị TNLĐ */}
            <Field label="[22] Số ngày điều trị TNLĐ">
              <Input type="number" value={form.soNgayDieuTriTnld ?? ''} onChange={e => set('soNgayDieuTriTnld', num(e.target.value))} />
            </Field>
            {/* [23] Tỷ lệ giám định TNLĐ */}
            <Field label="[23] Tỷ lệ giám định TNLĐ (%)">
              <Input type="number" value={form.tyLeGiamDinhTnld ?? ''} onChange={e => set('tyLeGiamDinhTnld', num(e.target.value))} />
            </Field>
            {/* [24] Năm hưởng trợ cấp TNLĐ */}
            <Field label="[24] Năm hưởng trợ cấp TNLĐ">
              <Input type="number" value={form.namHuongTroCapTnld ?? ''} onChange={e => set('namHuongTroCapTnld', num(e.target.value))} />
            </Field>
          </div>
        )}
      </div>

      {/* [25-38] Bệnh nghề nghiệp */}
      <div>
        <SubHeader title="Bệnh nghề nghiệp (BNN)" />
        <div className="flex flex-wrap gap-6 mb-3">
          {/* [25] NLĐ được KSK phát hiện BNN */}
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={Boolean(form.nldKskPhatHienBnn)} onCheckedChange={v => set('nldKskPhatHienBnn', v)} />
            <span className="text-sm">[25] NLĐ được KSK phát hiện BNN</span>
          </label>
          {/* [26] NLĐ được chẩn đoán BNN */}
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={Boolean(form.nldChanDoanBnn)} onCheckedChange={v => set('nldChanDoanBnn', v)} />
            <span className="text-sm">[26] NLĐ được chẩn đoán BNN</span>
          </label>
        </div>
        {/* [27-29]: hiện khi tích [25] hoặc [26] */}
        {(form.nldKskPhatHienBnn || form.nldChanDoanBnn) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 bg-muted/40 rounded-lg">
            <Field label="[27] Chức danh nghề khi mắc BNN">
              <Input value={form.chucDanhNgheKhiMacBnn ?? ''} onChange={e => set('chucDanhNgheKhiMacBnn', e.target.value)} />
            </Field>
            <Field label="[28] Tên bệnh nghề nghiệp">
              <Input value={form.tenBenhNgheNghiep ?? ''} onChange={e => set('tenBenhNgheNghiep', e.target.value)} />
            </Field>
            <Field label="[29] Mã bệnh nghề nghiệp">
              <Input value={form.maBenhNgheNghiep ?? ''} onChange={e => set('maBenhNgheNghiep', e.target.value)} />
            </Field>

            {/* [30-34]: chỉ hiện thêm khi tích [26] */}
            {form.nldChanDoanBnn && (
              <>
                <Field label="[30] Thời gian hội chẩn BNN">
                  <Input type="date" value={form.thoiGianHoiChanBnn ?? ''} onChange={e => set('thoiGianHoiChanBnn', e.target.value)} />
                </Field>
                <Field label="[31] Thể bệnh">
                  <Input value={form.theBenh ?? ''} onChange={e => set('theBenh', e.target.value)} />
                </Field>
                <Field label="[32] Năm giám định BNN">
                  <Input type="number" value={form.namGiamDinhBnn ?? ''} onChange={e => set('namGiamDinhBnn', num(e.target.value))} />
                </Field>
                <Field label="[33] Tỷ lệ giám định BNN (%)">
                  <Input type="number" value={form.tyLeGiamDinhBnn ?? ''} onChange={e => set('tyLeGiamDinhBnn', num(e.target.value))} />
                </Field>
                <Field label="[34] Năm hưởng trợ cấp BNN">
                  <Input type="number" value={form.namHuongTroCapBnn ?? ''} onChange={e => set('namHuongTroCapBnn', num(e.target.value))} />
                </Field>
              </>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-6 mt-3 mb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={Boolean(form.daRuaPhoi)} onCheckedChange={v => set('daRuaPhoi', v)} />
            <span className="text-sm">[35] Đã rửa phổi</span>
          </label>
        </div>
        
        {form.daRuaPhoi && (
          <Field label="[36] Năm rửa phổi">
            <Input type="number" value={form.namRuaPhoi ?? ''} onChange={e => set('namRuaPhoi', num(e.target.value))} />
          </Field>
        )}

        {/* [37] chỉ hiện khi có BNN ([25] hoặc [26]) VÀ KHÔNG tích [35] */}
        {(form.nldKskPhatHienBnn || form.nldChanDoanBnn) && !form.daRuaPhoi && (
          <Field label="[37] NLĐ chống chỉ định rửa phổi">
            <Input value={form.chongChiDinhRuaPhoi ?? ''} onChange={e => set('chongChiDinhRuaPhoi', e.target.value)} />
          </Field>
        )}
        {/* [38] Tiền sử bệnh, tật của gia đình */}
        <Field label="[38] Tiền sử bệnh. tật của gia đình" className="md:col-span-3">
          <Input value={form.tienSuBenhGiaDinh ?? ''} onChange={e => set('tienSuBenhGiaDinh', e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
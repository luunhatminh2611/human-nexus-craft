// sections/SectionBenhPhatHien.tsx
import { Input } from '@/shared/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { Field, SectionHeader, SubHeader, CheckGroup } from './FormHelpers';
import type { HealthRecord } from '../MedicalFormModal';

interface Props {
  form: Partial<HealthRecord>;
  set: (k: keyof HealthRecord, v: any) => void;
}

export default function SectionBenhPhatHien({ form, set }: Props) {
  return (
    <div className="space-y-5">
      <SectionHeader icon={<AlertCircle className="h-4 w-4" />} title="Bệnh phát hiện qua khám sức khỏe" />

      {/* [159-193] Nội khoa */}
      <SubHeader title="Nội khoa (cols 159-193)" />
      <CheckGroup form={form} set={set} items={[
        ['laoPhoi',                    '[159] Lao phổi'],
        ['ungThuPhoi',                 '[160] Ung thư phổi'],
        ['viemXoangCap',               '[161] Viêm xoang. mũi họng. thanh quản cấp'],
        ['viemXoangMan',               '[162] Viêm xoang. mũi họng. thanh quản mãn'],
        ['viemPheQuanCap',             '[163] Viêm phế quản cấp'],
        ['viemPheQuanMan',             '[164] Viêm phế quản mãn'],
        ['viemPhoi',                   '[165] Viêm phổi'],
        ['henPheQuanDiUng',            '[166] Hen phế quản. giãn phế quản. dị ứng'],
        ['iaCHayViemDaDayRuot',        '[167] Ỉa chảy. viêm dạ dày. ruột do NT'],
        ['noiTiet',                    '[168] Nội tiết'],
        ['benhTamThan',                '[169] Bệnh tâm thần'],
        ['benhThanKinhTwNgoaiBien',    '[170] Bệnh thần kinh TW và ngoại biên'],
        ['haCanTheoDoi',               '[171] HA cần theo dõi'],
        ['haCanDieuTri',               '[172] HA cần điều trị'],
        ['benhTimMach',                '[173] Bệnh tim mạch'],
        ['benhVanTim',                 '[174] Bệnh van tim'],
        ['roiLoanNhipTim',             '[175] Rối loạn nhịp tim'],
        ['viemDaDay',                  '[176] Viêm dạ dày'],
        ['viemDaiTrang',               '[177] Viêm đại tràng'],
        ['basedow',                    '[178] Basedow'],
        ['tieuDuong',                  '[179] Tiểu đường'],
        ['tangRlDuong',                '[180] Tăng. RL đường'],
        ['rlMoMau',                    '[181] RL mỡ máu'],
        ['tangMenGan',                 '[182] Tăng men gan'],
        ['tangAcidUric',               '[183] Tăng Acid Uric'],
        ['viemGanXoGan',               '[184] Viêm gan. xơ gan'],
        ['benhThanTietNieu',           '[185] Bệnh thận. tiết niệu'],
        ['soiTietNieu',                '[186] Sỏi tiết niệu'],
        ['nangThan',                   '[187] Nang thận'],
        ['nangNhanTuyenGiap',          '[188] Nang. nhân tuyến giáp'],
        ['ganNhiemMo',                 '[189] Gan nhiễm mỡ'],
        ['soiPolipTuiMat',             '[190] Sỏi. polip túi mật'],
        ['ungThuNoiKhoa',              '[191] Ung thư (nội khoa)'],
        ['benhSotRet',                 '[193] Bệnh sốt rét'],
      ]} />
      {/* [192] Bệnh khác (nội khoa) */}
      <Field label="[192] Bệnh khác (nội khoa)">
        <Input value={form.benhKhacNoiKhoa ?? ''} onChange={e => set('benhKhacNoiKhoa', e.target.value)} />
      </Field>

      {/* [194-197] Tai Mũi Họng */}
      <SubHeader title="Tai - Mũi - Họng (cols 194-197)" />
      <CheckGroup form={form} set={set} items={[
        ['vmuiHongAmidalXoang', '[194] Viêm mũi họng. Amidal. xoang mãn tính'],
        ['viemTai',             '[195] Viêm tai'],
        ['polipMui',            '[196] Polip mũi'],
      ]} />
      {/* [197] Bệnh khác TMH */}
      <Field label="[197] Bệnh khác (TMH)">
        <Input value={form.benhKhacTmh ?? ''} onChange={e => set('benhKhacTmh', e.target.value)} />
      </Field>

      {/* [198-201] Răng Hàm Mặt */}
      <SubHeader title="Răng - Hàm - Mặt (cols 198-201)" />
      <CheckGroup form={form} set={set} items={[
        ['sauRang',    '[198] Sâu răng'],
        ['rangMocLech','[199] Răng mọc lệch'],
        ['matRang',    '[200] Mất răng'],
      ]} />
      {/* [201] Bệnh khác RHM */}
      <Field label="[201] Bệnh khác (RHM)">
        <Input value={form.benhKhacRhm ?? ''} onChange={e => set('benhKhacRhm', e.target.value)} />
      </Field>

      {/* [202-206] Mắt */}
      <SubHeader title="Mắt (cols 202-206)" />
      <CheckGroup form={form} set={set} items={[
        ['tatKhucXa',      '[202] Tật khúc xạ'],
        ['laoThi',         '[203] Lão thị'],
        ['giamThiLuc',     '[204] Giảm thị lực'],
        ['ducThuyTinhThe', '[205] Đục thuỷ tinh thể'],
      ]} />
      {/* [206] Bệnh khác Mắt */}
      <Field label="[206] Bệnh khác (Mắt)">
        <Input value={form.benhKhacMat ?? ''} onChange={e => set('benhKhacMat', e.target.value)} />
      </Field>

      {/* [207-216] Ngoại khoa */}
      <SubHeader title="Ngoại khoa (cols 207-216)" />
      <CheckGroup form={form} set={set} items={[
        ['ucacLoai',               '[207] U các loại'],
        ['nangNhanTuyenVu',        '[208] Nang. nhân tuyến vú'],
        ['tri',                    '[209] Trĩ'],
        ['benhXuongKhop',          '[210] Bệnh xương khớp'],
        ['vetMoOBung',             '[211] Vết mổ ổ bụng'],
        ['gayXuongCu',             '[212] Gãy xương cũ'],
        ['matDotNgonTayChanCu',   '[213] Mất đốt ngón tay chân cũ'],
        ['taiNanChanThuongCu',    '[214] Tai nạn. chấn thương cũ'],
        ['sayThai',                '[216] Sảy thai'],
      ]} />
      {/* [215] Bệnh khác Ngoại khoa */}
      <Field label="[215] Bệnh khác (ngoại khoa)">
        <Input value={form.benhKhacNgoaiKhoa ?? ''} onChange={e => set('benhKhacNgoaiKhoa', e.target.value)} />
      </Field>

      {/* [217-223] Phụ khoa */}
      <SubHeader title="Phụ khoa (cols 217-223)" />
      <CheckGroup form={form} set={set} items={[
        ['viemNamAmDao', '[217] Viêm. nấm âm đạo'],
        ['viemCtc',      '[218] Viêm CTC'],
        ['nhanXoTuCung', '[219] Nhân xơ tử cung'],
        ['uxoTuCung',    '[220] U xơ tử cung'],
        ['nangBt',       '[221] Nang BT'],
        ['polipCtc',     '[222] Polip CTC'],
      ]} />
      {/* [223] Bệnh khác Phụ khoa */}
      <Field label="[223] Bệnh khác (phụ khoa)">
        <Input value={form.benhKhacPhuKhoa ?? ''} onChange={e => set('benhKhacPhuKhoa', e.target.value)} />
      </Field>

      {/* [224-229] Da liễu */}
      <SubHeader title="Da liễu (cols 224-229)" />
      <CheckGroup form={form} set={set} items={[
        ['viemDa',  '[224] Viêm da'],
        ['vayNen',  '[225] Vảy nến'],
        ['langBen', '[226] Lang ben'],
        ['namDa',   '[227] Nấm da'],
        ['sanNgua', '[228] Sẩn ngứa'],
      ]} />
      {/* [229] Bệnh khác Da liễu */}
      <Field label="[229] Bệnh khác (da liễu)">
        <Input value={form.benhKhacDaLieu ?? ''} onChange={e => set('benhKhacDaLieu', e.target.value)} />
      </Field>
    </div>
  );
}
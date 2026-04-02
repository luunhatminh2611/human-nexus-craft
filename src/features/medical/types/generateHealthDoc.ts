// utils/generateHealthDoc.ts
// Tạo file Word (Mẫu số 03 - Thông tư 32/2023/TT-BYT) từ dữ liệu HealthRecord
// Cài đặt: npm install docx file-saver
// npm install --save-dev @types/file-saver

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
} from 'docx';
import { saveAs } from 'file-saver';
import type { HealthRecord } from '../components/MedicalFormModal';

// ─── Border helpers ────────────────────────────────────────────────────────────

const B = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const BORDERS = { top: B, bottom: B, left: B, right: B };
const NO_B = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: NO_B, bottom: NO_B, left: NO_B, right: NO_B };

// ─── Cell factory ─────────────────────────────────────────────────────────────

interface CellOpts {
  noBorder?: boolean;
  shade?: string;
  bold?: boolean;
  italic?: boolean;
  center?: boolean;
  right?: boolean;
  width?: number;
  span?: number;
  size?: number;
}

function makeCell(text: string, opts: CellOpts = {}): TableCell {
  return new TableCell({
    borders: opts.noBorder ? NO_BORDERS : BORDERS,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: opts.span,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: opts.center
        ? AlignmentType.CENTER
        : opts.right ? AlignmentType.RIGHT : AlignmentType.LEFT,
      children: [new TextRun({
        text: text ?? '',
        bold: opts.bold,
        italics: opts.italic,
        size: opts.size ?? 22,
        font: 'Times New Roman',
      })],
    })],
  });
}

// ─── Paragraph factory ────────────────────────────────────────────────────────

interface ParaOpts {
  bold?: boolean;
  italic?: boolean;
  center?: boolean;
  right?: boolean;
  size?: number;
  spaceBefore?: number;
  spaceAfter?: number;
  underline?: boolean;
}

function makePara(text: string, opts: ParaOpts = {}): Paragraph {
  return new Paragraph({
    alignment: opts.center
      ? AlignmentType.CENTER
      : opts.right ? AlignmentType.RIGHT : AlignmentType.LEFT,
    spacing: { before: opts.spaceBefore ?? 60, after: opts.spaceAfter ?? 60 },
    children: [new TextRun({
      text: text ?? '',
      bold: opts.bold,
      italics: opts.italic,
      size: opts.size ?? 22,
      font: 'Times New Roman',
      underline: opts.underline ? {} : undefined,
    })],
  });
}

// ─── Value formatters ─────────────────────────────────────────────────────────

const fVal = (v: string | number | undefined | null): string =>
  (v !== undefined && v !== null && v !== '') ? String(v) : '..........';

const fDate = (d: string | undefined): string =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('vi-VN') : '..........';

const fCheck = (v: boolean | undefined): string => v ? '☑' : '☐';

const fPl = (n: number | undefined): string => n ? `Loại ${n}` : '..........';

// ─── Main export function ─────────────────────────────────────────────────────

export async function downloadHealthDoc(record: HealthRecord): Promise<void> {
  const r = record;
  const TABLE_W = 9360; // A4 với margin 1.5cm mỗi bên

  // ── Tổng hợp bệnh phát hiện ─────────────────────────────────────────────
  const diseases: string[] = [];
  const addDisease = (flag: boolean | undefined, name: string) => { if (flag) diseases.push(name); };

  // Nội khoa
  addDisease(r.laoPhoi, 'Lao phổi');
  addDisease(r.ungThuPhoi, 'Ung thư phổi');
  addDisease(r.viemXoangCap, 'Viêm xoang, mũi họng, thanh quản cấp');
  addDisease(r.viemXoangMan, 'Viêm xoang, mũi họng, thanh quản mãn');
  addDisease(r.viemPheQuanCap, 'Viêm phế quản cấp');
  addDisease(r.viemPheQuanMan, 'Viêm phế quản mãn');
  addDisease(r.viemPhoi, 'Viêm phổi');
  addDisease(r.henPheQuanDiUng, 'Hen phế quản, giãn phế quản, dị ứng');
  addDisease(r.iaCHayViemDaDayRuot, 'Ỉa chảy, viêm dạ dày ruột do NT');
  addDisease(r.benhTamThan, 'Bệnh tâm thần');
  addDisease(r.benhThanKinhTwNgoaiBien, 'Bệnh thần kinh TW và ngoại biên');
  addDisease(r.haCanTheoDoi, 'HA cần theo dõi');
  addDisease(r.haCanDieuTri, 'HA cần điều trị');
  addDisease(r.benhTimMach, 'Bệnh tim mạch');
  addDisease(r.benhVanTim, 'Bệnh van tim');
  addDisease(r.roiLoanNhipTim, 'Rối loạn nhịp tim');
  addDisease(r.viemDaDay, 'Viêm dạ dày');
  addDisease(r.viemDaiTrang, 'Viêm đại tràng');
  addDisease(r.basedow, 'Basedow');
  addDisease(r.tieuDuong, 'Tiểu đường');
  addDisease(r.tangRlDuong, 'Tăng, rối loạn đường');
  addDisease(r.rlMoMau, 'Rối loạn mỡ máu');
  addDisease(r.tangMenGan, 'Tăng men gan');
  addDisease(r.tangAcidUric, 'Tăng Acid Uric');
  addDisease(r.viemGanXoGan, 'Viêm gan, xơ gan');
  addDisease(r.ganNhiemMo, 'Gan nhiễm mỡ');
  addDisease(r.soiPolipTuiMat, 'Sỏi, polip túi mật');
  addDisease(r.soiTietNieu, 'Sỏi tiết niệu');
  addDisease(r.nangThan, 'Nang thận');
  addDisease(r.benhThanTietNieu, 'Bệnh thận, tiết niệu');
  addDisease(r.nangNhanTuyenGiap, 'Nang, nhân tuyến giáp');
  addDisease(r.ungThuNoiKhoa, 'Ung thư (nội khoa)');
  addDisease(r.benhSotRet, 'Bệnh sốt rét');
  // TMH
  addDisease(r.vmuiHongAmidalXoang, 'Viêm mũi họng, Amidal, xoang mạn tính');
  addDisease(r.viemTai, 'Viêm tai');
  addDisease(r.polipMui, 'Polip mũi');
  // RHM
  addDisease(r.sauRang, 'Sâu răng');
  addDisease(r.rangMocLech, 'Răng mọc lệch');
  addDisease(r.matRang, 'Mất răng');
  // Mắt
  addDisease(r.tatKhucXa, 'Tật khúc xạ');
  addDisease(r.laoThi, 'Lão thị');
  addDisease(r.giamThiLuc, 'Giảm thị lực');
  addDisease(r.ducThuyTinhThe, 'Đục thuỷ tinh thể');
  // Ngoại khoa
  addDisease(r.ucacLoai, 'U các loại');
  addDisease(r.nangNhanTuyenVu, 'Nang, nhân tuyến vú');
  addDisease(r.tri, 'Trĩ');
  addDisease(r.benhXuongKhop, 'Bệnh xương khớp');
  addDisease(r.vetMoOBung, 'Vết mổ ổ bụng');
  addDisease(r.gayXuongCu, 'Gãy xương cũ');
  addDisease(r.matDotNgonTayChanCu, 'Mất đốt ngón tay chân cũ');
  addDisease(r.taiNanChanThuongCu, 'Tai nạn, chấn thương cũ');
  // Phụ khoa
  addDisease(r.sayThai, 'Sảy thai');
  addDisease(r.viemNamAmDao, 'Viêm, nấm âm đạo');
  addDisease(r.viemCtc, 'Viêm CTC');
  addDisease(r.nhanXoTuCung, 'Nhân xơ tử cung');
  addDisease(r.uxoTuCung, 'U xơ tử cung');
  addDisease(r.nangBt, 'Nang BT');
  addDisease(r.polipCtc, 'Polip CTC');
  // Da liễu
  addDisease(r.viemDa, 'Viêm da');
  addDisease(r.vayNen, 'Vảy nến');
  addDisease(r.langBen, 'Lang ben');
  addDisease(r.namDa, 'Nấm da');
  addDisease(r.sanNgua, 'Sẩn ngứa');

  // Bệnh khác text
  [r.benhKhacNoiKhoa, r.benhKhacTmh, r.benhKhacRhm, r.benhKhacMat,
   r.benhKhacNgoaiKhoa, r.benhKhacPhuKhoa, r.benhKhacDaLieu]
    .filter(Boolean).forEach(b => diseases.push(b!));

  const diseasesText = diseases.length > 0 ? diseases.join('; ') : '..........';

  // Xử trí
  const xuTriArr: string[] = [];
  if (r.xuTriDt) xuTriArr.push('Điều trị ngoại trú');
  if (r.xuTriTd) xuTriArr.push('Theo dõi');
  if (r.xuTriCk) xuTriArr.push('Chuyển khoa chuyên môn');
  if (r.luuY) xuTriArr.push('Lưu ý đặc biệt');

  const kqText = [r.moTaKetLuan, xuTriArr.join(', '), r.huongGiaiQuyet]
    .filter(Boolean).join('. ') || '..........';

  // ── Tính BMI ────────────────────────────────────────────────────────────
  const bmi = r.chieuCao && r.canNang
    ? (r.canNang / ((r.chieuCao / 100) ** 2)).toFixed(1)
    : '..........';

  // ── Dữ liệu xét nghiệm máu ─────────────────────────────────────────────
  const ctmau = [
    r.wbc ? `WBC: ${r.wbc} K/μL` : '',
    r.rbc ? `RBC: ${r.rbc} M/μL` : '',
    r.hgb ? `HGB: ${r.hgb} g/dL` : '',
    r.plt ? `PLT: ${r.plt} K/μL` : '',
    r.vss ? `VSS: ${r.vss} mm/h` : '',
    r.hba1c ? `HbA1c: ${r.hba1c}%` : '',
  ].filter(Boolean).join('   ') || '..........';

  const sinhHoa = [
    r.glucoza ? `Glucoza: ${r.glucoza} mmol/L` : '',
    r.ure ? `Ure: ${r.ure} mmol/L` : '',
    r.creatinin ? `Creatinin: ${r.creatinin} μmol/L` : '',
    r.auric ? `A.Uric: ${r.auric} μmol/L` : '',
    r.cholesterol ? `Cholesterol: ${r.cholesterol} mmol/L` : '',
    r.triglycerid ? `Triglycerid: ${r.triglycerid} mmol/L` : '',
    r.hdl ? `HDL: ${r.hdl} mmol/L` : '',
    r.ldl ? `LDL: ${r.ldl} mmol/L` : '',
    r.got ? `GOT(ASAT): ${r.got} U/L` : '',
    r.gpt ? `GPT(ALAT): ${r.gpt} U/L` : '',
    r.ggt ? `GGT: ${r.ggt} U/L` : '',
    r.albumin ? `Albumin: ${r.albumin} g/L` : '',
    r.bilirubinTp ? `Bili TP: ${r.bilirubinTp} μmol/L` : '',
    r.bilirubinTt ? `Bili TT: ${r.bilirubinTt} μmol/L` : '',
    r.bilirubinGt ? `Bili GT: ${r.bilirubinGt} μmol/L` : '',
    r.ckmb ? `CKMB: ${r.ckmb} U/L` : '',
    r.canxi ? `Canxi: ${r.canxi} mmol/L` : '',
  ].filter(Boolean).join('   ') || '..........';

  const huyetThanh = [
    r.hbsag !== undefined ? `HBsAg: ${r.hbsag ? 'Dương tính (+)' : 'Âm tính (-)'}` : '',
    r.hav !== undefined ? `HAV: ${r.hav ? 'Dương tính (+)' : 'Âm tính (-)'}` : '',
    r.hcv !== undefined ? `HCV: ${r.hcv ? 'Dương tính (+)' : 'Âm tính (-)'}` : '',
    r.hev !== undefined ? `HEV: ${r.hev ? 'Dương tính (+)' : 'Âm tính (-)'}` : '',
    r.hpylori !== undefined ? `H.Pylori: ${r.hpylori ? 'Dương tính (+)' : 'Âm tính (-)'}` : '',
    r.nhomMau ? `Nhóm máu: ${r.nhomMau}` : '',
  ].filter(Boolean).join('   ') || '..........';

  const nuocTieu = [
    r.ntLeu ? `LEU: ${r.ntLeu}` : '',
    r.ntNit ? `NIT: ${r.ntNit}` : '',
    r.ntPro ? `PRO: ${r.ntPro}` : '',
    r.ntEry ? `ERY: ${r.ntEry}` : '',
    r.ntGlu ? `GLU: ${r.ntGlu}` : '',
    r.ntKet ? `KET: ${r.ntKet}` : '',
    r.ntBil ? `BIL: ${r.ntBil}` : '',
    r.ntUbg ? `UBG: ${r.ntUbg}` : '',
    r.ntPh ? `pH: ${r.ntPh}` : '',
    r.ntSg ? `SG: ${r.ntSg}` : '',
  ].filter(Boolean).join('   ') || '..........';

  // ── Dữ liệu hình ảnh ────────────────────────────────────────────────────
  const hinhAnh: [string, string | undefined][] = [
    ['X-quang tim phổi thẳng', r.xquangTimPhoi],
    ['Siêu âm ổ bụng', r.sieuAmOBung],
    ['Siêu âm tuyến giáp', r.saTuyenGiap],
    ['Siêu âm tim', r.saTim],
    ['Siêu âm Doppler mạch / SA khác', r.saDopplerMachKhac],
    ['Siêu âm vú', r.saVu],
    ['Điện tim (ECG)', r.dienTim],
    ['Chức năng hô hấp', r.chucNangHoHap],
    ['Loãng xương', r.loangXuong],
    ['Xơ vữa mạch', r.xoVuaMach],
    ['Lưu huyết não', r.luuHuyetNao],
    ['Nội soi TMH', r.noiSoiTmh],
    ['Nội soi dạ dày', r.noiSoiDaDay],
    ['Nội soi đại tràng', r.noiSoiDaiTrang],
    ['X-quang khác', r.xquangKhac],
    ['CT can thiệp', r.ctCanThiep],
    ['Sinh thiết', r.sinhThiet],
  ].filter(([, v]) => v) as [string, string][];

  const clsPhuKhoa: [string, string | undefined][] = [
    ['Soi CTC', r.soiCtc],
    ['Pap smear', r.papmer],
    ['VIA test (CTC + Acid Acetic)', r.viaTest],
    ['VILI test (CTC + Lugol)', r.viliTest],
    ['XN tế bào cổ tử cung', r.xnTeBaoCoTuCung],
    ['XN HPV', r.xnHpv],
  ].filter(([, v]) => v) as [string, string][];

  // ── Build document ─────────────────────────────────────────────────────
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Times New Roman', size: 22 } },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 },
        },
      },
      children: [

        // ── Tiêu đề ──────────────────────────────────────────────────────
        makePara('Mẫu số 03', { bold: true, center: true }),
        makePara('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { bold: true, center: true }),
        makePara('Độc lập - Tự do - Hạnh phúc', { bold: true, italic: true, center: true }),
        makePara('──────────────────', { center: true }),
        new Paragraph({ spacing: { before: 120, after: 0 } }),
        makePara('SỔ KHÁM SỨC KHỎE ĐỊNH KỲ', { bold: true, center: true, size: 26 }),
        makePara('(Ban hành kèm theo Thông tư số 32/2023/TT-BYT ngày 31/12/2023 của Bộ trưởng Bộ Y tế)', { italic: true, center: true, size: 18 }),
        new Paragraph({ spacing: { before: 120, after: 0 } }),

        // ── Phần hành chính ──────────────────────────────────────────────
        makePara('PHẦN HÀNH CHÍNH', { bold: true, center: true }),
        new Paragraph({ spacing: { before: 80, after: 0 } }),

        new Table({
          width: { size: TABLE_W, type: WidthType.DXA },
          columnWidths: [1800, TABLE_W - 1800],
          rows: [
            new TableRow({ children: [
              new TableCell({
                borders: BORDERS, rowSpan: 2,
                width: { size: 1800, type: WidthType.DXA },
                margins: { top: 60, bottom: 60, left: 120, right: 120 },
                children: [
                  makePara('ẢNH', { center: true, bold: true }),
                  makePara('4 x 6 cm', { center: true, italic: true, size: 18 }),
                ],
              }),
              new TableCell({
                borders: BORDERS,
                width: { size: TABLE_W - 1800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 150, right: 120 },
                children: [
                  makePara(`1. Mã nhân viên: NV #${fVal(r.employeeId)}`),
                  makePara(`2. Đơn vị / Phòng ban: ${fVal(r.donVi)}`),
                  makePara(`3. Ngày khám: ${fDate(r.ngayKham)}`),
                  makePara(`4. Nhóm máu: ${fVal(r.nhomMau)}`),
                ],
              }),
            ]}),
            new TableRow({ children: [
              new TableCell({
                borders: BORDERS,
                width: { size: TABLE_W - 1800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 150, right: 120 },
                children: [
                  makePara(`5. Tiền sử bệnh của gia đình: ${fVal(r.tienSuBenhGiaDinh)}`),
                  makePara(`6. Bệnh thông thường: ${fVal(r.benhThongThuong)}${r.maBenhThongThuong ? ' (Mã: ' + r.maBenhThongThuong + ')' : ''}    Số ngày nghỉ ốm: ${r.soNgayNghiOm ?? '......'} ngày`),
                  makePara(`7. Bệnh mãn tính: ${fVal(r.benhManTinh)}${r.maBenhManTinh ? ' (Mã: ' + r.maBenhManTinh + ')' : ''}`),
                ],
              }),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 120, after: 0 } }),

        // ── I. Tiền sử ───────────────────────────────────────────────────
        makePara('I. TIỀN SỬ BỆNH, TẬT', { bold: true }),
        makePara('(Bác sỹ khám sức khỏe hỏi và ghi chép)', { italic: true }),
        makePara('Tiền sử sản phụ khoa (Đối với nữ):', { bold: true, italic: true }),

        new Table({
          width: { size: TABLE_W, type: WidthType.DXA },
          columnWidths: [TABLE_W / 2, TABLE_W / 2],
          rows: [
            new TableRow({ children: [
              makeCell(`- Bắt đầu KN năm: ${r.tuoiBatDauKinhNguyet ?? '......'} tuổi`, { noBorder: true }),
              makeCell(`- Chu kỳ: ${r.chuKyKinh ?? '......'} ngày   Lượng: ${r.luongKinh ?? '......'} ngày`, { noBorder: true }),
            ]}),
            new TableRow({ children: [
              makeCell(`- Tính chất KN: ${r.tinhChatKinhNguyet ?? '..........'}`, { noBorder: true }),
              makeCell(`- Đau bụng kinh: ${fCheck(r.dauBungKinh)} Có  ${fCheck(!r.dauBungKinh)} Không`, { noBorder: true }),
            ]}),
            new TableRow({ children: [
              makeCell(`- Đã lập gia đình: ${fCheck(r.daLapGiaDinh)} Có  ${fCheck(!r.daLapGiaDinh)} Chưa`, { noBorder: true }),
              makeCell(`- PARA: ${fVal(r.para)}`, { noBorder: true }),
            ]}),
            new TableRow({ children: [
              makeCell(`- Số lần mổ sản phụ khoa: ${r.soLanMoSanPhuKhoa ?? '......'}${r.moTaMoSanPhuKhoa ? '  (' + r.moTaMoSanPhuKhoa + ')' : ''}`, { noBorder: true }),
              makeCell(`- Áp dụng BPTT: ${fCheck(r.apDungBptt)} Có  ${fCheck(!r.apDungBptt)} Không${r.moTaBptt ? '  (' + r.moTaBptt + ')' : ''}`, { noBorder: true }),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 120, after: 0 } }),

        // ── II. Khám thể lực ─────────────────────────────────────────────
        makePara('II. KHÁM THỂ LỰC', { bold: true }),
        makePara(`Chiều cao: ${r.chieuCao ? r.chieuCao + ' cm' : '..........'}   Cân nặng: ${r.canNang ? r.canNang + ' kg' : '..........'}   Chỉ số BMI: ${bmi}`),
        makePara(`Mạch: ${r.mach ? r.mach + ' lần/phút' : '..........'}   Huyết áp: ${fVal(r.huyetAp)} mmHg`),
        makePara(`Phân loại thể lực: ${fPl(r.plTheLuc)}   Phân loại nghề nghiệp: ${fPl(r.phanLoaiNgheNghiep)}`),
        new Paragraph({ spacing: { before: 120, after: 0 } }),

        // ── III. Khám lâm sàng ───────────────────────────────────────────
        makePara('III. KHÁM LÂM SÀNG', { bold: true }),
        new Paragraph({ spacing: { before: 60, after: 0 } }),

        new Table({
          width: { size: TABLE_W, type: WidthType.DXA },
          columnWidths: [3000, 4360, 2000],
          rows: [
            // Header
            new TableRow({ children: [
              makeCell('Nội dung khám', { bold: true, shade: 'D9D9D9', center: true }),
              makeCell('Kết quả', { bold: true, shade: 'D9D9D9', center: true }),
              makeCell('Phân loại', { bold: true, shade: 'D9D9D9', center: true }),
            ]}),

            // a) Nội khoa header
            new TableRow({ children: [
              makeCell('a) Nội khoa', { bold: true, shade: 'F0F0F0', span: 3 }),
            ]}),

            // Các mục nội khoa
            ...([
              ['- Tuần hoàn', r.khamTuanHoan, r.plKhamTuanHoan],
              ['- Hô hấp', r.khamHoHap, r.plKhamHoHap],
              ['- Tiêu hóa', r.khamTieuHoa, r.plKhamTieuHoa],
              ['- Thận - Tiết niệu', r.khamThanTietNieu, r.plKhamThanTietNieu],
              ['- Nội tiết', r.khamNoiTiet, r.plKhamNoiTiet],
              ['- Cơ - Xương - Khớp', r.khamCoXuongKhop, r.plKhamCxk],
              ['- Thần kinh', r.khamThanKinh, r.plKhamThanKinh],
              ['- Tâm thần', r.khamTamThan, r.plKhamTamThan],
            ] as [string, string | undefined, number | undefined][]).map(([label, ketqua, pl]) =>
              new TableRow({ children: [
                makeCell(label),
                makeCell(ketqua ?? ''),
                makeCell(pl ? `Loại ${pl}` : '', { center: true }),
              ]})
            ),

            // b) Ngoại khoa
            new TableRow({ children: [
              makeCell('b) Ngoại khoa', { bold: true, shade: 'F0F0F0' }),
              makeCell(r.khamNgoai ?? ''),
              makeCell(r.plKhamNgoai ? `Loại ${r.plKhamNgoai}` : '', { center: true }),
            ]}),

            // c) Da liễu
            new TableRow({ children: [
              makeCell('c) Da liễu', { bold: true, shade: 'F0F0F0' }),
              makeCell(r.khamDaLieu ?? ''),
              makeCell(r.plKhamDaLieu ? `Loại ${r.plKhamDaLieu}` : '', { center: true }),
            ]}),

            // d) Sản phụ khoa
            new TableRow({ children: [
              makeCell('d) Sản phụ khoa', { bold: true, shade: 'F0F0F0' }),
              makeCell(r.khamSanPhuKhoa ?? ''),
              makeCell(r.plKhamSanKhoa ? `Loại ${r.plKhamSanKhoa}` : '', { center: true }),
            ]}),

            // e) Mắt
            new TableRow({ children: [
              makeCell('e) Mắt', { bold: true, shade: 'F0F0F0' }),
              makeCell([
                r.khamMat ?? '',
                r.kqMatTraiKhongKinh ? `MT (không kính): ${r.kqMatTraiKhongKinh}` : '',
                r.kqMatPhaiKhongKinh ? `MP (không kính): ${r.kqMatPhaiKhongKinh}` : '',
                r.kqMatTraiCoKinh ? `MT (có kính): ${r.kqMatTraiCoKinh}` : '',
                r.kqMatPhaiCoKinh ? `MP (có kính): ${r.kqMatPhaiCoKinh}` : '',
              ].filter(Boolean).join('   ')),
              makeCell(r.plKhamMat ? `Loại ${r.plKhamMat}` : '', { center: true }),
            ]}),

            // f) Tai mũi họng
            new TableRow({ children: [
              makeCell('f) Tai - Mũi - Họng', { bold: true, shade: 'F0F0F0' }),
              makeCell([
                r.khamTaiMuiHong ?? '',
                r.noiThuongTaiTrai !== undefined
                  ? `Nói thường: TTrai ${r.noiThuongTaiTrai}m, TPhai ${r.noiThuongTaiPhai}m` : '',
                r.noiThamTaiTrai !== undefined
                  ? `Nói thầm: TTrai ${r.noiThamTaiTrai}m, TPhai ${r.noiThamTaiPhai}m` : '',
              ].filter(Boolean).join('   ')),
              makeCell(r.plKhamTmh ? `Loại ${r.plKhamTmh}` : '', { center: true }),
            ]}),

            // g) Răng hàm mặt
            new TableRow({ children: [
              makeCell('g) Răng - Hàm - Mặt', { bold: true, shade: 'F0F0F0' }),
              makeCell([
                r.khamRangHamMat ?? '',
                r.hamTren ? `Hàm trên: ${r.hamTren}` : '',
                r.hamDuoi ? `Hàm dưới: ${r.hamDuoi}` : '',
              ].filter(Boolean).join('   ')),
              makeCell(r.plKhamRhm ? `Loại ${r.plKhamRhm}` : '', { center: true }),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 120, after: 0 } }),

        // ── IV. Cận lâm sàng ─────────────────────────────────────────────
        makePara('IV. KHÁM CẬN LÂM SÀNG', { bold: true }),
        makePara('* Xét nghiệm huyết học/sinh hóa/X.quang và các xét nghiệm khác khi có chỉ định của bác sỹ:', { italic: true, size: 18 }),
        new Paragraph({ spacing: { before: 60, after: 0 } }),

        new Table({
          width: { size: TABLE_W, type: WidthType.DXA },
          columnWidths: [4000, 5360],
          rows: [
            new TableRow({ children: [
              makeCell('Nội dung khám', { bold: true, shade: 'D9D9D9', center: true }),
              makeCell('Kết quả', { bold: true, shade: 'D9D9D9', center: true }),
            ]}),

            // 1. Xét nghiệm máu
            new TableRow({ children: [
              makeCell('1. Xét nghiệm máu', { bold: true, shade: 'F0F0F0' }),
              makeCell('', { shade: 'F0F0F0' }),
            ]}),
            new TableRow({ children: [
              makeCell('a) Công thức máu'),
              makeCell(ctmau),
            ]}),
            new TableRow({ children: [
              makeCell('b) Sinh hóa máu'),
              makeCell(sinhHoa),
            ]}),
            new TableRow({ children: [
              makeCell('c) Huyết thanh học'),
              makeCell(huyetThanh),
            ]}),

            // 2. Nước tiểu
            new TableRow({ children: [
              makeCell('2. Xét nghiệm nước tiểu', { bold: true, shade: 'F0F0F0' }),
              makeCell(nuocTieu, { shade: 'F0F0F0' }),
            ]}),

            // 3. Chẩn đoán hình ảnh
            new TableRow({ children: [
              makeCell('3. Chẩn đoán hình ảnh', { bold: true, shade: 'F0F0F0' }),
              makeCell('', { shade: 'F0F0F0' }),
            ]}),
            ...(hinhAnh.length > 0
              ? hinhAnh.map(([label, val]) =>
                  new TableRow({ children: [makeCell(`- ${label}`), makeCell(val)] })
                )
              : [new TableRow({ children: [makeCell('(Không có)'), makeCell('')] })]
            ),

            // 4. CLS phụ khoa
            ...(clsPhuKhoa.length > 0 ? [
              new TableRow({ children: [
                makeCell('4. Cận lâm sàng phụ khoa', { bold: true, shade: 'F0F0F0' }),
                makeCell('', { shade: 'F0F0F0' }),
              ]}),
              ...clsPhuKhoa.map(([label, val]) =>
                new TableRow({ children: [makeCell(`- ${label}`), makeCell(val)] })
              ),
            ] : []),

            // Đánh giá
            new TableRow({ children: [
              makeCell('Đánh giá kết quả CLS', { bold: true }),
              makeCell([r.ketQuaCls, r.danhGiaCls].filter(Boolean).join(' - ') || '..........'),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 120, after: 0 } }),

        // ── V. Kết luận ──────────────────────────────────────────────────
        makePara('V. KẾT LUẬN', { bold: true }),
        new Paragraph({ spacing: { before: 80, after: 0 } }),

        new Table({
          width: { size: TABLE_W, type: WidthType.DXA },
          columnWidths: [TABLE_W],
          rows: [
            new TableRow({ children: [
              new TableCell({
                borders: BORDERS,
                width: { size: TABLE_W, type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 150, right: 120 },
                children: [makePara(`1. Phân loại sức khỏe: ${fPl(r.plSucKhoe)}`, { bold: true })],
              }),
            ]}),
            new TableRow({ children: [
              new TableCell({
                borders: BORDERS,
                width: { size: TABLE_W, type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 150, right: 120 },
                children: [
                  makePara('2. Các bệnh, tật (nếu có):', { bold: true }),
                  makePara(diseasesText),
                ],
              }),
            ]}),
            new TableRow({ children: [
              new TableCell({
                borders: BORDERS,
                width: { size: TABLE_W, type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 150, right: 120 },
                children: [
                  makePara('3. Phương án điều trị, xử trí:', { bold: true }),
                  makePara(kqText),
                ],
              }),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 200, after: 0 } }),

        // ── Chữ ký ───────────────────────────────────────────────────────
        new Table({
          width: { size: TABLE_W, type: WidthType.DXA },
          columnWidths: [TABLE_W / 2, TABLE_W / 2],
          rows: [
            new TableRow({ children: [
              new TableCell({
                borders: { top: NO_B, bottom: NO_B, left: NO_B, right: NO_B },
                width: { size: TABLE_W / 2, type: WidthType.DXA },
                margins: { top: 60, bottom: 60, left: 120, right: 120 },
                children: [
                  makePara('Người lao động xác nhận', { bold: true, center: true }),
                  makePara('(Ký và ghi rõ họ, tên)', { italic: true, center: true }),
                  makePara(' '), makePara(' '), makePara(' '),
                  makePara(`NV #${r.employeeId}`, { center: true }),
                ],
              }),
              new TableCell({
                borders: { top: NO_B, bottom: NO_B, left: NO_B, right: NO_B },
                width: { size: TABLE_W / 2, type: WidthType.DXA },
                margins: { top: 60, bottom: 60, left: 120, right: 120 },
                children: [
                  makePara(`......., ngày ${fDate(r.ngayKham)}`, { center: true }),
                  makePara('NGƯỜI KẾT LUẬN', { bold: true, center: true }),
                  makePara('(Ký, ghi rõ họ tên và đóng dấu)', { italic: true, center: true }),
                  makePara(' '), makePara(' '), makePara(' '),
                  makePara(r.nguoiKetLuan ?? '', { center: true }),
                ],
              }),
            ]}),
          ],
        }),

        new Paragraph({ spacing: { before: 200, after: 0 } }),
        makePara('────────────────────────────────────────', { center: true }),
        makePara('¹ Phân loại sức khỏe theo quy định của Bộ Y tế', { italic: true, size: 18 }),
        makePara('² Ghi rõ các bệnh, tật, phương án điều trị, phục hồi chức năng hoặc giới thiệu khám chuyên khoa để khám bệnh, chữa bệnh (nếu có).', { italic: true, size: 18 }),
      ],
    }],
  });

  // ── Xuất file ─────────────────────────────────────────────────────────────
  const buffer = await Packer.toBlob(doc);
  const fileName = `KhamSucKhoe_NV${r.employeeId}_${r.ngayKham ?? 'unknown'}.docx`;
  saveAs(buffer, fileName);
}
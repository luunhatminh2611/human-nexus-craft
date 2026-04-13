import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, VerticalAlign, UnderlineType,
} from 'docx';
import { saveAs } from 'file-saver';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface EmployeeData {
  // Tab 1
  fullName?: string;
  gender?: string;
  otherName?: string;
  partyCommitteeName?: string;
  subPartyCommitteeName?: string;
  positionName?: string;
  positionAllowance?: string;
  dateOfBirth?: string;         // yyyy-MM-dd hoặc dd/MM/yyyy
  birthPlace?: string;
  nativePlace?: string;         // Tỉnh/TP quê quán
  homeTown?: string;            // Xã/Phường quê quán
  contactAddress?: string;
  phone?: string;
  permanentAddress?: string;
  departmentName?: string;
  companyName?: string;

  // Tab 2
  ethnicity?: string;
  religionName?: string;
  policyFamilyName?: string;
  youthUnionJoinDate?: string;
  partyJoinDate?: string;
  partyOfficialDate?: string;
  militaryJoinDate?: string;
  militaryEndDate?: string;
  title?: string;
  militaryRankName?: string;
  injuryRank?: string | number;
  isWoundedSoldier?: boolean;
  healthStatus?: string;
  height?: string | number;
  weight?: string | number;
  bloodType?: string;
  cccdNumber?: string;

  // Tab 4
  previousJob?: string;
  recruitmentDate?: string;
  organizationName?: string;
  startDate?: string;
  educationDetail?: string;
  educationLevelName?: string;
  politicalTheoryName?: string;
  languageLevelName?: string;
  currentJobDetail?: string;
  workStrength?: string;
  longestJob?: string;

  // Tab 5
  salaryScaleName?: string;
  salaryCoefficient?: string | number;
  salaryAmount?: string | number;
  salaryEffectiveDate?: string;
  socialInsuranceNumber?: string;

  // Tab 3
  familyIncome?: string | number;
  otherIncome?: string;
  housingType?: string;
  housingArea?: string | number;
  selfHousingType?: string;
  usableArea?: string | number;
  grantedLandArea?: string | number;
  purchasedLandArea?: string | number;

  // Tab 6
  legalHistory?: string;
  workedInOldRegime?: string;
  foreignOrganizationRelation?: string;
  relativesAbroad?: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const v = (val: any): string => {
  if (val === null || val === undefined || val === '') return '...';
  return String(val);
};

const formatDate = (d: string | undefined): string => {
  if (!d) return '...';
  // yyyy-MM-dd → dd/MM/yyyy
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }
  return d;
};

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

const thinBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

const run = (text: string, opts: {
  bold?: boolean; size?: number; italic?: boolean; underline?: boolean;
} = {}) => new TextRun({
  text,
  bold: opts.bold,
  size: opts.size ?? 20,
  font: 'Times New Roman',
  italics: opts.italic,
  underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
});

const para = (children: TextRun | TextRun[], opts: {
  align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  before?: number; after?: number; indent?: number;
} = {}) => new Paragraph({
  alignment: opts.align ?? AlignmentType.LEFT,
  spacing: { before: opts.before ?? 40, after: opts.after ?? 40 },
  indent: opts.indent ? { left: opts.indent } : undefined,
  children: Array.isArray(children) ? children : [children],
});

const cell = (
  content: string | TextRun[],
  opts: {
    width?: number; border?: boolean; bold?: boolean; size?: number;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    span?: number; rowSpan?: number;
  } = {}
) => new TableCell({
  borders: opts.border ? thinBorder : noBorder,
  width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
  verticalAlign: VerticalAlign.CENTER,
  columnSpan: opts.span,
  rowSpan: opts.rowSpan,
  margins: { top: 60, bottom: 60, left: 80, right: 80 },
  children: [new Paragraph({
    alignment: opts.align ?? AlignmentType.LEFT,
    children: typeof content === 'string'
      ? [run(content, { bold: opts.bold, size: opts.size })]
      : content,
  })],
});

const sectionTitle = (text: string) =>
  para([run(text, { bold: true })], { before: 100, after: 40 });

const emptyRows = (count: number, widths: number[]) =>
  Array.from({ length: count }, () => new TableRow({
    children: widths.map(w => cell('', { border: true, width: w })),
  }));

// ─── TABLES ───────────────────────────────────────────────────────────────────
const trainingTable = () => new Table({
  width: { size: 9200, type: WidthType.DXA },
  columnWidths: [2000, 2200, 1600, 1400, 2000],
  rows: [
    new TableRow({
      children: [
        cell('Tên trường', { border: true, width: 2000, bold: true, align: AlignmentType.CENTER }),
        cell('Ngành học hoặc tên lớp học', { border: true, width: 2200, bold: true, align: AlignmentType.CENTER }),
        cell('Thời gian học', { border: true, width: 1600, bold: true, align: AlignmentType.CENTER }),
        cell('Hình thức học', { border: true, width: 1400, bold: true, align: AlignmentType.CENTER }),
        cell('Văn bằng, chứng chỉ, trình độ gì', { border: true, width: 2000, bold: true, align: AlignmentType.CENTER }),
      ],
    }),
    ...emptyRows(6, [2000, 2200, 1600, 1400, 2000]),
  ],
});

const workHistoryTable = () => new Table({
  width: { size: 9200, type: WidthType.DXA },
  columnWidths: [2400, 6800],
  rows: [
    new TableRow({
      children: [
        cell('Từ tháng, năm đến tháng, năm', { border: true, width: 2400, bold: true, align: AlignmentType.CENTER }),
        cell('Chức danh, chức vụ, đơn vị công tác (Đảng, Chính quyền, Đoàn thể)', { border: true, width: 6800, bold: true, align: AlignmentType.CENTER }),
      ],
    }),
    ...emptyRows(8, [2400, 6800]),
  ],
});

const salaryTable = (e: EmployeeData) => new Table({
  width: { size: 9200, type: WidthType.DXA },
  columnWidths: [1840, 1840, 1840, 1840, 1840],
  rows: [
    new TableRow({
      children: [
        cell('Tháng/năm:', { border: true, width: 1840, bold: true }),
        cell(formatDate(e.salaryEffectiveDate), { border: true, width: 1840 }),
        cell('', { border: true, width: 1840 }),
        cell('', { border: true, width: 1840 }),
        cell('', { border: true, width: 1840 }),
      ]
    }),
    new TableRow({
      children: [
        cell('Ngạch/bậc:', { border: true, width: 1840, bold: true }),
        cell(v(e.salaryScaleName), { border: true, width: 1840 }),
        cell('', { border: true, width: 1840 }),
        cell('', { border: true, width: 1840 }),
        cell('', { border: true, width: 1840 }),
      ]
    }),
    new TableRow({
      children: [
        cell('Hệ số lương (Mức lương):', { border: true, width: 1840, bold: true }),
        cell(v(e.salaryCoefficient), { border: true, width: 1840 }),
        cell('', { border: true, width: 1840 }),
        cell('', { border: true, width: 1840 }),
        cell('', { border: true, width: 1840 }),
      ]
    }),
  ],
});

const familyTable = () => new Table({
  width: { size: 9200, type: WidthType.DXA },
  columnWidths: [1000, 2200, 800, 5200],
  rows: [
    new TableRow({
      children: [
        cell('Quan hệ', { border: true, width: 1000, bold: true, align: AlignmentType.CENTER }),
        cell('Họ và tên', { border: true, width: 2200, bold: true, align: AlignmentType.CENTER }),
        cell('Năm sinh', { border: true, width: 800, bold: true, align: AlignmentType.CENTER }),
        cell('Quê quán, nghề nghiệp, chức danh, chức vụ, đơn vị công tác, học tập, nơi ở (trong, ngoài nước); thành viên các tổ chức chính trị-xã hội...', { border: true, width: 5200, bold: true, align: AlignmentType.CENTER }),
      ],
    }),
    ...emptyRows(7, [1000, 2200, 800, 5200]),
  ],
});

// ─── MAIN EXPORT FUNCTION ─────────────────────────────────────────────────────
export const generateLyLich = async (employee: EmployeeData): Promise<void> => {
  const e = employee;
  const company = v(e.companyName).toUpperCase();

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Times New Roman', size: 20 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 720, right: 720, bottom: 720, left: 1080 },
        },
      },
      children: [
        // ── HEADER ────────────────────────────────────────────────────────────
        new Table({
          width: { size: 10460, type: WidthType.DXA },
          columnWidths: [5230, 5230],
          rows: [new TableRow({
            children: [
              cell([run(`ĐẢNG BỘ ${company}`, { bold: true, size: 18 })], { width: 5230, align: AlignmentType.LEFT }),
              cell([run('Mẫu 2C/TCTW-98', { size: 18 })], { width: 5230, align: AlignmentType.RIGHT }),
            ]
          })],
        }),

        para([run(`ĐẢNG ỦY ${company}`, { bold: true, size: 18 })], { align: AlignmentType.CENTER, before: 0, after: 0 }),
        para([run('SƠ YẾU LÝ LỊCH', { bold: true, size: 26 })], { align: AlignmentType.CENTER, before: 60, after: 60 }),
        para([run('CHI BỘ: ', { bold: true }), run(v(e.departmentName), { bold: true })], { before: 0, after: 40 }),
        para([run('Số hiệu cán bộ, công chức: ...............................')], { before: 0, after: 80 }),

        // ── CÁC MỤC 1–26 ──────────────────────────────────────────────────────
        para([run('1) Họ và tên khai sinh: '), run(v(e.fullName), { bold: true }), run('    Nam, nữ: '), run(e.gender === 'NAM' ? 'Nam' : 'Nữ', { bold: true })]),
        para([run('2) Các tên gọi khác: '), run(v(e.otherName), { bold: true })]),
        para([run('3) Cấp ủy hiện tại: '), run(v(e.partyCommitteeName)), run(', Cấp ủy kiêm: '), run(v(e.subPartyCommitteeName))]),
        para([run('Chức vụ (Đảng, đoàn thể, Chính quyền, kể cả chức vụ kiêm nhiệm): '), run(v(e.positionName)), run('   Phụ cấp chức vụ: '), run(v(e.positionAllowance))]),
        para([run('4) Sinh ngày: '), run(formatDate(e.dateOfBirth), { bold: true }), run('   5) Nơi sinh: '), run(v(e.birthPlace), { bold: true })]),
        para([run('6) Quê quán (xã, phường): '), run(v(e.homeTown), { bold: true }), run('  (tỉnh, TP): '), run(v(e.nativePlace), { bold: true })]),
        para([run('7) Nơi ở hiện nay: '), run(v(e.contactAddress)), run('  Điện thoại: '), run(v(e.phone))]),
        para([run('Nơi đăng ký hộ khẩu thường trú: '), run(v(e.permanentAddress))]),
        para([run('8) Dân tộc: '), run(v(e.ethnicity), { bold: true }), run('   9) Tôn giáo: '), run(v(e.religionName), { bold: true })]),
        para([run('10) Thành phần gia đình xuất thân: '), run(v(e.policyFamilyName), { bold: true })]),
        para([run('(Ghi là công nhân, nông dân, cán bộ, công chức, trí thức, quân nhân, dân nghèo thành thị, tiểu thương...)', { size: 18, italic: true })]),
        para([run('11) Nghề nghiệp bản thân trước khi được tuyển dụng: '), run(v(e.previousJob))]),
        para([run('12) Ngày được tuyển dụng: '), run(formatDate(e.recruitmentDate)), run('   Vào cơ quan nào, ở đâu: '), run(v(e.organizationName))]),
        para([run('13) Ngày vào cơ quan hiện đang công tác: '), run(formatDate(e.startDate)), run(', Ngày tham gia cách mạng: '), run(formatDate(e.youthUnionJoinDate))]),
        para([run('14) Ngày vào Đảng Cộng sản Việt Nam: '), run(formatDate(e.partyJoinDate)), run('   Ngày chính thức: '), run(formatDate(e.partyOfficialDate))]),
        para([run('15) Ngày tham gia các tổ chức chính trị, xã hội: Ngày vào Đoàn TNCSHCM: '), run(formatDate(e.youthUnionJoinDate))]),
        para([run('16) Ngày nhập ngũ: '), run(formatDate(e.militaryJoinDate)), run('   Ngày xuất ngũ: '), run(formatDate(e.militaryEndDate)), run('   Quân hàm, chức vụ cao nhất: '), run(v(e.title))]),
        para([run('17) Trình độ học vấn: Giáo dục phổ thông: '), run(v(e.educationDetail)), run('   Học hàm, học vị cao nhất: '), run(v(e.educationLevelName))]),
        para([run('   - Lý luận chính trị: '), run(v(e.politicalTheoryName)), run('   - Ngoại ngữ: '), run(v(e.languageLevelName))]),
        para([run('18) Công tác chính đang làm: '), run(v(e.currentJobDetail))]),
        para([run('19) Ngạch công chức: '), run(v(e.salaryScaleName)), run('   Bậc lương: '), run(v(e.salaryCoefficient)), run(', hệ số: '), run(v(e.salaryCoefficient)), run('   từ tháng '), run(formatDate(e.salaryEffectiveDate))]),
        para([run('20) Danh hiệu được phong (năm nào): '), run(v(e.militaryRankName))]),
        para([run('(Anh hùng lao động, anh hùng lực lượng vũ trang, nhà giáo, thầy thuốc, nghệ sĩ nhân dân, ưu tú)', { size: 18, italic: true })]),
        para([run('21) Sở trường công tác: '), run(v(e.workStrength)), run('   Công việc đã làm lâu nhất: '), run(v(e.longestJob))]),
        para([run('22) Khen thưởng: .................................................................................................')]),
        para([run('(Huân, huy chương, năm nào)', { size: 18, italic: true })]),
        para([run('23) Kỷ luật (Đảng, Chính quyền, Đoàn thể, Cấp quyết định, năm nào, lý do, hình thức, ...): Không.')]),
        para([run('24) Tình trạng sức khỏe: '), run(v(e.healthStatus)), run('; Cao: '), run(v(e.height)), run(' cm, Cân nặng: '), run(v(e.weight)), run(' kg, Nhóm máu: '), run(v(e.bloodType))]),
        para([run('25) Số CCCD: '), run(v(e.cccdNumber)), run('   Thương binh loại: '), run(v(e.injuryRank)), run('   Gia đình liệt sĩ: '), run(e.isWoundedSoldier ? 'Có' : 'Không')]),
        para([run('26) Số sổ BHXH: '), run(v(e.socialInsuranceNumber))]),

        // ── MỤC 27 ────────────────────────────────────────────────────────────
        sectionTitle('27) ĐÀO TẠO, BỒI DƯỠNG VỀ CHUYÊN MÔN, NGHIỆP VỤ, LÝ LUẬN CHÍNH TRỊ, NGOẠI NGỮ'),
        trainingTable(),
        para([run('Ghi chú: Hình thức học: Chính quy, tại chức, chuyên tu, bồi dưỡng... / Văn bằng: Tiến sĩ, Thạc sĩ, Cử nhân, Kỹ sư...', { size: 18, italic: true, underline: true })], { before: 40 }),

        // ── MỤC 28 ────────────────────────────────────────────────────────────
        sectionTitle('28) TÓM TẮT QUÁ TRÌNH CÔNG TÁC'),
        workHistoryTable(),

        // ── MỤC 29 ────────────────────────────────────────────────────────────
        sectionTitle('29) ĐẶC ĐIỂM LỊCH SỬ BẢN THÂN'),
        para([run('a) Khai rõ: bị bắt, bị tù (từ ngày tháng năm nào đến ngày tháng năm nào, ở đâu), đã khai báo cho ai, những vấn đề gì: '), run(v(e.legalHistory))]),
        para([run('b) Bản thân có làm việc trong chế độ cũ (Cơ quan, đơn vị nào, địa điểm, chức danh, chức vụ, thời gian làm việc...) : '), run(v(e.workedInOldRegime))]),

        // ── MỤC 30 ────────────────────────────────────────────────────────────
        sectionTitle('30) QUAN HỆ VỚI NƯỚC NGOÀI'),
        para([run('- Tham gia hoặc có quan hệ với các tổ chức chính trị, kinh tế, xã hội nào ở nước ngoài (làm gì, tổ chức nào, đặt trụ sở ở đâu...?): '), run(v(e.foreignOrganizationRelation))]),
        para([run('- Có thân nhân (Bố, mẹ, vợ, chồng, con, anh chị em ruột) ở nước ngoài (làm gì, địa chỉ...)? '), run(v(e.relativesAbroad))]),

        // ── MỤC 31 ────────────────────────────────────────────────────────────
        sectionTitle('31) QUAN HỆ GIA ĐÌNH'),
        para([run('a) Về bản thân: Bố, Mẹ, Vợ (chồng), các con, anh chị em ruột', { bold: true })]),
        familyTable(),
        para([run('b) Bố, Mẹ, anh chị em ruột (bên vợ hoặc chồng):', { bold: true })], { before: 80 }),
        familyTable(),

        // ── MỤC 32 ────────────────────────────────────────────────────────────
        sectionTitle('32) HOÀN CẢNH KINH TẾ GIA ĐÌNH'),
        para([run('- Quá trình lương của bản thân:', { underline: true })]),
        salaryTable(e),
        para([run('- Nguồn thu nhập chính của gia đình (hàng năm): + lương: '), run(v(e.familyIncome)), run(' đồng/năm')], { before: 60 }),
        para([run('+ Các nguồn khác: '), run(v(e.otherIncome))]),
        para([run('- Nhà ở: ', { underline: true }), run('+ Được cấp, được thuê, loại nhà: '), run(v(e.housingType)), run(', tổng diện tích sử dụng: '), run(v(e.housingArea)), run(' m²')]),
        para([run('+ Nhà tự mua, tự xây, loại nhà: '), run(v(e.selfHousingType)), run(', tổng diện tích sử dụng: '), run(v(e.usableArea)), run(' m²')]),
        para([run('- Đất ở: ', { underline: true }), run('+ Đất được cấp: '), run(v(e.grantedLandArea)), run(' m²,  + Đất tự mua: '), run(v(e.purchasedLandArea)), run(' m²')]),
        para([run('- Đất sản xuất, kinh doanh: Không')]),

        // ── CHỮ KÝ ────────────────────────────────────────────────────────────
        para([], { before: 120 }),
        new Table({
          width: { size: 10460, type: WidthType.DXA },
          columnWidths: [5230, 5230],
          rows: [
            new TableRow({
              children: [
                cell([run('Người khai', { italic: true }), run('   Ngày ..... tháng ..... năm .........', { italic: true })], { width: 5230 }),
                cell([run('Xác nhận của cơ quan quản lý', { italic: true })], { width: 5230, align: AlignmentType.CENTER }),
              ]
            }),
            new TableRow({
              children: [
                cell([run('Tôi xin cam đoan những lời khai trên đây là đúng sự thật', { italic: true })], { width: 5230 }),
                cell([run('(hoặc của Công an xã, phường, thị trấn nơi cư ngụ)', { italic: true })], { width: 5230, align: AlignmentType.CENTER }),
              ]
            }),
            new TableRow({ children: [cell('', { width: 5230 }), cell('', { width: 5230 })] }),
            new TableRow({
              children: [
                cell([run('(Ký tên)', { italic: true })], { width: 5230, align: AlignmentType.CENTER }),
                cell('', { width: 5230 }),
              ]
            }),
            new TableRow({
              children: [
                cell([run(v(e.fullName), { bold: true })], { width: 5230, align: AlignmentType.CENTER }),
                cell('', { width: 5230 }),
              ]
            }),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `LyLich_${v(e.fullName).replace(/\s+/g, '_')}.docx`);
};
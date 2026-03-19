export interface MedicalFieldDef {
  key: string;
  type: 'text' | 'number' | 'checkbox' | 'date';
}

export interface MedicalFieldGroup {
  name: string;
  color: string;
  icon: string;
  fields: MedicalFieldDef[];
}

const t = (key: string): MedicalFieldDef => ({ key, type: 'text' });
const n = (key: string): MedicalFieldDef => ({ key, type: 'number' });
const c = (key: string): MedicalFieldDef => ({ key, type: 'checkbox' });
const d = (key: string): MedicalFieldDef => ({ key, type: 'date' });

export const medicalFieldGroups: MedicalFieldGroup[] = [
  {
    name: "Thông tin chung",
    color: "bg-blue-50 border-blue-200",
    icon: "📋",
    fields: [
      t("Mã BHXH"), t("Họ và tên"), n("Năm sinh"), t("Chức danh"),
      t("Công trường/ Phân xưởng/ Phòng ban"), t("Đơn vị"), d("Ngày khám"),
      n("Chiều cao"), n("Cân nặng"), n("Mạch"), t("Huyết áp"),
      t("PL Thể lực"), t("PL Sức khỏe"),
      t("Bệnh thông thường"), t("Mã bệnh thông thường"), n("Số ngày nghỉ ốm"),
      t("Bệnh mãn tính"), t("Mã bệnh mãn tính"),
      t("Phân loại nghề nghiệp"), t("NLĐ tiếp xúc trực tiếp với các yếu tố có hại"),
      t("Tiền sử bệnh. tật của gia đình"),
    ],
  },
  {
    name: "Bệnh nghề nghiệp & Tai nạn LĐ",
    color: "bg-orange-50 border-orange-200",
    icon: "⚠️",
    fields: [
      c("Bị tai nạn lao động"), d("Ngày bị tai nạn lao động"),
      n("Số ngày điều trị tai nạn lao động"), n("Tỷ lệ giám định TNLĐ (%)"),
      t("Năm hưởng trợ cấp TNLĐ (BHXH chi trả)"),
      c("NLĐ được KSK phát hiện BNN"), c("NLĐ được chẩn đoán BNN"),
      t("Chức danh nghề khi mắc BNN"),
      t("Tên bệnh nghề nghiệp"), t("Mã bệnh nghề nghiệp"),
      t("Thời gian hội chẩn BNN"), t("Thể bệnh"),
      t("Năm giám định BNN"), n("Tỷ lệ giám định BNN (%)"),
      t("Năm hưởng trợ cấp BNN (BHXH chi trả)"),
      c("Đã rửa phổi"), t("Năm rửa phổi"), c("NLĐ chống chỉ định rửa phổi"),
    ],
  },
  {
    name: "Khám lâm sàng",
    color: "bg-green-50 border-green-200",
    icon: "🩺",
    fields: [
      t("Khám tuần hoàn"), t("Phân loại khám tuần hoàn"),
      t("Khám hô hấp"), t("Phân loại khám hô hấp"),
      t("Khám tiêu hóa"), t("Phân loại khám tiêu hóa"),
      t("Khám thận - tiết niệu"), t("Phân loại khám thận - tiết niệu"),
      t("Khám nội tiết"), t("Phân loại khám nội tiết"),
      t("Khám cơ - xương - khớp"), t("Phân loại CXK"),
      t("Khám thần kinh"), t("Phân loại thần kinh"),
      t("Khám tâm thần"), t("Phân loại tâm thần"),
      t("Khám ngoại"), t("Phân loại khám ngoại"),
      t("Khám da liễu"), t("Phân loại da liễu"),
      t("Khám sản phụ khoa"), t("Phân loại sản khoa"),
      n("Tuổi bắt đầu thấy kinh nguyệt"), t("Tính chất kinh nguyệt"),
      n("Chu kỳ kinh (ngày)"), n("Lượng kinh (ngày)"),
      c("Đau bụng kinh"), c("Đã lập gia đình"), t("PARA"),
      n("Số lần mổ sản. phụ khoa"), t("Mô tả rõ mổ sản. hụ khoa"),
      c("Áp dụng BPTT"), t("Mô tả rõ BPTT"),
      t("Khám mắt"), t("Phân loại mắt"),
      t("KQ đo mắt trái (không kính)"), t("KQ đo mắt phải (không kính)"),
      t("KQ đo mắt trái (có kính)"), t("KQ đo mắt phải (có kính)"),
      t("Tai - Mũi - Họng"), t("Phân loại TMH"),
      t("Nói thường (Tai trái)"), t("Nói thường (Tai phải)"),
      t("Nói thầm (Tai trái)"), t("Nói thầm (Tai phải)"),
      t("Răng - Hàm - Mặt"), t("Phân loại RHM"),
      t("Hàm trên"), t("Hàm dưới"),
    ],
  },
  {
    name: "Xét nghiệm",
    color: "bg-purple-50 border-purple-200",
    icon: "🔬",
    fields: [
      // Máu
      t("WBC"), t("RBC"), t("HGB"), t("PLT"), t("VSS"),
      t("Ure"), t("Glucoza"), t("Creatinin"), t("A.Uric"),
      t("Choles"), t("Try"), t("HDL"), t("LDL"),
      t("GOT"), t("GPT"), t("GGT"), t("Alumin"),
      t("Bil TP"), t("Bil TT"), t("Bil GT"), t("CKMB"), t("Cail"),
      // Nước tiểu
      t("LEU"), t("NIT"), t("Pro"), t("pH"), t("Ery"),
      t("SG"), t("KET"), t("BIL"), t("GLU"), t("UBG"),
      // Khác
      t("HbA1C"), t("HBsAg"), t("HAV"), t("HCV"), t("HEV"),
      t("Nhóm máu"), t("Hpylori"),
    ],
  },
  {
    name: "Chẩn đoán hình ảnh",
    color: "bg-indigo-50 border-indigo-200",
    icon: "📷",
    fields: [
      t("Siêu âm ổ bụng"), t("SÂ tuyến giáp"), t("SÂ tim"),
      t("Siêu âm Doppler mạch/Siêu âm khác"), t("SÂ vú"),
      t("Điện tim"), t("Nội soi TMH"), t("Dạ dày"), t("Đại tràng"),
      t("Chức năng hô hấp"), t("Loãng xương"),
      t("Xơ vữa mạch"), t("Lưu huyết não"),
      t("Xquang tim phổi"), t("Xquang khác"),
      t("CT can thiệp"), t("Sinh thiết"),
      // Phụ khoa
      t("Soi CTC"), t("Papmer"),
      t("Nghiệm pháp quan sát CTC với dung dịch Acid Acetic (VIA test)"),
      t("Nghiệm pháp quan sát CTC với dung dịch Lugol (VILI test)"),
      t("Xét nghiệm tế bào cổ tử cung"), t("Xét nghiệm HPV"),
    ],
  },
  {
    name: "Kết luận & Bệnh",
    color: "bg-red-50 border-red-200",
    icon: "📝",
    fields: [
      t("Kết quả CLS"), t("Đánh giá CLS"), t("Mô tả Kết luận"),
      t("Hướng giải quyết"), t("Người kết luận"),
      t("ĐT"), t("TD"), t("CK"), t("Lưu ý"),
      // Bệnh
      c("Lao phổi"), c("Ung thư phổi"), c("Viêm xoang cấp"), c("Viêm xoang mãn"),
      c("Viêm phế quản cấp"), c("Viêm phế quản mãn"),
      c("Viêm phổi"), c("Hen phế quản"), c("Viêm dạ dày"), c("Viêm đại tràng"),
      c("Tiểu đường"), c("Tăng huyết áp"),
      c("Rối loạn mỡ máu"), c("Tăng men gan"), c("Viêm gan"), c("Bệnh thận"),
      c("Sỏi tiết niệu"), c("Nang thận"),
      c("Nang tuyến giáp"), c("Gan nhiễm mỡ"), c("Sỏi túi mật"),
      c("Ung thư"), c("Bệnh khác"),
    ],
  },
];

export const allMedicalFieldKeys = medicalFieldGroups.flatMap(g => g.fields.map(f => f.key));

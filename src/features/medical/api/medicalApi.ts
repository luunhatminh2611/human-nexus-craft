import { api } from "../../../lib/axios";

// Các field kiểu YEAR trong MySQL - chỉ chấp nhận 1901-2155 hoặc NULL
const YEAR_FIELDS = new Set([
  'namGiamDinhBnn',
  'namHuongTroCapBnn', 
  'namHuongTroCapTnld',
  'namRuaPhoi',
]);

// Các field kiểu số thông thường - loại bỏ nếu = 0 và không có nghĩa
const NULLABLE_NUMBER_FIELDS = new Set([
  ...YEAR_FIELDS,
  'mach', 'plTheLuc', 'plSucKhoe', 'phanLoaiNgheNghiep',
  'soNgayNghiOm', 'soNgayDieuTriTnld', 'tyLeGiamDinhTnld',
  'tyLeGiamDinhBnn', 'tuoiBatDauKinhNguyet', 'chuKyKinh',
  'luongKinh', 'soLanMoSanPhuKhoa', 'noiThuongTaiTrai',
  'noiThuongTaiPhai', 'noiThamTaiTrai', 'noiThamTaiPhai',
  'plKhamTuanHoan', 'plKhamHoHap', 'plKhamTieuHoa',
  'plKhamThanTietNieu', 'plKhamNoiTiet', 'plKhamCxk',
  'plKhamThanKinh', 'plKhamTamThan', 'plKhamNgoai',
  'plKhamDaLieu', 'plKhamSanKhoa', 'plKhamMat',
  'plKhamTmh', 'plKhamRhm',
  'wbc', 'rbc', 'hgb', 'plt', 'vss', 'hba1c',
  'ure', 'glucoza', 'creatinin', 'auric', 'cholesterol',
  'triglycerid', 'hdl', 'ldl', 'got', 'gpt', 'ggt',
  'albumin', 'bilirubinTp', 'bilirubinTt', 'bilirubinGt',
  'ckmb', 'canxi', 'ntPh', 'ntSg',
  'chieuCao', 'canNang',
]);

const sanitizePayload = (data: object): object => {
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      // Loại bỏ undefined và null
      if (value === undefined || value === null) return false;
      // Loại bỏ string rỗng
      if (value === '') return false;
      // Loại bỏ các field số có giá trị 0 không có nghĩa
      if (NULLABLE_NUMBER_FIELDS.has(key) && value === 0) return false;
      return true;
    })
  );
};

export const routineHealthCheckApi = {
  getAll: async () => {
    try {
      const response = await api.get("/routine-health-check/all");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hồ sơ khám sức khỏe định kỳ:", error);
      throw error;
    }
  },

  getPagination: async (page: number, size: number) => {
    try {
      const response = await api.get("/routine-health-check/pagination", {
        params: { page, size },
      });
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hồ sơ khám sức khỏe định kỳ (phân trang):", error);
      throw error;
    }
  },

  getByEmployeeId: async (employeeId: number) => {
    try {
      const response = await api.get(`/routine-health-check/employee/${employeeId}`);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy hồ sơ khám sức khỏe theo nhân viên:", error);
      throw error;
    }
  },

  create: async (data: object) => {
    try {
      const response = await api.post(
        "/routine-health-check/create",
        sanitizePayload(data)
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo hồ sơ khám sức khỏe định kỳ:", error);
      throw error;
    }
  },

  update: async (data: object) => {
    try {
      const response = await api.put(
        "/routine-health-check/update",
        sanitizePayload(data)
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ khám sức khỏe định kỳ:", error);
      throw error;
    }
  },

  delete: async (id: number) => {
    const response = await api.delete(`/routine-health-check/delete?id=${id}`);
    return response.data;
  },
};
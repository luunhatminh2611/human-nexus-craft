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

  create: async (data: object[]) => {
    try {
      const response = await api.post(
        "/routine-health-check/batch/create",
        data
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

  updateBulk: async (data: object[]) => {
    try {
      const response = await api.put(
        "/routine-health-check/batch/update",
        data
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

  downloadReport: async (employeeId: number) => {
    try {
      const response = await api.get(
        `/v1/health-check/report/download?employeeId=${employeeId}`,
        { responseType: 'blob' }
      );

      const blob: Blob = response.data;

      console.log('[downloadReport] blob.type:', blob?.type);
      console.log('[downloadReport] blob.size:', blob?.size);
      console.log('[downloadReport] instanceof Blob:', blob instanceof Blob);

      if (!(blob instanceof Blob)) {
        throw new Error(`response.data không phải Blob, nhận được: ${typeof blob}`);
      }

      if (blob.type.includes('application/json') || blob.type.includes('text/plain')) {
        const text = await blob.text();
        console.log('[downloadReport] Server trả lỗi JSON:', text);
        const json = JSON.parse(text);
        throw new Error(json.message || 'Lỗi từ server');
      }

      // ✅ Phần này đang bị thiếu trong code của bạn
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KhamSucKhoe_${employeeId}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Lỗi khi tải báo cáo khám sức khỏe:', error);
      throw error;
    }
  },
};
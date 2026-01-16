// services/api/categoriesApi.js
import { api } from "../../../lib/axios";

// ============ ROLE APIs ============
export const roleApi = {
  getAll: async () => {
    try {
      const response = await api.get("/role");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vai trò:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/role/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy vai trò:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/role", {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo vai trò:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/role/${id}`, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật vai trò:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/role/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa vai trò:", error);
      throw error;
    }
  },
};

// ============ JOB TITLE APIs ============
export const jobTitleApi = {
  getAll: async () => {
    try {
      const response = await api.get("/position");
      const positions = response.data.data.filter(item => item.type === "Chức danh");
      return positions;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chức danh:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/position/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy chức danh:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/position", {
        name: data.name,
        code: data.code || null,
        type: "Chức danh",
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo chức danh:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put("/position", {
        id: id,
        name: data.name,
        code: data.code || null,
        type: "Chức danh",
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật chức danh:", error);
      throw error;
    }
  },

  updateBulk: async (payload) => {
    try {
      const formattedPayload = {
        payload: payload.map(item => ({
          id: item.id,
          name: item.name,
          code: item.code || null,
          type: "Chức danh",
          description: item.description || null,
          updatedAt: new Date().toISOString(),
          deleted: false,
        }))
      };

      const response = await api.put("/position/update_list", formattedPayload);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật hàng loạt chức danh:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/position/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa chức danh:", error);
      throw error;
    }
  },
};

// ============ MAJOR APIs ============
export const majorApi = {
  getAll: async () => {
    try {
      const response = await api.get("/position");
      const majors = response.data.data.filter(item => item.type === "Ngành nghề");
      return majors;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ngành nghề:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/position/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy ngành nghề:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/position", {
        name: data.name,
        code: data.code || null,
        type: "Ngành nghề",
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo ngành nghề:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put("/position", {
        id: id,
        name: data.name,
        code: data.code || null,
        type: "Ngành nghề",
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật ngành nghề:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/position/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa ngành nghề:", error);
      throw error;
    }
  },
};

// ============ DEGREE APIs ============
export const degreeApi = {
  getAll: async () => {
    try {
      const response = await api.get("/education_level");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bậc học:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/education_level/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy bậc học:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/education_level", {
        name: data.name,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo bậc học:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      // PUT /api/education_level với id trong body
      const response = await api.put("/education_level", {
        id: id,
        name: data.name,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật bậc học:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/education_level/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa bậc học:", error);
      throw error;
    }
  },
};

export const ethnicityApi = {
  getAll: async () => {
    try {
      const response = await api.get("/ethnicity");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dân tộc:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/ethnicity/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy dân tộc:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/ethnicity", {
        name: data.name,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo dân tộc:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put("/ethnicity", {
        id: id,
        name: data.name,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật dân tộc:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/ethnicity/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa dân tộc:", error);
      throw error;
    }
  },
};

// ============ WARD APIs ============
export const wardApi = {
  getAll: async () => {
    try {
      const response = await api.get("/ward");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phường/xã:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/ward/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy phường/xã:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/ward", {
        name: data.name,
        code: data.code || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo phường/xã:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put("/ward", {
        id: id,
        name: data.name,
        code: data.code || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật phường/xã:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/ward/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa phường/xã:", error);
      throw error;
    }
  },
};

export const provinceCityApi = {
  getAll: async () => {
    try {
      const response = await api.get("/province_city");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/province_city/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy tỉnh/thành phố:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/province_city", {
        name: data.name,
        code: data.code || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo tỉnh/thành phố:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put("/province_city", {
        id: id,
        name: data.name,
        code: data.code || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật tỉnh/thành phố:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/province_city/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa tỉnh/thành phố:", error);
      throw error;
    }
  },
};

export const specialtyApi = {
  getAll: async () => {
    try {
      const response = await api.get("/specialty");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nghề nghiệp:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/specialty/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy nghề nghiệp:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/specialty", {
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo nghề nghiệp:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put("/specialty", {
        id: id,
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật nghề nghiệp:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/specialty/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa nghề nghiệp:", error);
      throw error;
    }
  },
};

// ============ POLITICAL THEORY APIs ============
export const politicalTheoryApi = {
  getAll: async () => {
    try {
      const response = await api.get("/political_theory");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lý luận chính trị:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/political_theory/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy lý luận chính trị:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/political_theory", {
        name: data.name,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo lý luận chính trị:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put("/political_theory", {
        id: id,
        name: data.name,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật lý luận chính trị:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/political_theory/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa lý luận chính trị:", error);
      throw error;
    }
  },
};

export const languageLevelApi = {
  getAll: async () => {
    try {
      const response = await api.get("/language_level");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách trình độ ngoại ngữ:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/language_level/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy trình độ ngoại ngữ:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/language_level", {
        name: data.name,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo trình độ ngoại ngữ:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put("/language_level", {
        id: id,
        name: data.name,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trình độ ngoại ngữ:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/language_level/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa trình độ ngoại ngữ:", error);
      throw error;
    }
  },
};

// ============ NATIONALITY APIs ============
export const nationalityApi = {
  getAll: async () => {
    try {
      const response = await api.get("/nationality");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quốc tịch:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/nationality/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy quốc tịch:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/nationality", {
        name: data.name,
        code: data.code || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo quốc tịch:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put("/nationality", {
        id: id,
        name: data.name,
        code: data.code || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật quốc tịch:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/nationality/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa quốc tịch:", error);
      throw error;
    }
  },
};

// ============ LABOR CONTRACT TYPE APIs ============
export const laborContractTypeApi = {
  getAll: async () => {
    try {
      const response = await api.get("/labor_contract_type");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại hợp đồng lao động:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/labor_contract_type/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy loại hợp đồng lao động:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/labor_contract_type", {
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo loại hợp đồng lao động:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/labor_contract_type/${id}`, {
        id: id,
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật loại hợp đồng lao động:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/labor_contract_type/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa loại hợp đồng lao động:", error);
      throw error;
    }
  },
};

export const culturalLevelApi = {
  getAll: async () => {
    try {
      const response = await api.get("/cultural_level");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách trình độ văn hóa:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/cultural_level/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy trình độ văn hóa:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/cultural_level", {
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo trình độ văn hóa:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/cultural_level/${id}`, {
        id: id,
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trình độ văn hóa:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/cultural_level/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa trình độ văn hóa:", error);
      throw error;
    }
  },
};

export const professionalLevelApi = {
  getAll: async () => {
    try {
      const response = await api.get("/professional_level");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách trình độ chuyên môn:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/professional_level/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy trình độ chuyên môn:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/professional_level", {
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo trình độ chuyên môn:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/professional_level/${id}`, {
        id: id,
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trình độ chuyên môn:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/professional_level/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa trình độ chuyên môn:", error);
      throw error;
    }
  },
};

export const itLevelApi = {
  getAll: async () => {
    try {
      const response = await api.get("/it_level");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách trình độ tin học:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/it_level/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy trình độ tin học:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/it_level", {
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo trình độ tin học:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/it_level/${id}`, {
        id: id,
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trình độ tin học:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/it_level/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa trình độ tin học:", error);
      throw error;
    }
  },
};

export const trainingInstitutionApi = {
  getAll: async () => {
    try {
      const response = await api.get("/training_institution");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cơ sở đào tạo:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/training_institution/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy cơ sở đào tạo:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/training_institution", {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo cơ sở đào tạo:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put("/training_institution", {
        id: id,
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật cơ sở đào tạo:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/training_institution/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa cơ sở đào tạo:", error);
      throw error;
    }
  },
};

export const trainingMajorApi = {
  getAll: async () => {
    try {
      const response = await api.get("/training_major");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ngành đào tạo:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/training_major/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy ngành đào tạo:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/training_major", {
        code: data.code,
        name: data.name,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo ngành đào tạo:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/training_major/${id}`, {
        id: id,
        code: data.code,
        name: data.name,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật ngành đào tạo:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/training_major/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa ngành đào tạo:", error);
      throw error;
    }
  },
};

export const trainingTypeApi = {
  getAll: async () => {
    try {
      const response = await api.get("/training_type");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hình thức đào tạo:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/training_type/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy hình thức đào tạo:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/training_type", {
        name: data.name,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo hình thức đào tạo:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put("/training_type", {
        id: id,
        name: data.name,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật hình thức đào tạo:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/training_type/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa hình thức đào tạo:", error);
      throw error;
    }
  },
};

export const militaryRankApi = {
  getAll: async () => {
    try {
      const response = await api.get("/military_rank");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quân hàm:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/military_rank/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy quân hàm:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/military_rank", {
        code: data.code,
        name: data.name,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo quân hàm:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/military_rank/${id}`, {
        id: id,
        code: data.code,
        name: data.name,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật quân hàm:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/military_rank/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa quân hàm:", error);
      throw error;
    }
  },
};

export const policyFamilyApi = {
  getAll: async () => {
    try {
      const response = await api.get("/policy_family");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gia đình chính sách:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/policy_family/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy gia đình chính sách:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/policy_family", {
        code: data.code,
        name: data.name,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo gia đình chính sách:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/policy_family/${id}`, {
        id: id,
        code: data.code,
        name: data.name,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật gia đình chính sách:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/policy_family/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa gia đình chính sách:", error);
      throw error;
    }
  },
};

export const socialInsuranceJobApi = {
  getAll: async () => {
    try {
      const response = await api.get("/social_insurance_job");
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách công việc BHXH:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/social_insurance_job/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy công việc BHXH:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/social_insurance_job", {
        code: data.code,
        name: data.name,
        description: data.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo công việc BHXH:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/social_insurance_job/${id}`, {
        id: id,
        code: data.code,
        name: data.name,
        description: data.description || null,
        updatedAt: new Date().toISOString(),
        deleted: false,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật công việc BHXH:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/social_insurance_job/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa công việc BHXH:", error);
      throw error;
    }
  },
};

// Export tất cả
export const categoriesApi = {
  role: roleApi,
  jobTitle: jobTitleApi,
  major: majorApi,
  degree: degreeApi,
  ethnicity: ethnicityApi,
  ward: wardApi,
  provinceCity: provinceCityApi,
  specialty: specialtyApi,
  politicalTheory: politicalTheoryApi,
  languageLevel: languageLevelApi,
  nationality: nationalityApi,
  laborContractType: laborContractTypeApi,
  culturalLevel: culturalLevelApi,
  professionalLevel: professionalLevelApi,
  itLevel: itLevelApi,
  trainingInstitution: trainingInstitutionApi,
  trainingMajor: trainingMajorApi,
  trainingType: trainingTypeApi,
  militaryRank: militaryRankApi,
  policyFamily: policyFamilyApi,
  socialInsuranceJob: socialInsuranceJobApi
};
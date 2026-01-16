import api from '@/lib/axios';

// Types định nghĩa cho các loại quyết định
export enum DecisionType {
  REWARD = 'REWARD',
  DISCIPLINE = 'DISCIPLINE',
  SALARY_ADJUSTMENT = 'SALARY_ADJUSTMENT',
  APPOINTMENT = 'APPOINTMENT',
  DISMISSAL = 'DISMISSAL',
  CONTRACT_SUSPENSION_TERMINATION = 'CONTRACT_SUSPENSION_TERMINATION',
  CONTRACT_RENEWAL_EXTENSION = 'CONTRACT_RENEWAL_EXTENSION'
}

export enum DecisionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

// Request/Response Types
export type CreateDecisionRequest = {
  decisionNumber: string;
  decisionType: DecisionType;
  status: DecisionStatus;
  decisionDate: string; // DD/MM/YYYY
  title?: string;
  content?: string;
  note?: string;
  employeeIds: number[];
  details: Record<string, any>;
};

export type UpdateDecisionRequest = Omit<CreateDecisionRequest, 'decisionNumber'>;

export type DecisionResponse = {
  id: number;
  decisionNumber: string;
  decisionType: DecisionType;
  status: DecisionStatus;
  decisionDate: string;
  title?: string;
  content?: string;
  note?: string;
  employeeIds: number[];
  details: Record<string, any>;
  createdAt: string;
  createdBy: string;
};

// Details Types cho mỗi loại quyết định
export type RewardDetails = {
  rewardType: string;
  rewardReason: string;
  rewardValue?: string;
  achievement: string;
};

export type DisciplineDetails = {
  disciplineType: string; // Khiển trách, Cảnh cáo, Cách chức, Sa thải...
  disciplineReason: string;
  violation: string;
  executionTime?: string;
};

export type SalaryAdjustmentDetails = {
  oldSalary: number;
  newSalary: number;
  changePercent: number;
  reason: string;
  effectiveDate: string; // DD/MM/YYYY
  adjustmentType: string; // Tăng lương định kỳ, Tăng đột xuất, Giảm lương...
};

export type AppointmentDetails = {
  oldPosition: string;
  newPosition: string;
  department: string;
  effectiveDate: string; // DD/MM/YYYY
  appointmentDuration?: string;
  reason: string;
};

export type DismissalDetails = {
  dismissedPosition: string;
  afterDismissalPosition: string;
  reason: string;
  effectiveDate: string; // DD/MM/YYYY
};

export type ContractSuspensionTerminationDetails = {
  contractType: string;
  contractNumber: string;
  contractSignDate: string; // DD/MM/YYYY
  actionType: 'SUSPEND' | 'TERMINATE';
  reason: string;
  effectiveDate: string; // DD/MM/YYYY
  suspensionDuration?: string; // Nếu là tạm hoãn, nếu chấm dứt thì vô thời hạn
};

export type ContractRenewalExtensionDetails = {
  oldContractType: string;
  oldContractNumber: string;
  newContractType: string;
  newContractNumber: string;
  newContractDuration: string;
  startDate: string; // DD/MM/YYYY
  endDate?: string; // DD/MM/YYYY (nếu có thời hạn)
};

// API Functions
export const decisionApi = {
  // Lấy tất cả quyết định
  getAll: async (filters?: { decisionNumber?: string; title?: string }) => {
    try {
      const response = await api.get('/decisions', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách quyết định:', error);
      throw error;
    }
  },

  // Lấy quyết định theo ID
  getById: async (id: number): Promise<DecisionResponse> => {
    try {
      const response = await api.get(`/decisions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy quyết định ${id}:`, error);
      throw error;
    }
  },

  // Tạo quyết định mới
  create: async (payload: CreateDecisionRequest): Promise<DecisionResponse> => {
    try {
      const response = await api.post('/decisions', payload);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo quyết định:', error);
      throw error;
    }
  },

  // Cập nhật quyết định
  update: async (id: number, payload: UpdateDecisionRequest): Promise<DecisionResponse> => {
    try {
      const response = await api.put(`/decisions/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật quyết định ${id}:`, error);
      throw error;
    }
  },

  // Xóa quyết định
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/decisions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa quyết định ${id}:`, error);
      throw error;
    }
  },

  // ===== Các hàm tạo quyết định theo loại =====

  // Tạo quyết định khen thưởng
  createReward: async (
    decisionNumber: string,
    decisionDate: string,
    employeeIds: number[],
    details: RewardDetails,
    title?: string,
    content?: string,
    note?: string
  ): Promise<DecisionResponse> => {
    return decisionApi.create({
      decisionNumber,
      decisionType: DecisionType.REWARD,
      status: DecisionStatus.DRAFT,
      decisionDate,
      title,
      content,
      note,
      employeeIds,
      details
    });
  },

  // Tạo quyết định kỷ luật
  createDiscipline: async (
    decisionNumber: string,
    decisionDate: string,
    employeeIds: number[],
    details: DisciplineDetails,
    title?: string,
    content?: string,
    note?: string
  ): Promise<DecisionResponse> => {
    return decisionApi.create({
      decisionNumber,
      decisionType: DecisionType.DISCIPLINE,
      status: DecisionStatus.DRAFT,
      decisionDate,
      title,
      content,
      note,
      employeeIds,
      details
    });
  },

  // Tạo quyết định điều chỉnh lương
  createSalaryAdjustment: async (
    decisionNumber: string,
    decisionDate: string,
    employeeIds: number[],
    details: SalaryAdjustmentDetails,
    title?: string,
    content?: string,
    note?: string
  ): Promise<DecisionResponse> => {
    return decisionApi.create({
      decisionNumber,
      decisionType: DecisionType.SALARY_ADJUSTMENT,
      status: DecisionStatus.DRAFT,
      decisionDate,
      title,
      content,
      note,
      employeeIds,
      details
    });
  },

  // Tạo quyết định bổ nhiệm
  createAppointment: async (
    decisionNumber: string,
    decisionDate: string,
    employeeIds: number[],
    details: AppointmentDetails,
    title?: string,
    content?: string,
    note?: string
  ): Promise<DecisionResponse> => {
    return decisionApi.create({
      decisionNumber,
      decisionType: DecisionType.APPOINTMENT,
      status: DecisionStatus.DRAFT,
      decisionDate,
      title,
      content,
      note,
      employeeIds,
      details
    });
  },

  // Tạo quyết định miễn nhiệm
  createDismissal: async (
    decisionNumber: string,
    decisionDate: string,
    employeeIds: number[],
    details: DismissalDetails,
    title?: string,
    content?: string,
    note?: string
  ): Promise<DecisionResponse> => {
    return decisionApi.create({
      decisionNumber,
      decisionType: DecisionType.DISMISSAL,
      status: DecisionStatus.DRAFT,
      decisionDate,
      title,
      content,
      note,
      employeeIds,
      details
    });
  },

  // Tạo quyết định tạm hoãn/chấm dứt hợp đồng
  createContractSuspensionTermination: async (
    decisionNumber: string,
    decisionDate: string,
    employeeIds: number[],
    details: ContractSuspensionTerminationDetails,
    title?: string,
    content?: string,
    note?: string
  ): Promise<DecisionResponse> => {
    return decisionApi.create({
      decisionNumber,
      decisionType: DecisionType.CONTRACT_SUSPENSION_TERMINATION,
      status: DecisionStatus.DRAFT,
      decisionDate,
      title,
      content,
      note,
      employeeIds,
      details
    });
  },

  // Tạo quyết định tái ký/gia hạn hợp đồng
  createContractRenewalExtension: async (
    decisionNumber: string,
    decisionDate: string,
    employeeIds: number[],
    details: ContractRenewalExtensionDetails,
    title?: string,
    content?: string,
    note?: string
  ): Promise<DecisionResponse> => {
    return decisionApi.create({
      decisionNumber,
      decisionType: DecisionType.CONTRACT_RENEWAL_EXTENSION,
      status: DecisionStatus.DRAFT,
      decisionDate,
      title,
      content,
      note,
      employeeIds,
      details
    });
  }
};

// ===== Attachment API =====

export type AttachmentResponse = {
  id: number;
  decision: DecisionResponse;
  fileName: string;
  contentType: string;
  storagePath: string;
  uploadedBy: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
};

export const decisionAttachmentApi = {
  // Upload file đính kèm cho quyết định
  upload: async (decisionId: number, file: File): Promise<AttachmentResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/api/decisions/${decisionId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi upload file cho quyết định ${decisionId}:`, error);
      throw error;
    }
  },

  // Download file đính kèm
  download: async (decisionId: number, attachmentId: number, fileName: string) => {
    try {
      const response = await api.get(
        `/api/decisions/${decisionId}/attachments/${attachmentId}/download`,
        { responseType: 'blob' }
      );
      
      // Tạo URL download và trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi download file ${attachmentId}:`, error);
      throw error;
    }
  },

  // Lấy danh sách file đính kèm của quyết định
  getByDecisionId: async (decisionId: number): Promise<AttachmentResponse[]> => {
    try {
      const response = await api.get(`/api/decisions/${decisionId}/attachments`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách file của quyết định ${decisionId}:`, error);
      throw error;
    }
  },

  // Xóa file đính kèm
  delete: async (decisionId: number, attachmentId: number) => {
    try {
      const response = await api.delete(`/api/decisions/${decisionId}/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa file ${attachmentId}:`, error);
      throw error;
    }
  }
};

export default decisionApi;
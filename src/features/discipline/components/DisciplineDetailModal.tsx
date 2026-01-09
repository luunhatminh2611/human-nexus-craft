// components/DisciplineDetailModal.tsx

import { useState, useEffect } from 'react';
import { X, Download, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { 
  mockDisciplines,
  type Discipline,
  statusLabels,
  actionLabels,
  severityLabels
} from '../../../mock/dismissed';

interface DisciplineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  disciplineId: string | null;
  onSuccess: () => void;
}

export default function DisciplineDetailModal({
  isOpen,
  onClose,
  disciplineId,
  onSuccess,
}: DisciplineDetailModalProps) {
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && disciplineId) {
      fetchDisciplineDetail();
    }
  }, [isOpen, disciplineId]);

  const fetchDisciplineDetail = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const found = mockDisciplines.find(d => d.id === disciplineId);
    if (found) {
      setDiscipline(found);
    }

    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: statusLabels.DRAFT, className: 'bg-gray-100 text-gray-800', icon: FileText },
      'ACTIVE': { label: statusLabels.ACTIVE, className: 'bg-green-100 text-green-800', icon: CheckCircle },
      'EXPIRED': { label: statusLabels.EXPIRED, className: 'bg-gray-100 text-gray-600', icon: Clock },
    };

    const config = statusConfig[status] || { label: status, className: '', icon: FileText };
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (!isOpen) return null;

  if (isLoading || !discipline) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Chi tiết quyết định kỷ luật</h2>
            {getStatusBadge(discipline.status)}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {/* Thông tin nhân viên */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Thông tin nhân viên</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Họ và tên</Label>
                  <p className="mt-1 font-medium">{discipline.employeeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phòng ban</Label>
                  <p className="mt-1">{discipline.departmentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Chức vụ</Label>
                  <p className="mt-1">{discipline.position}</p>
                </div>
              </div>
            </div>

            {/* Thông tin vi phạm */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Thông tin vi phạm</h3>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Loại vi phạm</Label>
                  <p className="mt-1 font-medium">{discipline.violationType}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Mức độ vi phạm</Label>
                  <div className="mt-1">
                    <Badge className={
                      discipline.severity === 'LIGHT' ? 'bg-blue-100 text-blue-800' :
                      discipline.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {severityLabels[discipline.severity]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Ngày vi phạm</Label>
                  <p className="mt-1">
                    {new Date(discipline.violationDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Địa điểm</Label>
                  <p className="mt-1">{discipline.violationLocation}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Người ghi nhận</Label>
                  <div className="mt-1">
                    <p className="font-medium">{discipline.createdByName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(discipline.createdDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Mô tả hành vi vi phạm</Label>
                <div className="mt-2 text-sm bg-gray-50 p-4 rounded-md border whitespace-pre-wrap">
                  {discipline.violationDescription}
                </div>
              </div>
            </div>

            {/* Quyết định kỷ luật */}
            {discipline.decisionNumber ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Quyết định kỷ luật</h3>

                <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900">Quyết định đã được ban hành</p>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-700">Số quyết định:</span>
                          <span className="ml-2 font-medium text-green-900">{discipline.decisionNumber}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Ngày quyết định:</span>
                          <span className="ml-2 font-medium text-green-900">
                            {discipline.decisionDate 
                              ? new Date(discipline.decisionDate).toLocaleDateString('vi-VN')
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Hình thức kỷ luật</Label>
                    <div className="mt-1">
                      <Badge className={
                        discipline.disciplineAction === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                        discipline.disciplineAction === 'REPRIMAND' ? 'bg-orange-100 text-orange-800' :
                        discipline.disciplineAction === 'SALARY_CUT' ? 'bg-red-100 text-red-800' :
                        discipline.disciplineAction === 'DEMOTION' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-200 text-red-900'
                      }>
                        {discipline.disciplineAction && actionLabels[discipline.disciplineAction]}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Ngày có hiệu lực</Label>
                    <p className="mt-1 font-medium">
                      {discipline.effectiveDate 
                        ? new Date(discipline.effectiveDate).toLocaleDateString('vi-VN')
                        : '-'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Ngày hết hiệu lực</Label>
                    <p className="mt-1">
                      {discipline.expiryDate 
                        ? new Date(discipline.expiryDate).toLocaleDateString('vi-VN')
                        : 'Vĩnh viễn'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Lý do quyết định</Label>
                  <div className="mt-2 text-sm bg-gray-50 p-4 rounded-md border whitespace-pre-wrap">
                    {discipline.decisionReason}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Quyết định kỷ luật</h3>
                <div className="text-center py-8 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Chưa có quyết định kỷ luật</p>
                  <p className="text-sm text-gray-400 mt-1">Quyết định đang ở trạng thái nháp</p>
                </div>
              </div>
            )}

            {/* File đính kèm */}
            {discipline.attachmentFiles && discipline.attachmentFiles.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  File đính kèm ({discipline.attachmentFiles.length})
                </h3>
                <div className="space-y-2">
                  {discipline.attachmentFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{file}</p>
                          <p className="text-xs text-gray-500">Tài liệu đính kèm</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ghi chú */}
            {discipline.notes && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Ghi chú</h3>
                <div className="text-sm bg-gray-50 p-4 rounded-md border whitespace-pre-wrap">
                  {discipline.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
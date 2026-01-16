import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import { FileText, Download, X, Calendar, Building, Award, User, Clock } from 'lucide-react';
import { mockDegrees, mockDegreeHistory, type Degree, type DegreeHistory } from '../../../mock/degree';

interface DegreeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  degreeId: string | null;
}

export default function DegreeDetailModal({ isOpen, onClose, degreeId }: DegreeDetailModalProps) {
  const [degree, setDegree] = useState<Degree | null>(null);
  const [history, setHistory] = useState<DegreeHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && degreeId) {
      fetchDegreeDetail();
    }
  }, [isOpen, degreeId]);

  const fetchDegreeDetail = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const foundDegree = mockDegrees.find(d => d.id === degreeId);
    setDegree(foundDegree || null);
    
    const degreeHistory = mockDegreeHistory.filter(h => h.degreeId === degreeId);
    setHistory(degreeHistory);
    
    setIsLoading(false);
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'EDUCATION': { label: 'Học vấn', className: 'bg-blue-100 text-blue-800' },
      'CERTIFICATION': { label: 'Chứng chỉ', className: 'bg-purple-100 text-purple-800' },
      'LICENSE': { label: 'Giấy phép', className: 'bg-orange-100 text-orange-800' },
    };

    const config = typeConfig[type];
    if (!config) return null;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getActionLabel = (action: string) => {
    const actionLabels = {
      'CREATED': 'Tạo mới',
      'UPDATED': 'Cập nhật',
      'DELETED': 'Xóa',
    };
    return actionLabels[action] || action;
  };

  const handleDownload = () => {
    if (degree?.documentUrl) {
      console.log('Downloading:', degree.documentUrl);
      alert(`Đang tải xuống tài liệu: ${degree.name}`);
    }
  };

  if (!degree && !isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết bằng cấp</span>

          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : degree ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getTypeBadge(degree.type)}
                </div>
                <h3 className="text-xl font-semibold">{degree.name}</h3>
                {degree.major && (
                  <p className="text-muted-foreground">{degree.major}</p>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Nhân viên</span>
                </div>
                <p className="font-medium">{degree.employeeName}</p>
                <p className="text-sm text-muted-foreground">{degree.employeeCode}</p>
                <p className="text-sm text-muted-foreground">{degree.department} - {degree.position}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>Tổ chức cấp</span>
                </div>
                <p className="font-medium">{degree.institution}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ngày cấp</span>
                </div>
                <p className="font-medium">
                  {new Date(degree.issueDate).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {degree.expiryDate && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày hết hạn</span>
                  </div>
                  <p className="font-medium">
                    {new Date(degree.expiryDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}

              {degree.certificateNumber && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>Số bằng cấp/chứng chỉ</span>
                  </div>
                  <p className="font-medium">{degree.certificateNumber}</p>
                </div>
              )}

              {degree.level && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>Trình độ</span>
                  </div>
                  <p className="font-medium">{degree.level}</p>
                </div>
              )}
            </div>

            {/* Document */}
            {degree.documentUrl && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Tài liệu đính kèm</p>
                      <p className="text-sm text-muted-foreground">
                        {degree.documentUrl.split('/').pop()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                </div>
              </div>
            )}

            {/* Creation Info */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-3">Thông tin lưu trữ</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Người tạo:</span>
                  <span className="font-medium">{degree.createdBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <span className="font-medium">
                    {new Date(degree.createdDate).toLocaleString('vi-VN')}
                  </span>
                </div>
                {degree.updatedDate && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Người cập nhật:</span>
                      <span className="font-medium">{degree.updatedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày cập nhật:</span>
                      <span className="font-medium">
                        {new Date(degree.updatedDate).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            {degree.notes && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Ghi chú</h4>
                <p className="text-muted-foreground">{degree.notes}</p>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Lịch sử thay đổi
                </h4>
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{getActionLabel(item.action)}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.performedDate).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Bởi: {item.performedBy}
                        </p>
                        {item.notes && (
                          <p className="text-sm mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Không tìm thấy thông tin bằng cấp
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
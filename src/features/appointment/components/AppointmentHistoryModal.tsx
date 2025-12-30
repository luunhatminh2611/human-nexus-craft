// pages/hr/components/EmployeeHistoryDetailModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { 
  X, 
  History, 
  Calendar,
  Briefcase,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';
import { mockEmployeeHistory, type EmployeeCareerTimeline } from '../../../mock/mockAppointmentHistory';

interface EmployeeHistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
  isAdmin: boolean;
}

export default function EmployeeHistoryDetailModal({
  isOpen,
  onClose,
  employeeId,
  isAdmin,
}: EmployeeHistoryDetailModalProps) {
  const [employee, setEmployee] = useState<EmployeeCareerTimeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchEmployeeHistory();
    }
  }, [isOpen, employeeId]);

  const fetchEmployeeHistory = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const foundEmployee = mockEmployeeHistory.find(e => e.employeeId === employeeId);
    if (foundEmployee) {
      setEmployee(foundEmployee);
    }

    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getTypeBadge = (type: string) => {
    if (type === 'APPOINTMENT') {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <TrendingUp className="h-3 w-3 mr-1" />
          Bổ nhiệm
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800">
        <TrendingDown className="h-3 w-3 mr-1" />
        Miễn nhiệm
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!employee) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl">
          <div className="text-center py-8 text-muted-foreground">
            Không tìm thấy lịch sử của nhân viên
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const appointmentCount = employee.history.filter(h => h.type === 'APPOINTMENT').length;
  const terminationCount = employee.history.filter(h => h.type === 'TERMINATION').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử Bổ nhiệm & Miễn nhiệm
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Employee Info */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-blue-900">{employee.employeeName}</h3>
                <p className="text-sm text-muted-foreground">Mã NV: {employee.employeeId}</p>
                {employee.currentPosition ? (
                  <div className="mt-2">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Đang giữ chức
                    </Badge>
                    <p className="text-sm mt-1">
                      <strong>{employee.currentPosition}</strong> - {employee.currentDepartment}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <Badge className="bg-gray-100 text-gray-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Không giữ chức vụ
                    </Badge>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Thống kê</div>
                <div className="flex gap-3 mt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{appointmentCount}</div>
                    <div className="text-xs text-muted-foreground">Bổ nhiệm</div>
                  </div>
                  {terminationCount > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{terminationCount}</div>
                      <div className="text-xs text-muted-foreground">Miễn nhiệm</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline sự nghiệp
            </h3>
            
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-red-500">
              {employee.history.map((record, index) => {
                const isAppointment = record.type === 'APPOINTMENT';
                const Icon = isAppointment ? TrendingUp : TrendingDown;
                const bgColor = isAppointment ? 'bg-blue-500' : 'bg-red-500';
                const cardBg = isAppointment ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200';

                return (
                  <div key={record.id} className="relative flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${bgColor} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <Card className={`flex-1 p-4 ${cardBg}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          {getTypeBadge(record.type)}
                          <h4 className="font-bold text-lg mt-2">{record.position}</h4>
                          <p className="text-sm text-muted-foreground">{record.department}</p>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-semibold">
                            {new Date(record.decisionDate).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-muted-foreground">
                            {record.decisionNumber}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <Label className="text-muted-foreground">Ngày có hiệu lực</Label>
                            <p className="font-medium">
                              {new Date(record.effectiveDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          {record.endDate && (
                            <div>
                              <Label className="text-muted-foreground">Ngày kết thúc</Label>
                              <p className="font-medium">
                                {new Date(record.endDate).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          )}
                          {!record.endDate && isAppointment && (
                            <div>
                              <Label className="text-muted-foreground">Trạng thái</Label>
                              <Badge className="bg-green-100 text-green-800">
                                Đang giữ chức
                              </Badge>
                            </div>
                          )}
                        </div>

                        {(record.salary || record.allowance) && (
                          <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                            {record.salary && (
                              <div>
                                <Label className="text-muted-foreground">Lương</Label>
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(record.salary)}
                                </p>
                              </div>
                            )}
                            {record.allowance && (
                              <div>
                                <Label className="text-muted-foreground">Phụ cấp</Label>
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(record.allowance)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="pt-2 border-t">
                          <Label className="text-muted-foreground">Lý do</Label>
                          <p className="text-sm mt-1">{record.reason}</p>
                          {record.note && (
                            <>
                              <Label className="text-muted-foreground mt-2">Ghi chú</Label>
                              <p className="text-sm mt-1 text-muted-foreground italic">
                                {record.note}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Người quyết định: {record.createdBy} • {' '}
                          {new Date(record.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Statistics */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Tóm tắt sự nghiệp
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Tổng số lần bổ nhiệm</Label>
                <p className="text-2xl font-bold text-blue-600">{appointmentCount}</p>
              </div>
              {terminationCount > 0 && (
                <div>
                  <Label className="text-muted-foreground">Số lần miễn nhiệm</Label>
                  <p className="text-2xl font-bold text-red-600">{terminationCount}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Thời gian công tác</Label>
                <p className="text-2xl font-bold text-green-600">
                  {(() => {
                    const firstRecord = employee.history[0];
                    const startDate = new Date(firstRecord.effectiveDate);
                    const today = new Date();
                    const years = Math.floor((today.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                    return `${years} năm`;
                  })()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
          {isAdmin && (
            <Button variant="outline" onClick={() => console.log('Export to PDF')}>
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
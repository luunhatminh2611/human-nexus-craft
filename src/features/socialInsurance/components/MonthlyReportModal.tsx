// components/MonthlyReportModal.tsx

import { useState, useEffect } from 'react';
import { X, Download, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import { 
  mockMonthlyReports,
  mockInsuranceRecords,
  type MonthlyInsuranceReport,
  calculateInsuranceAmount
} from '../../../mock/socialInsurance';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  month?: string;  // Format: YYYY-MM
  onSuccess: () => void;
}

export default function MonthlyReportModal({
  isOpen,
  onClose,
  month,
  onSuccess,
}: MonthlyReportModalProps) {
  const [report, setReport] = useState<MonthlyInsuranceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    isPaid: false,
    paidDate: '',
    paymentReference: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (month) {
        fetchReportDetail();
      } else {
        // Create new report for current month
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        generateNewReport(currentMonth);
      }
    }
  }, [isOpen, month]);

  const fetchReportDetail = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const found = mockMonthlyReports.find(r => r.month === month);
    if (found) {
      setReport(found);
      setIsEditing(false);
      setPaymentData({
        isPaid: found.isPaid,
        paidDate: found.paidDate || '',
        paymentReference: found.paymentReference || '',
      });
    }

    setIsLoading(false);
  };

  const generateNewReport = async (targetMonth: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get active employees for the month
    const activeEmployees = mockInsuranceRecords.filter(r => r.status === 'ACTIVE');
    
    // Calculate totals
    const totalSalaryBase = activeEmployees.reduce((sum, r) => sum + r.currentSalaryBase, 0);
    
    let employeeTotal = 0;
    let employerTotal = 0;
    let siEmployee = 0, siEmployer = 0;
    let hiEmployee = 0, hiEmployer = 0;
    let uiEmployee = 0, uiEmployer = 0;

    activeEmployees.forEach(emp => {
      const amounts = calculateInsuranceAmount(emp.currentSalaryBase);
      siEmployee += amounts.socialInsurance.employee;
      siEmployer += amounts.socialInsurance.employer;
      hiEmployee += amounts.healthInsurance.employee;
      hiEmployer += amounts.healthInsurance.employer;
      uiEmployee += amounts.unemploymentInsurance.employee;
      uiEmployer += amounts.unemploymentInsurance.employer;
    });

    employeeTotal = siEmployee + hiEmployee + uiEmployee;
    employerTotal = siEmployer + hiEmployer + uiEmployer;

    const newReport: MonthlyInsuranceReport = {
      id: `RPT-${targetMonth}`,
      month: targetMonth,
      totalEmployees: activeEmployees.length,
      totalSalaryBase,
      amounts: {
        employeeTotal,
        employerTotal,
        grandTotal: employeeTotal + employerTotal,
        socialInsurance: {
          employee: siEmployee,
          employer: siEmployer,
          total: siEmployee + siEmployer,
        },
        healthInsurance: {
          employee: hiEmployee,
          employer: hiEmployer,
          total: hiEmployee + hiEmployer,
        },
        unemploymentInsurance: {
          employee: uiEmployee,
          employer: uiEmployer,
          total: uiEmployee + uiEmployer,
        },
      },
      isPaid: false,
      createdBy: 'ADMIN-001',
      createdByName: 'Nguyễn Văn E',
      createdDate: new Date().toISOString(),
    };

    setReport(newReport);
    setIsEditing(true);
    setPaymentData({
      isPaid: false,
      paidDate: '',
      paymentReference: '',
    });

    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleMarkAsPaid = () => {
    setPaymentData({
      isPaid: true,
      paidDate: new Date().toISOString().split('T')[0],
      paymentReference: '',
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Monthly report:', {
      ...report,
      ...paymentData,
      file: file?.name,
    });

    setIsSubmitting(false);
    onSuccess();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (!isOpen) return null;

  if (isLoading || !report) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  const activeEmployees = mockInsuranceRecords.filter(r => r.status === 'ACTIVE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              Báo cáo BHXH tháng {new Date(report.month + '-01').toLocaleDateString('vi-VN', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            {report.isPaid ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Đã đóng
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">
                Chưa đóng
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="text-sm text-blue-700">Số nhân viên</div>
                <div className="text-2xl font-bold text-blue-900">{report.totalEmployees}</div>
              </Card>
              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="text-sm text-purple-700">Tổng lương đóng</div>
                <div className="text-lg font-bold text-purple-900">
                  {formatCurrency(report.totalSalaryBase)}
                </div>
              </Card>
              <Card className="p-4 bg-orange-50 border-orange-200">
                <div className="text-sm text-orange-700">NV phải đóng</div>
                <div className="text-lg font-bold text-orange-900">
                  {formatCurrency(report.amounts.employeeTotal)}
                </div>
              </Card>
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="text-sm text-green-700">Công ty phải đóng</div>
                <div className="text-lg font-bold text-green-900">
                  {formatCurrency(report.amounts.employerTotal)}
                </div>
              </Card>
            </div>

            {/* Breakdown */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Chi tiết các khoản đóng</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại bảo hiểm</TableHead>
                    <TableHead className="text-right">Nhân viên</TableHead>
                    <TableHead className="text-right">Công ty</TableHead>
                    <TableHead className="text-right">Tổng cộng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">BHXH (8% / 17.5%)</TableCell>
                    <TableCell className="text-right text-orange-600 font-medium">
                      {formatCurrency(report.amounts.socialInsurance.employee)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600 font-medium">
                      {formatCurrency(report.amounts.socialInsurance.employer)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(report.amounts.socialInsurance.total)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BHYT (1.5% / 3%)</TableCell>
                    <TableCell className="text-right text-orange-600 font-medium">
                      {formatCurrency(report.amounts.healthInsurance.employee)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600 font-medium">
                      {formatCurrency(report.amounts.healthInsurance.employer)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(report.amounts.healthInsurance.total)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">BHTN (1% / 1%)</TableCell>
                    <TableCell className="text-right text-orange-600 font-medium">
                      {formatCurrency(report.amounts.unemploymentInsurance.employee)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600 font-medium">
                      {formatCurrency(report.amounts.unemploymentInsurance.employer)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(report.amounts.unemploymentInsurance.total)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-gray-50 font-bold">
                    <TableCell>TỔNG CỘNG</TableCell>
                    <TableCell className="text-right text-orange-700">
                      {formatCurrency(report.amounts.employeeTotal)}
                    </TableCell>
                    <TableCell className="text-right text-blue-700">
                      {formatCurrency(report.amounts.employerTotal)}
                    </TableCell>
                    <TableCell className="text-right text-lg">
                      {formatCurrency(report.amounts.grandTotal)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>

            {/* Employee List */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Danh sách nhân viên ({activeEmployees.length})</h3>
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nhân viên</TableHead>
                      <TableHead>Số sổ BHXH</TableHead>
                      <TableHead className="text-right">Lương đóng</TableHead>
                      <TableHead className="text-right">NV đóng</TableHead>
                      <TableHead className="text-right">CT đóng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeEmployees.map((emp) => {
                      const amounts = calculateInsuranceAmount(emp.currentSalaryBase);
                      const empTotal = amounts.socialInsurance.employee + 
                                      amounts.healthInsurance.employee + 
                                      amounts.unemploymentInsurance.employee;
                      const emplerTotal = amounts.socialInsurance.employer + 
                                         amounts.healthInsurance.employer + 
                                         amounts.unemploymentInsurance.employer;
                      
                      return (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{emp.employeeName}</div>
                              <div className="text-xs text-gray-500">{emp.departmentName}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{emp.insuranceBookNumber}</TableCell>
                          <TableCell className="text-right text-sm">
                            {formatCurrency(emp.currentSalaryBase)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-orange-600">
                            {formatCurrency(empTotal)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-blue-600">
                            {formatCurrency(emplerTotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Payment Info */}
            {isEditing && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <h3 className="font-semibold mb-3">Thông tin thanh toán</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paidDate">Ngày đóng</Label>
                    <Input
                      id="paidDate"
                      type="date"
                      value={paymentData.paidDate}
                      onChange={(e) => setPaymentData(prev => ({ 
                        ...prev, 
                        paidDate: e.target.value 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentReference">Mã tham chiếu</Label>
                    <Input
                      id="paymentReference"
                      value={paymentData.paymentReference}
                      onChange={(e) => setPaymentData(prev => ({ 
                        ...prev, 
                        paymentReference: e.target.value 
                      }))}
                      placeholder="PAY-2024-12-001"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="reportFile">File báo cáo</Label>
                  <div>
                    <label
                      htmlFor="reportFile"
                      className="flex items-center justify-center gap-2 border-2 border-dashed border-yellow-300 rounded-md p-4 cursor-pointer hover:border-yellow-400 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm text-yellow-900">
                        {file ? file.name : 'Tải lên file báo cáo BHXH (PDF)'}
                      </span>
                    </label>
                    <input
                      id="reportFile"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf"
                    />
                  </div>
                </div>
              </Card>
            )}

            {report.isPaid && !isEditing && (
              <Card className="p-4 bg-green-50 border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Thông tin đã thanh toán</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Ngày đóng:</span>{' '}
                    <span className="font-medium">
                      {report.paidDate && new Date(report.paidDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">Mã tham chiếu:</span>{' '}
                    <span className="font-medium">{report.paymentReference}</span>
                  </div>
                  {report.reportFile && (
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(report.reportFile, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Tải báo cáo
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div>
            {!report.isPaid && !isEditing && (
              <Button
                variant="outline"
                onClick={handleMarkAsPaid}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Đánh dấu đã đóng
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Đóng
            </Button>
            {isEditing && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu báo cáo'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border rounded-lg ${className}`}>
      {children}
    </div>
  );
}
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import mockData from '@/mock/data';
import { useAuthStore } from '@/store/authStore';
import { DollarSign, Download, FileText, Calendar, Heart } from 'lucide-react';

export default function EmployeePayroll() {
  const { employeeId } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const employee = mockData.employees.find((e) => e.id === employeeId);
  const payrollHistory = mockData.payrollHistory.filter((p) => p.employeeId === employeeId);
  const medicalRecord = mockData.medicalRecords.find((m) => m.id === employee?.medicalRecordId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const selectedPayroll = selectedMonth
    ? payrollHistory.find((p) => `${p.month}-${p.year}` === selectedMonth)
    : payrollHistory[0];

  const handleDownloadPayslip = () => {
    // Mock PDF download
    window.print();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bảng lương & Phúc lợi</h1>
          <p className="text-muted-foreground">Xem thông tin lương và bảo hiểm của bạn</p>
        </div>

        {/* Payroll History */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Monthly Selector */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Lịch sử lương</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {payrollHistory.map((payroll) => (
                <Button
                  key={payroll.id}
                  variant={selectedMonth === `${payroll.month}-${payroll.year}` ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedMonth(`${payroll.month}-${payroll.year}`)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Tháng {payroll.month}/{payroll.year}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Payslip Detail */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Phiếu lương tháng {selectedPayroll?.month}/{selectedPayroll?.year}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleDownloadPayslip}>
                <Download className="h-4 w-4 mr-2" />
                Tải PDF
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPayroll ? (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng thu nhập</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(selectedPayroll.grossSalary)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Thực nhận</p>
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(selectedPayroll.netSalary)}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <div className="border-b pb-2">
                      <h3 className="font-semibold text-sm mb-2">Thu nhập</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Lương cơ bản</span>
                          <span className="font-medium">{formatCurrency(selectedPayroll.basicSalary)}</span>
                        </div>
                        {Object.entries(selectedPayroll.allowances).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">{key}</span>
                            <span className="font-medium">{formatCurrency(value)}</span>
                          </div>
                        ))}
                        {Object.entries(selectedPayroll.bonuses).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">Thưởng {key}</span>
                            <span className="font-medium text-success">{formatCurrency(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-b pb-2">
                      <h3 className="font-semibold text-sm mb-2">Khấu trừ</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Thuế TNCN</span>
                          <span className="font-medium text-destructive">
                            -{formatCurrency(selectedPayroll.tax)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Bảo hiểm</span>
                          <span className="font-medium text-destructive">
                            -{formatCurrency(selectedPayroll.insurance)}
                          </span>
                        </div>
                        {Object.entries(selectedPayroll.deductions).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">{key}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Thực nhận</span>
                        <span className="text-xl font-bold text-success">
                          {formatCurrency(selectedPayroll.netSalary)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ngày thanh toán: {new Date(selectedPayroll.paymentDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có dữ liệu lương
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insurance Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Thông tin bảo hiểm
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medicalRecord?.insurance && medicalRecord.insurance.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {medicalRecord.insurance.map((ins, idx) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{ins.type}</h3>
                      <Badge variant="outline">{ins.number}</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ngày hết hạn:</span>
                        <span className="font-medium">
                          {new Date(ins.expiryDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {ins.nextCheckupDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Khám tiếp theo:</span>
                          <span className="font-medium">
                            {new Date(ins.nextCheckupDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Chưa có thông tin bảo hiểm
              </p>
            )}
          </CardContent>
        </Card>

        {/* Medical Visit History */}
        {medicalRecord?.visits && medicalRecord.visits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Lịch sử khám bệnh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medicalRecord.visits.map((visit, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{visit.reason}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(visit.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      {visit.resultFile && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Kết quả
                        </Button>
                      )}
                    </div>
                    {visit.diagnosis && (
                      <p className="text-sm">
                        <span className="font-medium">Chẩn đoán:</span> {visit.diagnosis}
                      </p>
                    )}
                    {visit.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{visit.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

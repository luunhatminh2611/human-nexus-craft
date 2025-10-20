import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import mockData from '@/mock/data';
import { DollarSign, Plus, Minus, FileText } from 'lucide-react';

export default function Salary() {
  const [selectedStructure, setSelectedStructure] = useState(mockData.salaryStructures[0].id);
  const [previewEmployee, setPreviewEmployee] = useState(mockData.employees[0].id);

  const currentStructure = mockData.salaryStructures.find((s) => s.id === selectedStructure);
  const currentEmployee = mockData.employees.find((e) => e.id === previewEmployee);

  // Calculate payslip
  const calculatePayslip = () => {
    if (!currentStructure || !currentEmployee) return null;

    const baseSalary = currentEmployee.salary.base;
    let totalEarnings = baseSalary;
    let totalDeductions = 0;

    const earnings = currentStructure.items
      .filter((item) => item.type === 'EARNING')
      .map((item) => {
        let amount = 0;
        if (item.method === 'FIXED') {
          amount = item.value;
        } else if (item.method === 'PERCENT_BASE') {
          amount = (baseSalary * item.value) / 100;
        }
        totalEarnings += amount;
        return { ...item, amount };
      });

    const deductions = currentStructure.items
      .filter((item) => item.type === 'DEDUCTION')
      .map((item) => {
        let amount = 0;
        if (item.method === 'FIXED') {
          amount = item.value;
        } else if (item.method === 'PERCENT_BASE') {
          amount = (baseSalary * item.value) / 100;
        }
        totalDeductions += amount;
        return { ...item, amount };
      });

    return {
      baseSalary,
      earnings,
      deductions,
      totalEarnings,
      totalDeductions,
      netSalary: totalEarnings - totalDeductions,
    };
  };

  const payslip = calculatePayslip();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cơ cấu lương</h1>
            <p className="text-muted-foreground">Quản lý và thiết kế bảng lương</p>
          </div>
          <Button>Tạo cơ cấu mới</Button>
        </div>

        {/* Salary Structures */}
        <div className="grid gap-4 md:grid-cols-3">
          {mockData.salaryStructures.map((structure) => (
            <Card
              key={structure.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedStructure === structure.id ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedStructure(structure.id)}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  {structure.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Khoản thu nhập:</span>
                    <span className="font-semibold">
                      {structure.items.filter((i) => i.type === 'EARNING').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Khoản khấu trừ:</span>
                    <span className="font-semibold">
                      {structure.items.filter((i) => i.type === 'DEDUCTION').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Áp dụng bậc:</span>
                    <div className="flex gap-1">
                      {Array.from(
                        new Set(structure.items.flatMap((i) => i.applicableGrades))
                      ).map((grade) => (
                        <Badge key={grade} variant="outline" className="text-xs">
                          {grade}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Structure Details */}
        {currentStructure && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chi tiết cơ cấu</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Khoản mục</TableHead>
                      <TableHead>Phương thức</TableHead>
                      <TableHead className="text-right">Giá trị</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentStructure.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.type === 'EARNING' ? (
                              <Plus className="h-4 w-4 text-success" />
                            ) : (
                              <Minus className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.method === 'FIXED'
                              ? 'Cố định'
                              : item.method === 'PERCENT_BASE'
                              ? '% Lương cơ bản'
                              : 'Công thức'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.method === 'FIXED'
                            ? formatCurrency(item.value)
                            : `${item.value}%`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Payslip Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Xem trước phiếu lương</CardTitle>
                  <Select value={previewEmployee} onValueChange={setPreviewEmployee}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockData.employees
                        .filter((e) => e.status !== 'Resigned')
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {payslip && currentEmployee && (
                  <div className="space-y-4">
                    <div className="pb-4 border-b">
                      <h4 className="font-semibold">
                        {currentEmployee.firstName} {currentEmployee.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">{currentEmployee.position}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Thu nhập</p>
                      <div className="flex justify-between text-sm">
                        <span>Lương cơ bản</span>
                        <span className="font-medium">{formatCurrency(payslip.baseSalary)}</span>
                      </div>
                      {payslip.earnings.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="font-medium text-success">
                            +{formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-sm font-semibold text-muted-foreground">Khấu trừ</p>
                      {payslip.deductions.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="font-medium text-destructive">
                            -{formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tổng thu nhập</span>
                        <span className="font-semibold text-success">
                          {formatCurrency(payslip.totalEarnings)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tổng khấu trừ</span>
                        <span className="font-semibold text-destructive">
                          {formatCurrency(payslip.totalDeductions)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Thực lĩnh</span>
                        <span className="text-primary">{formatCurrency(payslip.netSalary)}</span>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Xuất PDF
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

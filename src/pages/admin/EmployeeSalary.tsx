import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import mockData from '@/mock/data';
import { Plus, Minus, Trash2, DollarSign, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function EmployeeSalary() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState(mockData.employees[0].id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New custom item form state
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<'EARNING' | 'DEDUCTION'>('EARNING');
  const [itemMethod, setItemMethod] = useState<'FIXED' | 'PERCENT_BASE'>('FIXED');
  const [itemValue, setItemValue] = useState('');

  const currentEmployee = mockData.employees.find((e) => e.id === selectedEmployee);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Get default structure items for employee's grade
  const getDefaultStructureItems = () => {
    if (!currentEmployee) return [];
    
    const structures = mockData.salaryStructures.filter(s =>
      s.items.some(item => item.applicableGrades.includes(currentEmployee.grade))
    );
    
    const allItems = structures.flatMap(s => s.items);
    return allItems.filter(item => item.applicableGrades.includes(currentEmployee.grade));
  };

  const handleAddCustomItem = () => {
    if (!itemName || !itemValue) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    // In real app, this would save to database
    toast({
      title: 'Thành công',
      description: `Đã thêm khoản mục "${itemName}" cho ${currentEmployee?.firstName} ${currentEmployee?.lastName}`,
    });
    
    setIsDialogOpen(false);
    // Reset form
    setItemName('');
    setItemValue('');
  };

  const handleRemoveCustomItem = (itemId: string) => {
    // In real app, this would remove from database
    toast({
      title: 'Thành công',
      description: 'Đã xóa khoản mục tùy chỉnh',
    });
  };

  // Calculate total salary
  const calculateTotalSalary = () => {
    if (!currentEmployee) return null;

    const baseSalary = currentEmployee.salary.base;
    let totalEarnings = baseSalary;
    let totalDeductions = 0;

    // Calculate default structure items
    const structureItems = getDefaultStructureItems();
    
    structureItems.forEach(item => {
      let amount = 0;
      if (item.method === 'FIXED') {
        amount = item.value;
      } else if (item.method === 'PERCENT_BASE') {
        amount = (baseSalary * item.value) / 100;
      }
      
      if (item.type === 'EARNING') {
        totalEarnings += amount;
      } else {
        totalDeductions += amount;
      }
    });

    // Calculate custom items
    (currentEmployee.customSalaryItems || []).forEach(item => {
      let amount = 0;
      if (item.method === 'FIXED') {
        amount = item.value;
      } else if (item.method === 'PERCENT_BASE') {
        amount = (baseSalary * item.value) / 100;
      }
      
      if (item.type === 'EARNING') {
        totalEarnings += amount;
      } else {
        totalDeductions += amount;
      }
    });

    return {
      baseSalary,
      totalEarnings,
      totalDeductions,
      netSalary: totalEarnings - totalDeductions,
    };
  };

  const salaryInfo = calculateTotalSalary();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/salary')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Quản lý lương nhân viên</h1>
              <p className="text-muted-foreground">Tùy chỉnh lương riêng cho từng nhân viên</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Chọn nhân viên</CardTitle>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockData.employees
                    .filter((e) => e.status !== 'Resigned')
                    .map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.grade})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {currentEmployee && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Employee Info & Salary Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Thông tin lương
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 pb-4 border-b">
                  <h3 className="font-semibold text-lg">
                    {currentEmployee.firstName} {currentEmployee.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{currentEmployee.position}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{currentEmployee.grade}</Badge>
                    <Badge variant="outline">{currentEmployee.departmentId}</Badge>
                  </div>
                </div>

                {salaryInfo && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lương cơ bản</span>
                        <span className="font-medium">{formatCurrency(salaryInfo.baseSalary)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tổng thu nhập</span>
                        <span className="font-semibold text-success">
                          {formatCurrency(salaryInfo.totalEarnings)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tổng khấu trừ</span>
                        <span className="font-semibold text-destructive">
                          {formatCurrency(salaryInfo.totalDeductions)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Thực lĩnh</span>
                        <span className="text-primary">{formatCurrency(salaryInfo.netSalary)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Salary Structure */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Cơ cấu lương</CardTitle>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm khoản mục
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm khoản mục lương tùy chỉnh</DialogTitle>
                        <DialogDescription>
                          Thêm khoản mục lương riêng cho {currentEmployee.firstName} {currentEmployee.lastName}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="custom-item-name">Tên khoản mục</Label>
                          <Input
                            id="custom-item-name"
                            placeholder="VD: Thưởng dự án đặc biệt"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="custom-item-type">Loại</Label>
                          <Select value={itemType} onValueChange={(v) => setItemType(v as 'EARNING' | 'DEDUCTION')}>
                            <SelectTrigger id="custom-item-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EARNING">Thu nhập</SelectItem>
                              <SelectItem value="DEDUCTION">Khấu trừ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="custom-item-method">Phương thức tính</Label>
                          <Select value={itemMethod} onValueChange={(v) => setItemMethod(v as 'FIXED' | 'PERCENT_BASE')}>
                            <SelectTrigger id="custom-item-method">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FIXED">Cố định</SelectItem>
                              <SelectItem value="PERCENT_BASE">% Lương cơ bản</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="custom-item-value">
                            Giá trị {itemMethod === 'PERCENT_BASE' ? '(%)' : '(VND)'}
                          </Label>
                          <Input
                            id="custom-item-value"
                            type="number"
                            placeholder="0"
                            value={itemValue}
                            onChange={(e) => setItemValue(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Hủy
                          </Button>
                          <Button onClick={handleAddCustomItem}>
                            Thêm khoản mục
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Default Structure Items */}
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                      Cơ cấu lương mặc định (Cấp {currentEmployee.grade})
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Khoản mục</TableHead>
                          <TableHead>Phương thức</TableHead>
                          <TableHead className="text-right">Giá trị</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getDefaultStructureItems().map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {item.type === 'EARNING' ? (
                                  <Plus className="h-4 w-4 text-success" />
                                ) : (
                                  <Minus className="h-4 w-4 text-destructive" />
                                )}
                                <span className="text-sm">{item.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {item.method === 'FIXED' ? 'Cố định' : '% Lương cơ bản'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {item.method === 'FIXED'
                                ? formatCurrency(item.value)
                                : `${item.value}%`}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Custom Salary Items */}
                  {currentEmployee.customSalaryItems && currentEmployee.customSalaryItems.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                        Khoản mục tùy chỉnh
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Khoản mục</TableHead>
                            <TableHead>Phương thức</TableHead>
                            <TableHead className="text-right">Giá trị</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentEmployee.customSalaryItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {item.type === 'EARNING' ? (
                                    <Plus className="h-4 w-4 text-success" />
                                  ) : (
                                    <Minus className="h-4 w-4 text-destructive" />
                                  )}
                                  <span className="text-sm font-medium">{item.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {item.method === 'FIXED' ? 'Cố định' : '% Lương cơ bản'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-sm font-medium">
                                {item.method === 'FIXED'
                                  ? formatCurrency(item.value)
                                  : `${item.value}%`}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveCustomItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

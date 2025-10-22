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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import mockData from '@/mock/data';
import { DollarSign, Plus, Minus, FileText, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SalaryItem {
  id: string;
  name: string;
  type: 'EARNING' | 'DEDUCTION';
  method: 'FIXED' | 'PERCENT_BASE';
  value: number;
  applicableGrades: string[];
}

export default function Salary() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedStructure, setSelectedStructure] = useState(mockData.salaryStructures[0].id);
  const [previewEmployee, setPreviewEmployee] = useState(mockData.employees[0].id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New structure dialog state
  const [newStructureName, setNewStructureName] = useState('');
  const [salaryItems, setSalaryItems] = useState<SalaryItem[]>([]);
  
  // New item form state
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<'EARNING' | 'DEDUCTION'>('EARNING');
  const [itemMethod, setItemMethod] = useState<'FIXED' | 'PERCENT_BASE'>('FIXED');
  const [itemValue, setItemValue] = useState('');

  const currentStructure = mockData.salaryStructures.find((s) => s.id === selectedStructure);
  const currentEmployee = mockData.employees.find((e) => e.id === previewEmployee);

  // Calculate payslip
  const calculatePayslip = () => {
    if (!currentStructure || !currentEmployee) return null;

    const baseSalary = currentEmployee.salary.base;
    let totalEarnings = baseSalary;
    let totalDeductions = 0;

    // Get structure items for employee's grade
    const structureItems = currentStructure.items.filter(
      item => item.applicableGrades.includes(currentEmployee.grade)
    );

    const earnings = structureItems
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

    // Add custom salary items for employee
    const customEarnings = (currentEmployee.customSalaryItems || [])
      .filter((item) => item.type === 'EARNING')
      .map((item) => {
        let amount = 0;
        if (item.method === 'FIXED') {
          amount = item.value;
        } else if (item.method === 'PERCENT_BASE') {
          amount = (baseSalary * item.value) / 100;
        }
        totalEarnings += amount;
        return { ...item, amount, applicableGrades: [currentEmployee.grade] };
      });

    const deductions = structureItems
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

    // Add custom deductions
    const customDeductions = (currentEmployee.customSalaryItems || [])
      .filter((item) => item.type === 'DEDUCTION')
      .map((item) => {
        let amount = 0;
        if (item.method === 'FIXED') {
          amount = item.value;
        } else if (item.method === 'PERCENT_BASE') {
          amount = (baseSalary * item.value) / 100;
        }
        totalDeductions += amount;
        return { ...item, amount, applicableGrades: [currentEmployee.grade] };
      });

    return {
      baseSalary,
      earnings: [...earnings, ...customEarnings],
      deductions: [...deductions, ...customDeductions],
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

  const handleAddItem = () => {
    if (!itemName || !itemValue) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    const newItem: SalaryItem = {
      id: `item${Date.now()}`,
      name: itemName,
      type: itemType,
      method: itemMethod,
      value: parseFloat(itemValue),
      applicableGrades: ['G1', 'G2', 'G3'],
    };

    setSalaryItems([...salaryItems, newItem]);
    
    // Reset form
    setItemName('');
    setItemValue('');
    
    toast({
      title: 'Thành công',
      description: 'Đã thêm khoản mục vào cơ cấu lương',
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setSalaryItems(salaryItems.filter(item => item.id !== itemId));
  };

  const handleSaveStructure = () => {
    if (!newStructureName || salaryItems.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên cơ cấu và thêm ít nhất một khoản mục',
        variant: 'destructive',
      });
      return;
    }

    // In real app, this would save to database
    toast({
      title: 'Thành công',
      description: `Đã tạo cơ cấu lương "${newStructureName}"`,
    });
    
    setIsDialogOpen(false);
    // Reset form
    setNewStructureName('');
    setSalaryItems([]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cơ cấu lương</h1>
            <p className="text-muted-foreground">Quản lý và thiết kế bảng lương</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/employee-salary')}>
              <Users className="h-4 w-4 mr-2" />
              Quản lý lương nhân viên
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo cơ cấu mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo cơ cấu lương mới</DialogTitle>
                  <DialogDescription>
                    Tạo và quản lý các khoản mục lương cho từng cấp bậc
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="structure-name">Tên cơ cấu lương</Label>
                    <Input
                      id="structure-name"
                      placeholder="VD: Cơ cấu lương chung"
                      value={newStructureName}
                      onChange={(e) => setNewStructureName(e.target.value)}
                    />
                  </div>

                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">Thêm khoản mục lương</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-name">Tên khoản mục</Label>
                        <Input
                          id="item-name"
                          placeholder="VD: Phụ cấp ăn trưa"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="item-type">Loại</Label>
                        <Select value={itemType} onValueChange={(v) => setItemType(v as 'EARNING' | 'DEDUCTION')}>
                          <SelectTrigger id="item-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EARNING">Thu nhập</SelectItem>
                            <SelectItem value="DEDUCTION">Khấu trừ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="item-method">Phương thức tính</Label>
                        <Select value={itemMethod} onValueChange={(v) => setItemMethod(v as 'FIXED' | 'PERCENT_BASE')}>
                          <SelectTrigger id="item-method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FIXED">Cố định</SelectItem>
                            <SelectItem value="PERCENT_BASE">% Lương cơ bản</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="item-value">
                          Giá trị {itemMethod === 'PERCENT_BASE' ? '(%)' : '(VND)'}
                        </Label>
                        <Input
                          id="item-value"
                          type="number"
                          placeholder="0"
                          value={itemValue}
                          onChange={(e) => setItemValue(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Button onClick={handleAddItem} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm khoản mục
                    </Button>
                  </div>

                  {salaryItems.length > 0 && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold">Danh sách khoản mục ({salaryItems.length})</h3>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Khoản mục</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Phương thức</TableHead>
                            <TableHead className="text-right">Giá trị</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salaryItems.map((item) => (
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
                                <Badge variant={item.type === 'EARNING' ? 'default' : 'destructive'}>
                                  {item.type === 'EARNING' ? 'Thu nhập' : 'Khấu trừ'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {item.method === 'FIXED' ? 'Cố định' : '% Lương cơ bản'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {item.method === 'FIXED'
                                  ? formatCurrency(item.value)
                                  : `${item.value}%`}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
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

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleSaveStructure}>
                      Lưu cơ cấu lương
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="structures" className="space-y-6">
          <TabsList>
            <TabsTrigger value="structures">Cơ cấu hiện tại</TabsTrigger>
            <TabsTrigger value="by-grade">Theo cấp bậc</TabsTrigger>
          </TabsList>

          <TabsContent value="structures" className="space-y-6">
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
                          <Badge variant="outline" className="mt-2">{currentEmployee.grade}</Badge>
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
          </TabsContent>

          <TabsContent value="by-grade" className="space-y-6">
            <div className="grid gap-6">
              {['G1', 'G2', 'G3'].map((grade) => {
                const gradeStructures = mockData.salaryStructures.filter(s =>
                  s.items.some(item => item.applicableGrades.includes(grade))
                );
                const gradeEmployees = mockData.employees.filter(e => e.grade === grade && e.status !== 'Resigned');
                
                return (
                  <Card key={grade}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Cấp bậc {grade}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {gradeEmployees.length} nhân viên áp dụng
                          </p>
                        </div>
                        <Badge variant="outline" className="text-lg px-4 py-2">
                          {grade}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {gradeStructures.map((structure) => {
                        const gradeItems = structure.items.filter(item =>
                          item.applicableGrades.includes(grade)
                        );
                        
                        return (
                          <div key={structure.id} className="mb-6 last:mb-0">
                            <h4 className="font-semibold mb-3">{structure.name}</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Khoản mục</TableHead>
                                  <TableHead>Loại</TableHead>
                                  <TableHead>Phương thức</TableHead>
                                  <TableHead className="text-right">Giá trị</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {gradeItems.map((item) => (
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
                                      <Badge variant={item.type === 'EARNING' ? 'default' : 'destructive'}>
                                        {item.type === 'EARNING' ? 'Thu nhập' : 'Khấu trừ'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {item.method === 'FIXED' ? 'Cố định' : '% Lương cơ bản'}
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
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

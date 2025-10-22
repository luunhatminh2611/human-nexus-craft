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
import { Plus, Minus, Trash2, DollarSign, ArrowLeft, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function EmployeeSalary() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState(mockData.employees[0].id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isItemListOpen, setIsItemListOpen] = useState(false);
  
  // Selected item from list
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  const currentEmployee = mockData.employees.find((e) => e.id === selectedEmployee);

  // Get all available salary items from structures
  const getAllAvailableItems = () => {
    const allItems = mockData.salaryStructures.flatMap(s => s.items);
    // Remove duplicates by id
    return allItems.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
    );
  };

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

  const handleAddItemFromList = () => {
    if (!selectedItemId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn khoản mục',
        variant: 'destructive',
      });
      return;
    }

    const selectedItem = getAllAvailableItems().find(item => item.id === selectedItemId);
    if (!selectedItem) return;

    // Check if item already exists in custom items
    if (currentEmployee?.customSalaryItems?.some(item => item.id === selectedItemId)) {
      toast({
        title: 'Lỗi',
        description: 'Khoản mục này đã tồn tại',
        variant: 'destructive',
      });
      return;
    }

    // In real app, this would save to database
    toast({
      title: 'Thành công',
      description: `Đã thêm khoản mục "${selectedItem.name}" cho ${currentEmployee?.firstName} ${currentEmployee?.lastName}`,
    });
    
    setIsDialogOpen(false);
    setSelectedItemId('');
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
          <div className="grid lg:grid-cols-3 gap-6">
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

            {/* Available Salary Items List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" />
                  Danh sách khoản mục
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {getAllAvailableItems().map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          {item.type === 'EARNING' ? (
                            <Plus className="h-4 w-4 text-success mt-0.5" />
                          ) : (
                            <Minus className="h-4 w-4 text-destructive mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant={item.type === 'EARNING' ? 'default' : 'destructive'} className="text-xs">
                                {item.type === 'EARNING' ? 'Thu nhập' : 'Khấu trừ'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.method === 'FIXED' ? 'Cố định' : '% Lương cơ bản'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.method === 'FIXED'
                                ? formatCurrency(item.value)
                                : `${item.value}%`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Thêm khoản mục lương</DialogTitle>
                        <DialogDescription>
                          Chọn khoản mục từ danh sách để thêm cho {currentEmployee.firstName} {currentEmployee.lastName}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="item-select">Chọn khoản mục</Label>
                          <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                            <SelectTrigger id="item-select">
                              <SelectValue placeholder="Chọn khoản mục từ danh sách..." />
                            </SelectTrigger>
                            <SelectContent>
                              {getAllAvailableItems().map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  <div className="flex items-center gap-2">
                                    {item.type === 'EARNING' ? (
                                      <Plus className="h-3 w-3 text-success" />
                                    ) : (
                                      <Minus className="h-3 w-3 text-destructive" />
                                    )}
                                    <span>{item.name}</span>
                                    <span className="text-muted-foreground text-xs">
                                      ({item.method === 'FIXED' ? formatCurrency(item.value) : `${item.value}%`})
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedItemId && (
                          <div className="p-4 border rounded-lg bg-muted/50">
                            {(() => {
                              const item = getAllAvailableItems().find(i => i.id === selectedItemId);
                              if (!item) return null;
                              return (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    {item.type === 'EARNING' ? (
                                      <Plus className="h-4 w-4 text-success" />
                                    ) : (
                                      <Minus className="h-4 w-4 text-destructive" />
                                    )}
                                    <h4 className="font-semibold">{item.name}</h4>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Loại:</span>{' '}
                                      <Badge variant={item.type === 'EARNING' ? 'default' : 'destructive'} className="text-xs">
                                        {item.type === 'EARNING' ? 'Thu nhập' : 'Khấu trừ'}
                                      </Badge>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Phương thức:</span>{' '}
                                      <Badge variant="outline" className="text-xs">
                                        {item.method === 'FIXED' ? 'Cố định' : '% Lương cơ bản'}
                                      </Badge>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">Giá trị:</span>{' '}
                                      <span className="font-medium">
                                        {item.method === 'FIXED' ? formatCurrency(item.value) : `${item.value}%`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => {
                            setIsDialogOpen(false);
                            setSelectedItemId('');
                          }}>
                            Hủy
                          </Button>
                          <Button onClick={handleAddItemFromList}>
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

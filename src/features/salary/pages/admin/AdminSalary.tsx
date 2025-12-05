import { useState } from 'react';
import { Layout } from '@/shared/components/layouts/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Button from '@/shared/components/ui/button/Button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import mockData, { Grade } from '@/mock/data';
import { DollarSign, Plus, Minus, FileText, Trash2, Edit, Upload, Download, TrendingUp, List, Layers } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import EmployeeSalary from '../admin/AdminEmployeeSalary';

interface SalaryItem {
  id: string;
  name: string;
  type: 'EARNING' | 'DEDUCTION';
  method: 'FIXED' | 'PERCENT_BASE' | 'FORMULA';
  value: number;
  applicableGrades: string[];
}

export default function AdminSalary() {
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
  const [itemMethod, setItemMethod] = useState<'FIXED' | 'PERCENT_BASE' | 'FORMULA'>('FIXED');
  const [itemValue, setItemValue] = useState('');

  // Salary Items Management
  const [salaryItemsTab, setSalaryItemsTab] = useState<SalaryItem[]>(
    mockData.salaryStructures[0].items.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      method: item.method as 'FIXED' | 'PERCENT_BASE' | 'FORMULA',
      value: item.value,
      applicableGrades: item.applicableGrades
    }))
  );
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SalaryItem | null>(null);

  // Grades Management
  const [grades, setGrades] = useState<Grade[]>(mockData.grades);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [gradeForm, setGradeForm] = useState({
    name: '',
    description: '',
    competencies: '',
    requiredSkills: '',
    requiredTrainings: '',
    order: '',
  });

  const currentStructure = mockData.salaryStructures.find((s) => s.id === selectedStructure);
  const currentEmployee = mockData.employees.find((e) => e.id === previewEmployee);

  // Calculate payslip
  const calculatePayslip = () => {
    if (!currentStructure || !currentEmployee) return null;

    const baseSalary = currentEmployee.salary.base;
    let totalEarnings = baseSalary;
    let totalDeductions = 0;

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

    toast({
      title: 'Thành công',
      description: `Đã tạo cơ cấu lương "${newStructureName}"`,
    });
    
    setIsDialogOpen(false);
    setNewStructureName('');
    setSalaryItems([]);
  };

  // Salary Items Tab Handlers
  const openAddSalaryItem = () => {
    setEditingItem(null);
    setItemName('');
    setItemType('EARNING');
    setItemMethod('FIXED');
    setItemValue('');
    setIsItemDialogOpen(true);
  };

  const openEditSalaryItem = (item: SalaryItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemType(item.type);
    setItemMethod(item.method);
    setItemValue(item.value.toString());
    setIsItemDialogOpen(true);
  };

  const saveSalaryItem = () => {
    if (!itemName || !itemValue) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    const itemData: SalaryItem = {
      id: editingItem?.id || `item${Date.now()}`,
      name: itemName,
      type: itemType,
      method: itemMethod,
      value: parseFloat(itemValue),
      applicableGrades: editingItem?.applicableGrades || ['G1', 'G2', 'G3'],
    };

    if (editingItem) {
      setSalaryItemsTab(prev => prev.map(item => item.id === editingItem.id ? itemData : item));
      toast({ title: 'Thành công', description: 'Đã cập nhật khoản mục' });
    } else {
      setSalaryItemsTab(prev => [...prev, itemData]);
      toast({ title: 'Thành công', description: 'Đã thêm khoản mục mới' });
    }

    setIsItemDialogOpen(false);
  };

  const deleteSalaryItem = (id: string) => {
    setSalaryItemsTab(prev => prev.filter(item => item.id !== id));
    toast({ title: 'Đã xóa', description: 'Xóa khoản mục thành công' });
  };

  // Grades Tab Handlers
  const openAddGrade = () => {
    setEditingGrade(null);
    setGradeForm({
      name: '',
      description: '',
      competencies: '',
      requiredSkills: '',
      requiredTrainings: '',
      order: '',
    });
    setIsGradeDialogOpen(true);
  };

  const openEditGrade = (g: Grade) => {
    setEditingGrade(g);
    setGradeForm({
      name: g.name,
      description: g.description,
      competencies: g.competencies.join(', '),
      requiredSkills: g.requiredSkills.join(', '),
      requiredTrainings: g.requiredTrainings.join(', '),
      order: g.order.toString(),
    });
    setIsGradeDialogOpen(true);
  };

  const saveGrade = () => {
    if (!gradeForm.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên bậc', variant: 'destructive' });
      return;
    }

    const gradeData = {
      name: gradeForm.name,
      description: gradeForm.description,
      competencies: gradeForm.competencies.split(',').map(c => c.trim()).filter(Boolean),
      requiredSkills: gradeForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      requiredTrainings: gradeForm.requiredTrainings.split(',').map(t => t.trim()).filter(Boolean),
      order: parseInt(gradeForm.order) || 1,
    };

    if (editingGrade) {
      setGrades(prev => prev.map(g => 
        g.id === editingGrade.id 
          ? { ...g, ...gradeData }
          : g
      ));
      toast({ title: 'Thành công', description: 'Đã cập nhật bậc' });
    } else {
      const newGrade: Grade = {
        id: `g${Date.now()}`,
        ...gradeData,
      };
      setGrades(prev => [...prev, newGrade]);
      toast({ title: 'Thành công', description: 'Đã thêm bậc mới' });
    }
    setIsGradeDialogOpen(false);
  };

  const deleteGrade = (id: string) => {
    setGrades(prev => prev.filter(g => g.id !== id));
    toast({ title: 'Đã xóa', description: 'Xóa bậc thành công' });
  };

  const handleImport = () => {
    toast({ title: 'Import', description: 'Chức năng import Excel đang được phát triển' });
  };

  const handleExport = () => {
    toast({ title: 'Export', description: 'Chức năng export Excel đang được phát triển' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý lương</h1>
          <p className="text-muted-foreground">Quản lý cơ cấu lương, khoản mục và bậc lương</p>
        </div>
      </div>

      <Tabs defaultValue="structures" className="space-y-6">
        <TabsList>
          <TabsTrigger value="structures" className="gap-2">
            <Layers className="h-4 w-4" />
            Danh sách cơ cấu lương
          </TabsTrigger>
          <TabsTrigger value="items" className="gap-2">
            <List className="h-4 w-4" />
            Khoản mục
          </TabsTrigger>
          <TabsTrigger value="grades" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Bậc lương
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Danh sách cơ cấu lương */}
        <TabsContent value="structures" className="space-y-6">
          <EmployeeSalary />
        </TabsContent>

        {/* Tab 2: Khoản mục */}
        <TabsContent value="items" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
            <Button onClick={openAddSalaryItem}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm khoản mục
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên khoản mục</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Phương thức tính</TableHead>
                    <TableHead className="text-right">Giá trị</TableHead>
                    <TableHead>Áp dụng bậc</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryItemsTab.map((item) => (
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
                          {item.method === 'FIXED' ? 'Cố định' : item.method === 'PERCENT_BASE' ? '% Lương cơ bản' : 'Công thức'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.method === 'FIXED'
                          ? formatCurrency(item.value)
                          : `${item.value}%`}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {item.applicableGrades.map((grade) => (
                            <Badge key={grade} variant="secondary" className="text-xs">
                              {grade}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditSalaryItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSalaryItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Bậc lương */}
        <TabsContent value="grades" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
            <Button onClick={openAddGrade}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm bậc
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên bậc</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Năng lực</TableHead>
                    <TableHead>Kỹ năng yêu cầu</TableHead>
                    <TableHead>Thứ tự</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.sort((a, b) => a.order - b.order).map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-semibold">{grade.name}</TableCell>
                      <TableCell className="text-muted-foreground">{grade.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {grade.competencies.slice(0, 2).map((c, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                          {grade.competencies.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{grade.competencies.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {grade.requiredSkills.slice(0, 2).map((s, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                          {grade.requiredSkills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{grade.requiredSkills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{grade.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditGrade(grade)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteGrade(grade.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Salary Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Chỉnh sửa' : 'Thêm'} khoản mục</DialogTitle>
            <DialogDescription>
              Nhập thông tin khoản mục lương
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên khoản mục *</Label>
              <Input
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                placeholder="VD: Phụ cấp ăn trưa"
              />
            </div>
            <div>
              <Label>Loại *</Label>
              <Select value={itemType} onValueChange={(v) => setItemType(v as 'EARNING' | 'DEDUCTION')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EARNING">Thu nhập</SelectItem>
                  <SelectItem value="DEDUCTION">Khấu trừ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phương thức tính *</Label>
              <Select value={itemMethod} onValueChange={(v) => setItemMethod(v as 'FIXED' | 'PERCENT_BASE' | 'FORMULA')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Cố định</SelectItem>
                  <SelectItem value="PERCENT_BASE">% Lương cơ bản</SelectItem>
                  <SelectItem value="FORMULA">Công thức</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Giá trị *</Label>
              <Input
                type="number"
                value={itemValue}
                onChange={e => setItemValue(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={saveSalaryItem}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGrade ? 'Chỉnh sửa' : 'Thêm'} bậc lương</DialogTitle>
            <DialogDescription>
              Nhập thông tin bậc lương
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên bậc *</Label>
              <Input
                value={gradeForm.name}
                onChange={e => setGradeForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: G1 - Junior"
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={gradeForm.description}
                onChange={e => setGradeForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả về bậc này"
                rows={2}
              />
            </div>
            <div>
              <Label>Năng lực (phân cách bởi dấu phẩy)</Label>
              <Textarea
                value={gradeForm.competencies}
                onChange={e => setGradeForm(f => ({ ...f, competencies: e.target.value }))}
                placeholder="VD: Hiểu biết cơ bản, Làm việc nhóm, Ham học hỏi"
                rows={3}
              />
            </div>
            <div>
              <Label>Kỹ năng yêu cầu (phân cách bởi dấu phẩy)</Label>
              <Textarea
                value={gradeForm.requiredSkills}
                onChange={e => setGradeForm(f => ({ ...f, requiredSkills: e.target.value }))}
                placeholder="VD: JavaScript, React, Git"
                rows={2}
              />
            </div>
            <div>
              <Label>Mã các khóa đào tạo yêu cầu (phân cách bởi dấu phẩy)</Label>
              <Input
                value={gradeForm.requiredTrainings}
                onChange={e => setGradeForm(f => ({ ...f, requiredTrainings: e.target.value }))}
                placeholder="VD: tr001, tr004"
              />
            </div>
            <div>
              <Label>Thứ tự hiển thị</Label>
              <Input
                type="number"
                value={gradeForm.order}
                onChange={e => setGradeForm(f => ({ ...f, order: e.target.value }))}
                placeholder="1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={saveGrade}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

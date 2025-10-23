import { useState, useCallback } from 'react';
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
} from '@/components/ui/dialog';
import mockData from '@/mock/data';
import { Plus, Minus, Trash2, DollarSign, List, Grip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface SalaryItem {
  id: string;
  name: string;
  type: 'EARNING' | 'DEDUCTION';
  method: 'FIXED' | 'PERCENT_BASE' | 'FORMULA';
  value: number;
}

interface GradeSalaryStructure {
  gradeId: string;
  items: SalaryItem[];
}

// Draggable Salary Item Component
function DraggableSalaryItem({ item }: { item: SalaryItem }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SALARY_ITEM',
    item: item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <Grip className="h-4 w-4 text-muted-foreground mt-0.5" />
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
  );
}

// Drop Zone for Salary Structure
function SalaryStructureDropZone({
  items,
  onDrop,
  onRemove,
}: {
  items: SalaryItem[];
  onDrop: (item: SalaryItem) => void;
  onRemove: (itemId: string) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'SALARY_ITEM',
    drop: (item: SalaryItem) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div
      ref={drop}
      className={`min-h-[400px] border-2 border-dashed rounded-lg p-4 transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-muted'
      }`}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <List className="h-12 w-12 mb-2" />
          <p className="text-sm">Kéo thả khoản mục vào đây</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khoản mục</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead className="text-right">Giá trị</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
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
                    {item.method === 'FIXED' ? 'Cố định' : '% Lương cơ bản'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.method === 'FIXED'
                    ? formatCurrency(item.value)
                    : `${item.value}%`}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function EmployeeSalaryContent() {
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'EARNING' | 'DEDUCTION'>('EARNING');
  const [newItemMethod, setNewItemMethod] = useState<'FIXED' | 'PERCENT_BASE' | 'FORMULA'>('FIXED');
  const [newItemValue, setNewItemValue] = useState('');

  // Initialize with existing structures from mock data
  const [gradeStructures, setGradeStructures] = useState<GradeSalaryStructure[]>(() => {
    const allGrades = mockData.grades;
    return allGrades.map((grade) => {
      const existingStructure = mockData.salaryStructures.find(
        (s) => s.name.includes(grade.id)
      );
      return {
        gradeId: grade.id,
        items: existingStructure?.items.filter(i => i.applicableGrades.includes(grade.id)) || [],
      };
    });
  });

  const [availableItems, setAvailableItems] = useState<SalaryItem[]>(() => {
    const allItems = mockData.salaryStructures.flatMap((s) => s.items);
    const uniqueItems = allItems.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );
    return uniqueItems;
  });

  const currentGrade = mockData.grades.find((g) => g.id === selectedGrade);
  const currentStructure = gradeStructures.find((s) => s.gradeId === selectedGrade);

  const handleCreateItem = useCallback(() => {
    if (!newItemName.trim() || !newItemValue) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    const newItem: SalaryItem = {
      id: `item${Date.now()}`,
      name: newItemName.trim(),
      type: newItemType,
      method: newItemMethod,
      value: parseFloat(newItemValue),
    };

    setAvailableItems((prev) => [...prev, newItem]);
    setNewItemName('');
    setNewItemValue('');
    setIsCreateDialogOpen(false);

    toast({
      title: 'Thành công',
      description: 'Đã tạo khoản mục mới',
    });
  }, [newItemName, newItemType, newItemMethod, newItemValue, toast]);

  const handleDropItem = useCallback(
    (item: SalaryItem) => {
      if (!selectedGrade) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng chọn bậc trước',
          variant: 'destructive',
        });
        return;
      }

      setGradeStructures((prev) =>
        prev.map((structure) => {
          if (structure.gradeId === selectedGrade) {
            // Check if item already exists
            if (structure.items.some((i) => i.id === item.id)) {
              toast({
                title: 'Thông báo',
                description: 'Khoản mục này đã tồn tại trong cơ cấu',
              });
              return structure;
            }
            return {
              ...structure,
              items: [...structure.items, item],
            };
          }
          return structure;
        })
      );

      toast({
        title: 'Thành công',
        description: `Đã thêm "${item.name}" vào cơ cấu lương ${selectedGrade}`,
      });
    },
    [selectedGrade, toast]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      setGradeStructures((prev) =>
        prev.map((structure) => {
          if (structure.gradeId === selectedGrade) {
            return {
              ...structure,
              items: structure.items.filter((i) => i.id !== itemId),
            };
          }
          return structure;
        })
      );

      toast({
        title: 'Thành công',
        description: 'Đã xóa khoản mục khỏi cơ cấu lương',
      });
    },
    [selectedGrade, toast]
  );

  const calculateSummary = () => {
    if (!currentStructure) return null;

    const baseSalary = 0;
    let totalEarnings = 0;
    let totalDeductions = 0;

    currentStructure.items.forEach((item) => {
      let amount = 0;
      if (item.method === 'FIXED') {
        amount = item.value;
      } else {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const summary = calculateSummary();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cơ cấu lương theo bậc</h1>
            <p className="text-muted-foreground">
              Tạo cấu trúc lương mặc định cho từng bậc
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo khoản mục mới
          </Button>
        </div>

        {/* Grade Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Chọn bậc</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn bậc để cấu hình lương..." />
              </SelectTrigger>
              <SelectContent>
                {mockData.grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedGrade && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Salary Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Tổng quan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 pb-4 border-b">
                  <h3 className="font-semibold text-lg">{currentGrade?.name}</h3>
                </div>

                {summary && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Lương cơ bản (min)</span>
                        <span className="font-medium">{formatCurrency(summary.baseSalary)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tổng thu nhập</span>
                        <span className="font-semibold text-success">
                          {formatCurrency(summary.totalEarnings)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tổng khấu trừ</span>
                        <span className="font-semibold text-destructive">
                          {formatCurrency(summary.totalDeductions)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Thực lĩnh (ước tính)</span>
                        <span className="text-primary">{formatCurrency(summary.netSalary)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        * Dựa trên lương cơ bản tối thiểu
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Salary Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" />
                  Danh sách khoản mục
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {availableItems.map((item) => (
                    <DraggableSalaryItem key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Salary Structure Drop Zone */}
            <Card>
              <CardHeader>
                <CardTitle>Cơ cấu lương {selectedGrade}</CardTitle>
              </CardHeader>
              <CardContent>
                {currentStructure && (
                  <SalaryStructureDropZone
                    items={currentStructure.items}
                    onDrop={handleDropItem}
                    onRemove={handleRemoveItem}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Item Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo khoản mục mới</DialogTitle>
              <DialogDescription>
                Tạo khoản mục lương mới để thêm vào cơ cấu
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="item-name">Tên khoản mục</Label>
                <Input
                  id="item-name"
                  placeholder="VD: Phụ cấp ăn trưa"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-type">Loại</Label>
                  <Select value={newItemType} onValueChange={(v: any) => setNewItemType(v)}>
                    <SelectTrigger id="item-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EARNING">Thu nhập</SelectItem>
                      <SelectItem value="DEDUCTION">Khấu trừ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="item-method">Phương thức</Label>
                  <Select value={newItemMethod} onValueChange={(v: any) => setNewItemMethod(v)}>
                    <SelectTrigger id="item-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED">Cố định</SelectItem>
                      <SelectItem value="PERCENT_BASE">% Lương cơ bản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="item-value">
                  Giá trị {newItemMethod === 'FIXED' ? '(VNĐ)' : '(%)'}
                </Label>
                <Input
                  id="item-value"
                  type="number"
                  placeholder={newItemMethod === 'FIXED' ? '1000000' : '10'}
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewItemName('');
                    setNewItemValue('');
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreateItem}>Tạo khoản mục</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default function EmployeeSalary() {
  return (
    <DndProvider backend={HTML5Backend}>
      <EmployeeSalaryContent />
    </DndProvider>
  );
}

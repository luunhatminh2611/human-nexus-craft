import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useDrag, useDrop } from 'react-dnd';
import { Plus, Minus, Trash2, List, Grip, DollarSign } from 'lucide-react';
import mockData from '@/mock/data';

interface SalaryItem {
  id: string;
  name: string;
  type: 'EARNING' | 'DEDUCTION';
  method: 'FIXED' | 'PERCENT_BASE' | 'FORMULA';
  value: number;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  salary: {
    base: number;
    allowances?: { [key: string]: number };
    currency: string;
  };
  customSalaryItems?: SalaryItem[];
}

// Draggable Salary Item Component
function DraggableSalaryItem({ item }: { item: SalaryItem }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SALARY_ITEM_EMPLOYEE',
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
                {item.method === 'FIXED' ? 'Cố định' : item.method === 'PERCENT_BASE' ? '% Lương cơ bản' : 'Công thức'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.method === 'FIXED'
                ? formatCurrency(item.value)
                : item.method === 'PERCENT_BASE'
                ? `${item.value}%`
                : 'Công thức'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Drop Zone for Custom Salary Items
function CustomSalaryDropZone({
  items,
  onDrop,
  onRemove,
}: {
  items: SalaryItem[];
  onDrop: (item: SalaryItem) => void;
  onRemove: (itemId: string) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'SALARY_ITEM_EMPLOYEE',
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
      className={`min-h-[200px] border-2 border-dashed rounded-lg p-4 transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-muted'
      }`}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <List className="h-8 w-8 mb-2" />
          <p className="text-sm">Kéo thả khoản mục bổ sung vào đây</p>
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
                    {item.method === 'FIXED' ? 'Cố định' : item.method === 'PERCENT_BASE' ? '% Lương cơ bản' : 'Công thức'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.method === 'FIXED'
                    ? formatCurrency(item.value)
                    : item.method === 'PERCENT_BASE'
                    ? `${item.value}%`
                    : 'Công thức'}
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

export function SalaryTabWithDragDrop({ employee }: { employee: Employee }) {
  const { toast } = useToast();
  const [customItems, setCustomItems] = useState<SalaryItem[]>(
    employee.customSalaryItems || []
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Get default structure items for employee's grade
  const getDefaultStructureItems = useCallback(() => {
    const structures = mockData.salaryStructures.filter((s) =>
      s.items.some((item) => item.applicableGrades.includes(employee.grade))
    );

    const allItems = structures.flatMap((s) => s.items);
    return allItems.filter((item) => item.applicableGrades.includes(employee.grade));
  }, [employee.grade]);

  // Get all available items
  const getAllAvailableItems = useCallback(() => {
    const allItems = mockData.salaryStructures.flatMap((s) => s.items);
    // Remove duplicates by id
    return allItems.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    );
  }, []);

  const handleDropItem = useCallback(
    (item: SalaryItem) => {
      // Check if item already exists in custom items
      if (customItems.some((i) => i.id === item.id)) {
        toast({
          title: 'Thông báo',
          description: 'Khoản mục này đã tồn tại',
        });
        return;
      }

      // Check if item already in default structure
      const defaultItems = getDefaultStructureItems();
      if (defaultItems.some((i) => i.id === item.id)) {
        toast({
          title: 'Thông báo',
          description: 'Khoản mục này đã có trong cơ cấu mặc định',
        });
        return;
      }

      setCustomItems((prev) => [...prev, item]);
      toast({
        title: 'Thành công',
        description: `Đã thêm khoản mục "${item.name}"`,
      });
    },
    [customItems, getDefaultStructureItems, toast]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      setCustomItems((prev) => prev.filter((i) => i.id !== itemId));
      toast({
        title: 'Thành công',
        description: 'Đã xóa khoản mục',
      });
    },
    [toast]
  );

  // Calculate total salary
  const calculateTotalSalary = useCallback(() => {
    const baseSalary = employee.salary.base;
    let totalEarnings = baseSalary;
    let totalDeductions = 0;

    // Calculate default structure items
    const structureItems = getDefaultStructureItems();

    structureItems.forEach((item) => {
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
    customItems.forEach((item) => {
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
  }, [employee.salary.base, getDefaultStructureItems, customItems]);

  const defaultItems = getDefaultStructureItems();
  const availableItems = getAllAvailableItems();
  const salaryInfo = calculateTotalSalary();

  return (
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
            <h3 className="font-semibold text-lg">
              {employee.firstName} {employee.lastName}
            </h3>
            <Badge variant="outline">{employee.grade}</Badge>
          </div>

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

      {/* Salary Structure */}
      <div className="space-y-6">
        {/* Default Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Cơ cấu lương mặc định ({employee.grade})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khoản mục</TableHead>
                  <TableHead className="text-right">Giá trị</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaultItems.map((item) => (
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
                    <TableCell className="text-right text-sm">
                      {item.method === 'FIXED'
                        ? formatCurrency(item.value)
                        : item.method === 'PERCENT_BASE'
                        ? `${item.value}%`
                        : 'Công thức'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Custom Items Drop Zone */}
        <Card>
          <CardHeader>
            <CardTitle>Khoản mục bổ sung</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomSalaryDropZone
              items={customItems}
              onDrop={handleDropItem}
              onRemove={handleRemoveItem}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

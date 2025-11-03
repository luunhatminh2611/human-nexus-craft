import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, Check, X } from 'lucide-react';
import mockData from '@/mock/data';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function SafetyEquipmentRegister() {
  const { employeeId } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [items, setItems] = useState<Array<{ itemId: string; itemName: string; quantity: number }>>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  const currentUser = mockData.employees.find(e => e.id === employeeId);
  const department = mockData.departments.find(d => d.id === currentUser?.departmentId);
  
  // Lấy kế hoạch của phòng ban
  const myPlans = (mockData.safetyEquipmentPlans || []).filter(
    p => p.departmentId === currentUser?.departmentId
  );

  // Lấy phân phát của phòng ban
  const myDistributions = (mockData.safetyDistributions || []).filter(
    d => d.departmentId === currentUser?.departmentId
  );

  const availableItems = mockData.safetyItems || [];

  const handleAddItem = () => {
    if (!selectedItemId || itemQuantity <= 0) {
      toast.error('Vui lòng chọn vật tư và nhập số lượng');
      return;
    }
    
    const item = availableItems.find(i => i.id === selectedItemId);
    if (!item) return;

    const existing = items.find(i => i.itemId === selectedItemId);
    if (existing) {
      setItems(items.map(i => 
        i.itemId === selectedItemId 
          ? { ...i, quantity: i.quantity + itemQuantity }
          : i
      ));
    } else {
      setItems([...items, { 
        itemId: selectedItemId, 
        itemName: item.name, 
        quantity: itemQuantity 
      }]);
    }
    
    setSelectedItemId('');
    setItemQuantity(1);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(i => i.itemId !== itemId));
  };

  const handleSubmitPlan = () => {
    if (items.length === 0) {
      toast.error('Vui lòng thêm ít nhất một vật tư');
      return;
    }

    const newPlan = {
      id: `plan${Date.now()}`,
      year: selectedYear,
      departmentId: currentUser?.departmentId || '',
      departmentName: department?.name || '',
      createdBy: employeeId || '',
      createdByName: `${currentUser?.firstName} ${currentUser?.lastName}`,
      items: items.map(item => ({
        safetyItemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        status: 'Pending' as const,
      })),
      status: 'Pending' as const,
      createdAt: new Date().toISOString(),
    };

    if (!mockData.safetyEquipmentPlans) mockData.safetyEquipmentPlans = [];
    mockData.safetyEquipmentPlans.push(newPlan);
    
    toast.success('Đã gửi kế hoạch đăng ký');
    setIsDialogOpen(false);
    setItems([]);
  };

  const handleMarkReceived = (distId: string) => {
    const dist = myDistributions.find(d => d.id === distId);
    if (dist) {
      dist.status = 'Received';
      dist.receivedBy = employeeId || '';
      dist.receivedDate = new Date().toISOString().split('T')[0];
      toast.success('Đã xác nhận nhận hàng');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Pending': 'secondary',
      'Approved': 'default',
      'Rejected': 'destructive',
      'Distributed': 'secondary',
      'Received': 'default',
    };
    const labels: Record<string, string> = {
      'Pending': 'Chờ duyệt',
      'Approved': 'Đã duyệt',
      'Rejected': 'Từ chối',
      'Distributed': 'Đã phát',
      'Received': 'Đã nhận',
    };
    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Đăng ký bảo hộ lao động</h1>
            <p className="text-muted-foreground">Tạo kế hoạch và theo dõi phân phát vật tư BHLĐ</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo kế hoạch mới
          </Button>
        </div>

        {/* My Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Kế hoạch của phòng ban
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myPlans.length > 0 ? (
              <div className="space-y-4">
                {myPlans.map((plan) => (
                  <Card key={plan.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">Kế hoạch năm {plan.year}</h3>
                          <p className="text-sm text-muted-foreground">
                            Tạo: {new Date(plan.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        {getStatusBadge(plan.status)}
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vật tư</TableHead>
                            <TableHead>Số lượng</TableHead>
                            <TableHead>Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plan.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {plan.approvedDate && (
                        <p className="text-sm text-success">
                          Đã duyệt: {new Date(plan.approvedDate).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                      {plan.rejectedReason && (
                        <p className="text-sm text-destructive">
                          Lý do từ chối: {plan.rejectedReason}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Chưa có kế hoạch nào
              </p>
            )}
          </CardContent>
        </Card>

        {/* Distributions */}
        <Card>
          <CardHeader>
            <CardTitle>Phân phát vật tư</CardTitle>
          </CardHeader>
          <CardContent>
            {myDistributions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vật tư</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Ngày phát</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myDistributions.map((dist) => (
                    <TableRow key={dist.id}>
                      <TableCell>{dist.itemName}</TableCell>
                      <TableCell>{dist.quantityDistributed}</TableCell>
                      <TableCell>
                        {new Date(dist.distributedDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>{getStatusBadge(dist.status)}</TableCell>
                      <TableCell>
                        {dist.status === 'Distributed' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleMarkReceived(dist.id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Đã nhận
                          </Button>
                        )}
                        {dist.status === 'Received' && dist.receivedDate && (
                          <span className="text-sm text-muted-foreground">
                            Nhận: {new Date(dist.receivedDate).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Chưa có phân phát nào
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo kế hoạch đăng ký BHLĐ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Năm</Label>
                <Input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                />
              </div>

              <div className="grid gap-2">
                <Label>Thêm vật tư</Label>
                <div className="flex gap-2">
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Chọn vật tư" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="SL"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Number(e.target.value))}
                    className="w-24"
                  />
                  <Button onClick={handleAddItem} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {items.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vật tư</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.itemId}>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.itemId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmitPlan}>
                Gửi kế hoạch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X, FileText, Package } from 'lucide-react';
import mockData from '@/mock/data';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function SafetyEquipmentPlan() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const plans = mockData.safetyEquipmentPlans || [];
  const pendingPlans = plans.filter(p => p.status === 'Pending');
  const approvedPlans = plans.filter(p => p.status === 'Approved');

  const handleApprove = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      plan.status = 'Approved';
      plan.approvedBy = 'emp001';
      plan.approvedDate = new Date().toISOString().split('T')[0];
      plan.items.forEach(item => {
        item.status = 'Approved';
        item.approvedBy = 'emp001';
        item.approvedDate = new Date().toISOString().split('T')[0];
      });
      toast.success('Đã phê duyệt kế hoạch');
      setSelectedPlan(null);
    }
  };

  const handleReject = (planId: string) => {
    if (!comment.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      plan.status = 'Rejected';
      plan.rejectedReason = comment;
      toast.success('Đã từ chối kế hoạch');
      setSelectedPlan(null);
      setComment('');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Pending': 'secondary',
      'Approved': 'default',
      'Rejected': 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{
      status === 'Pending' ? 'Chờ duyệt' : 
      status === 'Approved' ? 'Đã duyệt' : 'Từ chối'
    }</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kế hoạch bảo hộ lao động</h1>
          <p className="text-muted-foreground">Phê duyệt kế hoạch đăng ký bảo hộ lao động theo năm</p>
        </div>

        {/* Pending Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kế hoạch chờ duyệt ({pendingPlans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPlans.length > 0 ? (
              <div className="space-y-4">
                {pendingPlans.map((plan) => (
                  <Card key={plan.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            Kế hoạch năm {plan.year} - {plan.departmentName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Người tạo: {plan.createdByName} • {new Date(plan.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        {getStatusBadge(plan.status)}
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vật tư</TableHead>
                            <TableHead>Số lượng</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plan.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={() => setSelectedPlan(plan.id)} size="sm">
                          <Check className="h-4 w-4 mr-2" />
                          Phê duyệt
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => setSelectedPlan(plan.id)} 
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Không có kế hoạch chờ duyệt
              </p>
            )}
          </CardContent>
        </Card>

        {/* Approved Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Kế hoạch đã duyệt ({approvedPlans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvedPlans.length > 0 ? (
              <div className="space-y-4">
                {approvedPlans.map((plan) => (
                  <Card key={plan.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            Kế hoạch năm {plan.year} - {plan.departmentName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Người tạo: {plan.createdByName} • {new Date(plan.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                          {plan.approvedDate && (
                            <p className="text-sm text-success">
                              Đã duyệt: {new Date(plan.approvedDate).toLocaleDateString('vi-VN')}
                            </p>
                          )}
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
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Chưa có kế hoạch nào được duyệt
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xử lý kế hoạch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="comment">Nhận xét (bắt buộc khi từ chối)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhập nhận xét..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => selectedPlan && handleApprove(selectedPlan)} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Phê duyệt
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => selectedPlan && handleReject(selectedPlan)} 
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

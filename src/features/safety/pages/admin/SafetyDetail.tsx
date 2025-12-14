import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Shield,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  Package,
  ClipboardList,
  AlertCircle,
  Lock,
  Building2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import { ppeApi } from '../../api/safetyApi';
import { unitApi } from '@/features/departments/api/departmentApi';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import RejectReasonModal from '@/features/training/components/RejectModal';

export default function PPEPlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [planDetail, setPlanDetail] = useState<any>(null);
  const [departments, setDepartments] = useState<Record<number, string>>({});
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDepartmentNames = async (departmentIds: number[]) => {
    try {
      const uniqueIds = [...new Set(departmentIds)];
      const departmentData: Record<number, string> = {};

      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const dept = await unitApi.getById(id);
            departmentData[id] = dept.data.name;
          } catch (error) {
            console.error(`Lỗi khi lấy thông tin phòng ban ${id}:`, error);
            departmentData[id] = `Phòng ban ${id}`;
          }
        })
      );

      setDepartments(departmentData);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin phòng ban:', error);
    }
  };
  useEffect(() => {
    if (id) {
      fetchPlanData();
    }
  }, [id]);

  useEffect(() => {
    if (registrations.length > 0) {
      const departmentIds = registrations.map(r => r.departmentId).filter(Boolean);
      if (departmentIds.length > 0) {
        fetchDepartmentNames(departmentIds);
      }
    }
  }, [registrations]);

  const fetchPlanData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const planId = Number(id);

      const [planResponse, registrationsResponse] = await Promise.all([
        ppeApi.getPlanById(planId),
        ppeApi.getRegistrationsByPlanId(planId), // Sử dụng API mới
      ]);

      setPlanDetail(planResponse);
      setRegistrations(registrationsResponse || []);
    } catch (err) {
      console.error('Lỗi khi tải thông tin kế hoạch:', err);
      setError('Không thể tải thông tin kế hoạch');
      toast.error('Không thể tải thông tin kế hoạch');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'ACTIVE': { label: 'Đang hoạt động', className: 'bg-green-100 text-green-800' },
      'CLOSED': { label: 'Đã đóng', className: 'bg-gray-100 text-gray-800' },
      'DRAFT': { label: 'Nháp', className: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getRegistrationStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'DRAFT': { label: 'Nháp', className: 'bg-gray-100 text-gray-800' },
      'PENDING': { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
      'REJECTED': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
      'RECEIVED': { label: 'Đã nhận', className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClosePlan = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đóng kế hoạch này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setIsProcessing(true);
      await ppeApi.closePlan(Number(id));
      toast.success('Đóng kế hoạch thành công');
      fetchPlanData();
    } catch (error) {
      console.error('Lỗi khi đóng kế hoạch:', error);
      toast.error('Không thể đóng kế hoạch');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveRegistration = async (registration: any) => {
    if (!window.confirm(`Bạn có chắc chắn muốn phê duyệt đăng ký #${registration.id}?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      await ppeApi.approveRegistration(registration.id, {
        id: registration.id,
        reason: 'Đã phê duyệt',
      });
      toast.success('Phê duyệt đăng ký thành công');
      fetchPlanData();
    } catch (error) {
      console.error('Lỗi khi phê duyệt:', error);
      toast.error('Không thể phê duyệt đăng ký');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRegistration = (registration: any) => {
    setSelectedRegistration(registration);
    setIsRejectModalOpen(true);
  };

  const submitRejectReason = async (reason: string) => {
    if (!selectedRegistration) return;

    try {
      setIsProcessing(true);
      await ppeApi.rejectRegistration(selectedRegistration.id, {
        id: selectedRegistration.id,
        reason: reason,
      });
      toast.success('Từ chối đăng ký thành công');
      setIsRejectModalOpen(false);
      setSelectedRegistration(null);
      fetchPlanData();
    } catch (error) {
      console.error('Lỗi khi từ chối:', error);
      toast.error('Không thể từ chối đăng ký');
    } finally {
      setIsProcessing(false);
    }
  };

  // Thống kê
  const totalRegistrations = registrations.length;
  const pendingRegistrations = registrations.filter(r => r.status === 'PENDING').length;
  const approvedRegistrations = registrations.filter(r => r.status === 'APPROVED').length;
  const rejectedRegistrations = registrations.filter(r => r.status === 'REJECTED').length;
  const receivedRegistrations = registrations.filter(r => r.status === 'RECEIVED').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !planDetail) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Không tìm thấy kế hoạch'}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Kế hoạch Bảo hộ năm {planDetail.year}
            </h1>
          </div>
        </div>

        {/* Nút đóng kế hoạch */}
        {isAdmin && planDetail.status === 'ACTIVE' && (
          <Button
            onClick={handleClosePlan}
            disabled={isProcessing}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            <Lock className="h-4 w-4 mr-2" />
            {isProcessing ? 'Đang xử lý...' : 'Đóng kế hoạch'}
          </Button>
        )}
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đăng ký</p>
              <p className="text-2xl font-bold">{totalRegistrations}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chờ duyệt</p>
              <p className="text-2xl font-bold">{pendingRegistrations}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã duyệt</p>
              <p className="text-2xl font-bold">{approvedRegistrations}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã nhận</p>
              <p className="text-2xl font-bold">{receivedRegistrations}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Từ chối</p>
              <p className="text-2xl font-bold">{rejectedRegistrations}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin chi tiết kế hoạch */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Thông tin chi tiết kế hoạch
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mã kế hoạch</p>
                <p className="font-medium">#{planDetail.id}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Năm áp dụng
                </p>
                <p className="font-medium text-lg">{planDetail.year}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                {getStatusBadge(planDetail.status)}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Ngày tạo</p>
                <p className="font-medium">{formatDate(planDetail.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
              <p className="text-sm leading-relaxed">
                {planDetail.notes || 'Không có ghi chú'}
              </p>
            </div>

            {/* Danh sách vật phẩm trong kế hoạch */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Danh sách vật phẩm ({planDetail.planDetails?.length || 0})
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Tên vật phẩm</TableHead>
                      <TableHead>Kích cỡ</TableHead>
                      <TableHead className="text-right">Số lượng chuẩn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planDetail.planDetails?.map((detail: any, index: number) => (
                      <TableRow key={detail.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{detail.ppeItemName}</TableCell>
                        <TableCell>
                          {detail.ppeItemSize ? (
                            <Badge variant="outline">{detail.ppeItemSize}</Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {detail.standardQuantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Card>

        {/* Trạng thái và thông tin bổ sung */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Trạng thái kế hoạch</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Trạng thái hiện tại</p>
              <div className="mt-2">
                {getStatusBadge(planDetail.status)}
              </div>
            </div>

            {planDetail.status === 'CLOSED' && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Kế hoạch đã đóng
                </p>
                <p className="text-xs text-muted-foreground">
                  Không thể thực hiện các thao tác mới
                </p>
              </div>
            )}

            {planDetail.closedAt && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ngày đóng</p>
                <p className="text-sm">{formatDate(planDetail.closedAt)}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Danh sách đăng ký từ Manager */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-600" />
          Đăng ký từ Phòng ban ({registrations.length})
        </h2>

        {registrations.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Vật phẩm đăng ký</TableHead>
                  <TableHead>Kích cỡ</TableHead>
                  <TableHead>Số lượng yêu cầu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  {isAdmin && <TableHead className="text-right">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      #{registration.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {departments[registration.departmentId] || `Phòng ban ${registration.departmentId}`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {registration.registrationDetails?.map((detail: any) => (
                          <div key={detail.id} className="text-sm">
                            {detail.ppeItemName}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {registration.registrationDetails?.map((detail: any) => (
                          <div key={detail.id} className="text-sm">
                            {detail.ppeItemSize}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {registration.registrationDetails?.map((detail: any) => (
                          <div key={detail.id} className="font-semibold">
                            {detail.requestedQuantity}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRegistrationStatusBadge(registration.status)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {registration.notes || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(registration.createdAt)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        {registration.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRegistration(registration)}
                              disabled={isProcessing}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectRegistration(registration)}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </div>
                        ) : registration.status === 'APPROVED' ? (
                          <Badge className="bg-green-100 text-green-800">
                            Đã phê duyệt
                          </Badge>
                        ) : registration.status === 'RECEIVED' ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            Đã nhận hàng
                          </Badge>
                        ) : registration.status === 'REJECTED' ? (
                          <Badge className="bg-red-100 text-red-800">
                            Đã từ chối
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            {registration.status}
                          </Badge>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Chưa có đăng ký nào từ phòng ban</p>
          </div>
        )}
      </Card>

      {/* Reject Modal */}
      <RejectReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedRegistration(null);
        }}
        onSubmit={submitRejectReason}
      />
    </div>
  );
}
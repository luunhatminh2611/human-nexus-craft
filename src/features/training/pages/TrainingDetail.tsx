import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Edit,
  Trash2,
  Send,
  XCircle
} from 'lucide-react';
import { trainingApi } from '../../training/api/trainingApi';
import TrainingModal from '../components/TrainingModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import RejectReasonModal from '../components/RejectModal';
import AssignEmployeesModal from '../components/AssignEmployeeModal';

export default function TrainingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trainingDetail, setTrainingDetail] = useState<any>(null);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTrainingData();
    }
  }, [id]);

  const fetchTrainingData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Gọi 2 API song song
      const [detailResponse, progressResponse] = await Promise.all([
        trainingApi.getById(id),
        trainingApi.getProgress(id)
      ]);

      const detail = detailResponse.data || detailResponse;
      const progress = progressResponse.data || progressResponse;

      setTrainingDetail(detail);
      setTrainingProgress(progress);
    } catch (err) {
      console.error('Lỗi khi tải thông tin khóa đào tạo:', err);
      setError('Không thể tải thông tin khóa đào tạo');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: 'Nháp', className: 'bg-gray-100 text-gray-800' },
      'PENDING_APPROVAL': { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: 'Đã duyệt', className: 'bg-blue-100 text-blue-800' },
      'REJECTED': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
      'IN_PROGRESS': { label: 'Đang diễn ra', className: 'bg-purple-100 text-purple-800' },
      'COMPLETED': { label: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };
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

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa khóa đào tạo này không?')) {
      try {
        await trainingApi.delete(id);
        alert('Xóa khóa đào tạo thành công');
        navigate('/training');
      } catch (error) {
        alert('Lỗi khi xóa khóa đào tạo');
      }
    }
  };

  const handleSubmitApproval = async () => {
    if (confirm('Bạn có chắc chắn muốn gửi yêu cầu phê duyệt khóa đào tạo này không?')) {
      try {
        setIsSubmitting(true);
        await trainingApi.submitApproval(id);
        alert('Gửi yêu cầu phê duyệt thành công');
        fetchTrainingData();
      } catch (error) {
        console.error('Lỗi khi gửi yêu cầu phê duyệt:', error);
        alert('Lỗi khi gửi yêu cầu phê duyệt');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = () => {
    fetchTrainingData();
  };

  const handleApprove = async () => {
    if (confirm('Bạn có chắc chắn muốn phê duyệt khóa đào tạo này không?')) {
      try {
        setIsApproving(true);
        await trainingApi.approveCourse({ courseId: Number(id) });
        alert('Phê duyệt khóa đào tạo thành công');
        fetchTrainingData();
      } catch (error) {
        console.error('Lỗi khi phê duyệt:', error);
        alert('Lỗi khi phê duyệt khóa đào tạo');
      } finally {
        setIsApproving(false);
      }
    }
  };

  const handleReject = () => {
    setIsRejectModalOpen(true);
  };


  const submitRejectReason = async (reason: string) => {
    try {
      setIsRejecting(true);
      await trainingApi.rejectCourse({
        courseId: Number(id),
        rejectionReason: reason,
      });
      alert("Từ chối khóa đào tạo thành công");
      setIsRejectModalOpen(false);
      fetchTrainingData();
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);
      alert("Lỗi khi từ chối khóa đào tạo");
    } finally {
      setIsRejecting(false);
    }
  };

  const canEditOrDelete = (status: string) => {
    // return ['DRAFT', 'REJECTED'].includes(status);
    return ['DRAFT', 'REJECTED'].includes(status);

  };

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

  if (error || !trainingDetail) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Không tìm thấy khóa đào tạo'}</p>
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
            <h1 className="text-3xl font-bold">{trainingDetail.title}</h1>
          </div>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      {trainingProgress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng người tham gia</p>
                <p className="text-2xl font-bold">{trainingProgress.totalAssigned || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                <p className="text-2xl font-bold">{trainingProgress.completed || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang thực hiện</p>
                <p className="text-2xl font-bold">{trainingProgress.inProgress || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
                <p className="text-2xl font-bold">{trainingProgress.completionPercentage || 0}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin chi tiết */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Thông tin chi tiết
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mã khóa học</p>
                <p className="font-medium">#{trainingDetail.id}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Phòng ban</p>
                <p className="font-medium">{trainingDetail.departmentName || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Địa điểm
                </p>
                <p className="font-medium">{trainingDetail.location || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Thời gian áp dụng
                </p>
                <p className="font-medium">
                  {trainingDetail.courseType === 'YEARLY' && `Năm ${trainingDetail.year}`}
                  {trainingDetail.courseType === 'QUARTERLY' && `Quý ${trainingDetail.quarter} - Năm ${trainingDetail.year}`}
                  {trainingDetail.courseType === 'MONTHLY' && `Tháng ${trainingDetail.month} - Năm ${trainingDetail.year}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Người tạo
                </p>
                <p className="font-medium">{trainingDetail.createdByName || '-'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Ngày tạo</p>
                <p className="font-medium">{formatDate(trainingDetail.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Mô tả</p>
              <p className="text-sm leading-relaxed">
                {trainingDetail.description || 'Chưa có mô tả'}
              </p>
            </div>
          </div>
        </Card>

        {/* Trạng thái phê duyệt */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Trạng thái phê duyệt</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Trạng thái hiện tại</p>
              <div className="mt-2">
                {getStatusBadge(trainingDetail.status)}
              </div>
            </div>

            {/* Nút hành động khi là DRAFT hoặc REJECTED */}
            {!isAdmin && canEditOrDelete(trainingDetail.status) && (
              <div className="space-y-2 pt-2 border-t">
                <Button
                  onClick={handleSubmitApproval}
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Đang gửi...' : 'Yêu cầu phê duyệt'}
                </Button>
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </div>
            )}

            {isAdmin && trainingDetail.status === 'PENDING_APPROVAL' && (
              <div className="space-y-2 pt-2 border-t">
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isApproving ? 'Đang duyệt...' : 'Phê duyệt'}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isRejecting}
                  variant="destructive"
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isRejecting ? 'Đang từ chối...' : 'Từ chối'}
                </Button>
              </div>
            )}

            {/* {!isAdmin && ['APPROVED', 'IN_PROGRESS'].includes(trainingDetail.status) && ( */}
            {!isAdmin && ['APPROVED', 'IN_PROGRESS'].includes(trainingDetail.status) && (
              <div className="space-y-2 pt-2 border-t">
                <Button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Giao khóa học
                </Button>
              </div>
            )}

            {trainingDetail.submittedAt && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ngày gửi duyệt</p>
                <p className="text-sm">{formatDate(trainingDetail.submittedAt)}</p>
              </div>
            )}

            {trainingDetail.approvedById && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Người phê duyệt</p>
                  <p className="text-sm font-medium">{trainingDetail.approvedByName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ngày phê duyệt</p>
                  <p className="text-sm">{formatDate(trainingDetail.approvedAt)}</p>
                </div>
              </>
            )}

            {trainingDetail.status === 'REJECTED' && trainingDetail.rejectionReason && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-muted-foreground mb-1">Lý do từ chối</p>
                <p className="text-sm text-red-700">{trainingDetail.rejectionReason}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(trainingDetail.rejectedAt)}
                </p>
              </div>
            )}

            {trainingDetail.cancelledById && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-muted-foreground mb-1">Người hủy</p>
                <p className="text-sm font-medium">{trainingDetail.cancelledByName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(trainingDetail.cancelledAt)}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Thời gian khóa học */}
      {trainingProgress && (trainingProgress.courseStartDate || trainingProgress.courseEndDate) && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Thời gian diễn ra</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ngày bắt đầu</p>
              <p className="font-medium">{formatDate(trainingProgress.courseStartDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ngày kết thúc</p>
              <p className="font-medium">{formatDate(trainingProgress.courseEndDate)}</p>
            </div>
          </div>
        </Card>
      )}

      <RejectReasonModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={submitRejectReason}
      />

      {/* Training Modal */}
      {trainingDetail && (
        <TrainingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          trainingId={id}
          mode="edit"
          onSuccess={handleModalSuccess}
          currentDepartmentId={trainingDetail.departmentId}
        />
      )}

      <AssignEmployeesModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        courseId={id}
        onSuccess={fetchTrainingData}
      />
    </div>
  );
}
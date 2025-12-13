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
  Clock,
  FileText,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Building2,
  Award,
} from 'lucide-react';
import { trainingApi } from '../api/trainingApi';

export default function EmployeeTrainingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignmentDetail, setAssignmentDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAssignmentDetail();
    }
  }, [id]);

  const fetchAssignmentDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await trainingApi.getEmployeeAssignmentById(id);
      const detail = response.data || response;
      setAssignmentDetail(detail);
    } catch (err) {
      console.error('Lỗi khi tải thông tin khóa đào tạo:', err);
      setError('Không thể tải thông tin khóa đào tạo');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue && status !== 'COMPLETED') {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          Quá hạn
        </Badge>
      );
    }

    const statusConfig: Record<
      string,
      { label: string; className: string; icon: any }
    > = {
      NOT_STARTED: {
        label: 'Chưa bắt đầu',
        className: 'bg-gray-100 text-gray-800',
        icon: Clock,
      },
      IN_PROGRESS: {
        label: 'Đang thực hiện',
        className: 'bg-blue-100 text-blue-800',
        icon: PlayCircle,
      },
      COMPLETED: {
        label: 'Hoàn thành',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle2,
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
      icon: AlertCircle,
    };
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleStartTraining = async () => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn bắt đầu khóa đào tạo này không? Thời gian hoàn thành sẽ được tính từ bây giờ.'
      )
    ) {
      return;
    }

    try {
      setIsStarting(true);
      await trainingApi.startEmployeeAssignment(id);
      alert('Bắt đầu khóa đào tạo thành công');
      fetchAssignmentDetail();
    } catch (error) {
      console.error('Lỗi khi bắt đầu khóa đào tạo:', error);
      alert('Lỗi khi bắt đầu khóa đào tạo');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteTraining = async () => {
    if (
      !confirm(
        'Bạn có chắc chắn đã hoàn thành khóa đào tạo này không? Hành động này không thể hoàn tác.'
      )
    ) {
      return;
    }

    try {
      setIsCompleting(true);
      await trainingApi.completeEmployeeAssignment(id);
      alert('Xác nhận hoàn thành khóa đào tạo thành công');
      fetchAssignmentDetail();
    } catch (error) {
      console.error('Lỗi khi hoàn thành khóa đào tạo:', error);
      alert('Lỗi khi hoàn thành khóa đào tạo');
    } finally {
      setIsCompleting(false);
    }
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

  if (error || !assignmentDetail) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">
            {error || 'Không tìm thấy khóa đào tạo'}
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(assignmentDetail.deadline);
  const isOverdue =
    assignmentDetail.isOverdue && assignmentDetail.status !== 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {assignmentDetail.courseTitle}
            </h1>
            <p className="text-muted-foreground mt-1">
              Chi tiết khóa đào tạo được giao
            </p>
          </div>
        </div>
      </div>

      {/* Warning if overdue */}
      {isOverdue && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">
                Khóa đào tạo đã quá hạn!
              </p>
              <p className="text-sm text-red-700">
                Vui lòng hoàn thành khóa đào tạo này càng sớm càng tốt.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin chi tiết */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Thông tin khóa đào tạo
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mã phân công</p>
                <p className="font-medium">#{assignmentDetail.id}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Mã khóa học</p>
                <p className="font-medium">#{assignmentDetail.courseId}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  Phòng ban
                </p>
                <p className="font-medium">
                  {assignmentDetail.departmentName || '-'}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Người giao
                </p>
                <p className="font-medium">
                  {assignmentDetail.assignedByName || '-'}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Ngày bắt đầu
                </p>
                <p className="font-medium">
                  {formatDate(assignmentDetail.startDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Hạn hoàn thành
                </p>
                <p
                  className={`font-medium ${
                    isOverdue ? 'text-red-600' : ''
                  }`}
                >
                  {formatDate(assignmentDetail.deadline)}
                  {assignmentDetail.status !== 'COMPLETED' &&
                    daysRemaining > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        (còn {daysRemaining} ngày)
                      </span>
                    )}
                  {isOverdue && (
                    <span className="ml-2 text-sm">
                      (Quá {Math.abs(daysRemaining)} ngày)
                    </span>
                  )}
                </p>
              </div>

              {assignmentDetail.completionDate && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Ngày hoàn thành
                  </p>
                  <p className="font-medium text-green-600">
                    {formatDateTime(assignmentDetail.completionDate)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Ngày được giao</p>
                <p className="font-medium">
                  {formatDateTime(assignmentDetail.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Cập nhật lần cuối
                </p>
                <p className="font-medium">
                  {formatDateTime(assignmentDetail.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Trạng thái và hành động */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Trạng thái</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Trạng thái hiện tại
              </p>
              <div className="flex items-center gap-2">
                {getStatusBadge(
                  assignmentDetail.status,
                  assignmentDetail.isOverdue
                )}
              </div>
            </div>

            {/* Action buttons based on status */}
            <div className="pt-4 border-t space-y-2">
              {assignmentDetail.status === 'NOT_STARTED' && (
                <Button
                  onClick={handleStartTraining}
                  disabled={isStarting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {isStarting ? 'Đang xử lý...' : 'Bắt đầu khóa đào tạo'}
                </Button>
              )}

              {assignmentDetail.status === 'IN_PROGRESS' && (
                <Button
                  onClick={handleCompleteTraining}
                  disabled={isCompleting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {isCompleting ? 'Đang xử lý...' : 'Xác nhận hoàn thành'}
                </Button>
              )}

              {assignmentDetail.status === 'COMPLETED' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-medium">
                      Bạn đã hoàn thành khóa đào tạo này!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress info */}
            {assignmentDetail.status === 'IN_PROGRESS' && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Đang thực hiện
                </p>
                <p className="text-xs text-blue-700">
                  Hãy hoàn thành khóa đào tạo trước ngày{' '}
                  {formatDate(assignmentDetail.deadline)}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tiến trình
        </h2>

        <div className="relative pl-8">
          {/* Created */}
          <div className="mb-6 relative">
            <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-gray-400" />
            <div className="absolute -left-6 top-6 bottom-0 w-0.5 bg-gray-200" />
            <div>
              <p className="font-medium">Được giao khóa đào tạo</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(assignmentDetail.createdAt)}
              </p>
            </div>
          </div>

          {/* Started */}
          {assignmentDetail.status !== 'NOT_STARTED' && (
            <div className="mb-6 relative">
              <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-blue-500" />
              {assignmentDetail.status !== 'COMPLETED' && (
                <div className="absolute -left-6 top-6 bottom-0 w-0.5 bg-gray-200" />
              )}
              <div>
                <p className="font-medium">Bắt đầu khóa đào tạo</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(assignmentDetail.updatedAt)}
                </p>
              </div>
            </div>
          )}

          {/* Completed */}
          {assignmentDetail.status === 'COMPLETED' && (
            <div className="mb-6 relative">
              <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full bg-green-500" />
              <div>
                <p className="font-medium text-green-600">Hoàn thành</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(assignmentDetail.completionDate)}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
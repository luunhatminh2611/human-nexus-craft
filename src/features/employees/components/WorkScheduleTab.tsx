import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button as Button2 } from '@/shared/components/ui/button/Button2';
import {
  Calendar,
  MapPin,
  Trash2,
  Edit,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { workScheduleApi } from '../../schedule/api/scheduleApi';
import { toast } from '@/shared/hooks/use-toast';
import WorkScheduleFormModal from '../../schedule/components/ModalTab';

interface WorkSchedule {
  id: number;
  title?: string;
  employeeId: number;
  employeeName?: string;
  location?: string;
  startDateTime: string;
  endDateTime?: string;
  startTime?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WorkScheduleTabProps {
  employeeId: number;
}

export default function WorkScheduleTab({ employeeId }: WorkScheduleTabProps) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);

  // Fetch work schedules by employee
  const { data: schedules = [], isLoading, refetch } = useQuery({
    queryKey: ['workSchedules', employeeId],
    queryFn: () => workScheduleApi.getByUser(employeeId),
    enabled: !!employeeId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (scheduleId: number) => workScheduleApi.delete(scheduleId),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã xóa lịch công tác',
      });
      queryClient.invalidateQueries({ queryKey: ['workSchedules'] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa lịch công tác',
        variant: 'destructive',
      });
    },
  });

  // Confirm mutation
  const confirmMutation = useMutation({
    mutationFn: (scheduleId: number) => workScheduleApi.confirm(scheduleId),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã xác nhận lịch công tác',
      });
      queryClient.invalidateQueries({ queryKey: ['workSchedules'] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xác nhận lịch công tác',
        variant: 'destructive',
      });
    },
  });

  // Pagination
  const paginatedSchedules = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return schedules.slice(startIndex, endIndex);
  }, [schedules, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(schedules.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [schedules.length]);

  const getScheduleStatus = (schedule: WorkSchedule) => {
    if (schedule.status === 'CONFIRMED') return 'confirmed';
    if (schedule.status === 'SCHEDULED') return 'scheduled';
    
    const now = new Date();
    const startDate = new Date(schedule.startDateTime);
    const endDate = schedule.endDateTime ? new Date(schedule.endDateTime) : startDate;

    if (endDate < now) return 'completed';
    if (startDate <= now && now <= endDate) return 'ongoing';
    return 'upcoming';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'confirmed': { label: 'Đã xác nhận', variant: 'default', icon: CheckCircle2 },
      'scheduled': { label: 'Đã lên lịch', variant: 'secondary', icon: Clock },
      'ongoing': { label: 'Đang diễn ra', variant: 'default', icon: AlertCircle },
      'upcoming': { label: 'Sắp tới', variant: 'outline', icon: Calendar },
      'completed': { label: 'Đã hoàn thành', variant: 'secondary', icon: CheckCircle2 },
    };
    return statusConfig[status] || statusConfig['scheduled'];
  };

  const handleDelete = (scheduleId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch công tác này?')) {
      deleteMutation.mutate(scheduleId);
    }
  };

  const handleConfirm = (scheduleId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có muốn xác nhận lịch công tác này?')) {
      confirmMutation.mutate(scheduleId);
    }
  };

  const handleEdit = (schedule: WorkSchedule, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSchedule(schedule);
    setIsFormModalOpen(true);
  };

  const openCreate = () => {
    setSelectedSchedule(null);
    setIsFormModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start: string, end?: string) => {
    if (!end) return '1 ngày';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} ngày`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Lịch công tác
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Header Card */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Lịch công tác
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tổng số: {schedules.length} lịch công tác
              </p>
            </div>
            <Button2 onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm lịch công tác
            </Button2>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="text-center p-3 text-sm font-semibold w-16">STT</th>
                <th className="text-left p-3 text-sm font-semibold">Tiêu đề</th>
                <th className="text-left p-3 text-sm font-semibold">Địa điểm</th>
                <th className="text-left p-3 text-sm font-semibold">Thời gian bắt đầu</th>
                <th className="text-left p-3 text-sm font-semibold">Thời gian kết thúc</th>
                <th className="text-center p-3 text-sm font-semibold">Thời lượng</th>
                <th className="text-center p-3 text-sm font-semibold">Trạng thái</th>
                <th className="text-center p-3 text-sm font-semibold w-40">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">Chưa có lịch công tác nào</p>
                  </td>
                </tr>
              ) : (
                paginatedSchedules.map((schedule: WorkSchedule, index) => {
                  const status = getScheduleStatus(schedule);
                  const statusConfig = getStatusBadge(status);
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={schedule.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3 text-center text-sm text-muted-foreground">
                        {globalIndex}
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-sm">
                          {schedule.title || 'Công tác'}
                        </p>
                        {schedule.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {schedule.description}
                          </p>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm">{schedule.location || 'Không xác định'}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{formatDateTime(schedule.startDateTime)}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">
                          {schedule.endDateTime 
                            ? formatDateTime(schedule.endDateTime) 
                            : 'Không xác định'}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        <p className="text-sm font-medium">
                          {calculateDuration(schedule.startDateTime, schedule.endDateTime)}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={statusConfig.variant as any} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-center">
                          {schedule.status !== 'CONFIRMED' && (
                            <Button2
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleConfirm(schedule.id, e)}
                              title="Xác nhận"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button2>
                          )}
                          <Button2
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEdit(schedule, e)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button2>
                          <Button2
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(schedule.id, e)}
                            title="Xóa"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button2>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {schedules.length > 0 && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Hiển thị</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">mục</span>
              </div>

              <div className="flex items-center gap-2">
                <Button2
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Đầu
                </Button2>
                <Button2
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button2>

                <span className="text-sm px-4">
                  Trang {currentPage} / {totalPages}
                </span>

                <Button2
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button2>
                <Button2
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Cuối
                </Button2>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <WorkScheduleFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedSchedule(null);
        }}
        schedule={selectedSchedule}
        employeeId={employeeId}
        onSuccess={() => {
          setIsFormModalOpen(false);
          setSelectedSchedule(null);
          refetch();
        }}
      />
    </>
  );
}
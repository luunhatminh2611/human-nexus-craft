import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  User,
  Building2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Award
} from 'lucide-react';
import { trainingApi } from '../../api/trainingApi';
import { useNavigate } from 'react-router-dom';

interface TrainingAssignment {
  id: number;
  courseId: number;
  courseTitle: string;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  departmentId: number;
  departmentName: string;
  assignedById: number;
  assignedByName: string;
  status: string;
  startDate: string;
  completionDate: string | null;
  deadline: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EmployeeTrainingPage() {
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<TrainingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [pageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();
  useEffect(() => {
    fetchAssignments();
  }, [pageNumber]);

  useEffect(() => {
    filterAssignments();
  }, [assignments, searchKeyword, statusFilter]);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await trainingApi.getEmployeeAssignments({
        pageSize,
        pageNumber,
      });

      const data = response.data || response;
      setAssignments(data.data || []);
      setTotalPages(data.totalPage || 0);
      setTotalItems(data.totalItem || 0);
    } catch (error) {
      console.error('Lỗi khi tải danh sách khóa đào tạo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = [...assignments];

    // Filter by search keyword
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.courseTitle?.toLowerCase().includes(keyword) ||
          item.assignedByName?.toLowerCase().includes(keyword) ||
          item.departmentName?.toLowerCase().includes(keyword)
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredAssignments(filtered);
  };

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue && status !== 'COMPLETED') {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Quá hạn
        </Badge>
      );
    }

    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      NOT_STARTED: {
        label: 'Chưa bắt đầu',
        className: 'bg-gray-100 text-gray-800',
        icon: XCircle,
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
        <Icon className="h-3 w-3 mr-1" />
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

  const calculateDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusStats = () => {
    return {
      total: assignments.length,
      notStarted: assignments.filter((a) => a.status === 'NOT_STARTED').length,
      inProgress: assignments.filter((a) => a.status === 'IN_PROGRESS').length,
      completed: assignments.filter((a) => a.status === 'COMPLETED').length,
      overdue: assignments.filter((a) => a.isOverdue && a.status !== 'COMPLETED').length,
    };
  };

  const stats = getStatusStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Khóa đào tạo của tôi</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và theo dõi các khóa đào tạo được giao
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng số</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <XCircle className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Chưa bắt đầu</p>
              <p className="text-2xl font-bold">{stats.notStarted}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PlayCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Đang thực hiện</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hoàn thành</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quá hạn</p>
              <p className="text-2xl font-bold">{stats.overdue}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên khóa học, người giao..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ALL')}
            >
              <Filter className="h-4 w-4 mr-1" />
              Tất cả
            </Button>
            <Button
              variant={statusFilter === 'NOT_STARTED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('NOT_STARTED')}
            >
              Chưa bắt đầu
            </Button>
            <Button
              variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('IN_PROGRESS')}
            >
              Đang thực hiện
            </Button>
            <Button
              variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('COMPLETED')}
            >
              Hoàn thành
            </Button>
          </div>
        </div>
      </Card>

      {/* Training List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAssignments.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không tìm thấy khóa đào tạo nào</p>
            </div>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => {
            const daysRemaining = calculateDaysRemaining(assignment.deadline);
            return (
              <Card key={assignment.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Award className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {assignment.courseTitle}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{assignment.departmentName}</span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Người giao: {assignment.assignedByName}</span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Bắt đầu: {formatDate(assignment.startDate)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span
                              className={
                                assignment.isOverdue && assignment.status !== 'COMPLETED'
                                  ? 'text-red-600 font-medium'
                                  : 'text-muted-foreground'
                              }
                            >
                              Hạn: {formatDate(assignment.deadline)}
                              {assignment.status !== 'COMPLETED' && daysRemaining > 0 && (
                                <span className="ml-1">
                                  ({daysRemaining} ngày)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {assignment.completionDate && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>
                              Hoàn thành: {formatDate(assignment.completionDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(assignment.status, assignment.isOverdue)}
                    <Button size="sm" variant="outline" onClick={() => navigate(`/employee/training/${assignment.id}`)}>
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {filteredAssignments.length} / {totalItems} kết quả
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber === 1}
              onClick={() => setPageNumber((prev) => prev - 1)}
            >
              Trang trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber === totalPages}
              onClick={() => setPageNumber((prev) => prev + 1)}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
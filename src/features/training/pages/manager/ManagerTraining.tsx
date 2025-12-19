import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import { trainingApi } from '../../api/trainingApi';
import { employeeApi } from '@/features/employees/api/employeeApi';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import TrainingModal from '../../components/TrainingModal';
import { useNavigate } from 'react-router-dom';

export default function TrainingManagerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [userDepartmentId, setUserDepartmentId] = useState<number | null>(null);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const { user } = useAuthStore();

  // Fetch user department
  useEffect(() => {
    fetchUserDepartment();
  }, []);

  // Fetch trainings khi có userDepartmentId hoặc khi filter thay đổi
  useEffect(() => {
    if (userDepartmentId !== null) {
      fetchTrainings();
    }
  }, [userDepartmentId, pageNumber, pageSize, searchTerm, filterStatus, sortField, sortOrder]);

  const fetchUserDepartment = async () => {
    try {
      if (!user?.userId) {
        console.warn("Không có userId");
        return;
      }

      if (user?.employeeId) {
        const response = await employeeApi.getById(user?.employeeId);

        const deptId = response?.data?.departmentId;
        setUserDepartmentId(deptId);
        setCurrentEmployeeId(response?.data?.id);
      } else {
        console.warn("Employee không có department");
      }
    } catch (err) {
      console.error("Lỗi khi lấy department của user:", err);
    }
  };

  const fetchTrainings = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching trainings with params:", {
        pageNumber,
        pageSize,
        departmentId: userDepartmentId,
        keyword: searchTerm,
        status: filterStatus,
        sortField,
        sortOrder
      });

      const data = await trainingApi.getAll({
        pageNumber: pageNumber,
        pageSize: pageSize,
        departmentId: userDepartmentId || undefined,
        keyword: searchTerm || '',
        status: filterStatus === 'all' ? '' : filterStatus,
        sortField: sortField || undefined,
        sortOrder: sortOrder || undefined
      });

      console.log("Trainings response:", data);

      // Xử lý response - có thể là array hoặc object với data và total
      if (Array.isArray(data)) {
        setTrainings(data);
        setTotalItems(data.length);
      } else if (data?.data) {
        setTrainings(Array.isArray(data.data) ? data.data : []);
        setTotalItems(data.total || data.data.length);
      } else {
        setTrainings([]);
        setTotalItems(0);
      }

      setError(null);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách khóa đào tạo:", err);
      setError(err);
      setTrainings([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khóa đào tạo này không?')) {
      try {
        await trainingApi.delete(id);
        alert('Xóa khóa đào tạo thành công');
        fetchTrainings();
      } catch (error) {
        alert('Lỗi khi xóa khóa đào tạo');
      }
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

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getCourseTypeBadge = (type: string) => {
    const typeConfig = {
      'QUARTERLY': { label: 'Khóa Học Quý', className: 'bg-blue-100 text-blue-800' },
      'MONTHLY': { label: 'Khóa Học Tháng', className: 'bg-green-100 text-green-800' },
      'YEARLY': { label: 'Khóa Học Năm', className: 'bg-purple-100 text-purple-800' },
    };

    const config = typeConfig[type] || { label: type, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedTrainingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (id: string | number) => {
    setModalMode('edit');
    setSelectedTrainingId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrainingId(null);
  };

  const handleModalSuccess = () => {
    fetchTrainings(); // Reload data
  };

  // Chỉ cho phép sửa/xóa khi trạng thái là DRAFT hoặc REJECTED
  const canEditOrDelete = (status: string) => {
    return ['DRAFT', 'REJECTED'].includes(status);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userDepartmentId !== null) {
        setPageNumber(1); // Reset về trang đầu khi search
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (pageNumber - 1) * pageSize + 1;
  const endIndex = Math.min(pageNumber * pageSize, totalItems);

  if (error && !isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Lỗi: Không thể tải danh sách khóa đào tạo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đào tạo</h1>
          <p className="text-muted-foreground">
            Danh sách khóa đào tạo phòng ban ({totalItems} bản ghi)
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="bg-green-500 text-white hover:bg-green-600">
          <Plus className="h-4 w-4 mr-2" />
          Tạo khóa đào tạo
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên khóa đào tạo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="DRAFT">Nháp</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang diễn ra</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên khóa đào tạo</TableHead>
                <TableHead>Loại khóa học</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : trainings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search className="h-8 w-8" />
                      <p>Không có dữ liệu</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                trainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{training.title || '-'}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {training.description || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCourseTypeBadge(training.courseType)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{training.location || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {training.courseType === 'YEARLY' && (
                          <p>Năm: {training.year || '-'}</p>
                        )}
                        {training.courseType === 'QUARTERLY' && (
                          <>
                            <p>Quý: {training.quarter || '-'}</p>
                            <p>Năm: {training.year || '-'}</p>
                          </>
                        )}
                        {training.courseType === 'MONTHLY' && (
                          <>
                            <p>Tháng: {training.month || '-'}</p>
                            <p>Năm: {training.year || '-'}</p>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(training.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Xem chi tiết"
                          onClick={() => navigate(`/training/${training.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEditOrDelete(training.status) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(training.id)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(training.id)}
                              title="Xóa"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && trainings.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex} - {endIndex} trong tổng số {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPageNumber(1);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(1)}
                  disabled={pageNumber === 1}
                >
                  Đầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(p => p - 1)}
                  disabled={pageNumber === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="px-3 text-sm">
                  Trang {pageNumber} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(p => p + 1)}
                  disabled={pageNumber >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageNumber(totalPages)}
                  disabled={pageNumber >= totalPages}
                >
                  Cuối
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <TrainingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        trainingId={selectedTrainingId}
        mode={modalMode}
        onSuccess={handleModalSuccess}
        currentDepartmentId={userDepartmentId}
      />
    </div>
  );
}
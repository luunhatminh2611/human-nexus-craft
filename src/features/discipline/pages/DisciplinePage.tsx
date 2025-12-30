// pages/hr/discipline/DisciplinePage.tsx

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
import { Search, Eye, ChevronLeft, ChevronRight, Plus, Edit, AlertTriangle } from 'lucide-react';
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
import { 
  mockDisciplines, 
  type Discipline, 
  calculateDisciplineStatistics,
  statusLabels,
  severityLabels
} from '../../../mock/dismissed';
import DisciplineDetailModal from '../components/DisciplineDetailModal';
import DisciplineFormModal from '../components/DisciplineFormModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

export default function DisciplinePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';
  const isManager = user?.roles === 'MANAGER';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string | null>(null);

  useEffect(() => {
    fetchDisciplines();
  }, [page, pageSize, searchTerm, statusFilter, departmentFilter, severityFilter, refreshKey]);

  const fetchDisciplines = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockDisciplines];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter(d => d.departmentName === departmentFilter);
    }

    if (severityFilter !== 'ALL') {
      filtered = filtered.filter(d => d.severity === severityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.violationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.violationDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.decisionNumber && d.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setTotalItems(filtered.length);

    const start = page * pageSize;
    const end = start + pageSize;
    setDisciplines(filtered.slice(start, end));

    setIsLoading(false);
  };

  const handleOpenFormModal = (discipline?: Discipline) => {
    setSelectedDiscipline(discipline || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedDiscipline(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedDisciplineId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDisciplineId(null);
  };

  const handleDetailSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseDetailModal();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: statusLabels.DRAFT, className: 'bg-gray-100 text-gray-800' },
      'PENDING_EXPLANATION': { label: statusLabels.PENDING_EXPLANATION, className: 'bg-blue-100 text-blue-800' },
      'PENDING_REVIEW': { label: statusLabels.PENDING_REVIEW, className: 'bg-yellow-100 text-yellow-800' },
      'OVERDUE': { label: statusLabels.OVERDUE, className: 'bg-red-100 text-red-800' },
      'COMPLETED': { label: statusLabels.COMPLETED, className: 'bg-green-100 text-green-800' },
      'DISMISSED': { label: statusLabels.DISMISSED, className: 'bg-purple-100 text-purple-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      'LIGHT': { label: severityLabels.LIGHT, className: 'bg-blue-100 text-blue-800' },
      'MEDIUM': { label: severityLabels.MEDIUM, className: 'bg-orange-100 text-orange-800' },
      'SERIOUS': { label: severityLabels.SERIOUS, className: 'bg-red-100 text-red-800' },
    };

    const config = severityConfig[severity] || { label: severity, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const stats = calculateDisciplineStatistics(mockDisciplines);
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  const departments = Array.from(new Set(mockDisciplines.map(d => d.departmentName)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý kỷ luật</h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Xem xét và ra quyết định kỷ luật cho nhân viên vi phạm' 
              : isManager 
              ? 'Ghi nhận và quản lý vi phạm của nhân viên'
              : 'Xem thông tin kỷ luật'}
          </p>
        </div>
        {(isManager || isAdmin) && (
          <Button onClick={() => handleOpenFormModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Ghi nhận vi phạm
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên, loại vi phạm, mô tả hoặc số quyết định"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Mức độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả mức độ</SelectItem>
              <SelectItem value="LIGHT">Nhẹ</SelectItem>
              <SelectItem value="MEDIUM">Trung bình</SelectItem>
              <SelectItem value="SERIOUS">Nghiêm trọng</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
              <SelectItem value="PENDING_EXPLANATION">Chờ giải trình</SelectItem>
              <SelectItem value="PENDING_REVIEW">Chờ xem xét</SelectItem>
              <SelectItem value="OVERDUE">Quá hạn</SelectItem>
              <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
              <SelectItem value="DISMISSED">Đã bác bỏ</SelectItem>
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
                <TableHead>Nhân viên</TableHead>
                <TableHead>Loại vi phạm</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>Ngày vi phạm</TableHead>
                <TableHead>Người ghi nhận</TableHead>
                <TableHead>Hạn giải trình</TableHead>
                <TableHead>Số QĐ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : disciplines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8" />
                      <p>Không tìm thấy hồ sơ kỷ luật nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                disciplines.map((discipline) => (
                  <TableRow key={discipline.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{discipline.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{discipline.departmentName}</p>
                        <p className="text-xs text-muted-foreground">{discipline.position}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{discipline.violationType}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[250px] line-clamp-2">{discipline.violationDescription}</span>
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(discipline.severity)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(discipline.violationDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{discipline.createdByName}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(discipline.createdDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {discipline.explanationDeadline ? (
                        <div className="text-sm">
                          <div className={`font-medium ${
                            new Date(discipline.explanationDeadline) < new Date() && 
                            discipline.status === 'PENDING_EXPLANATION'
                              ? 'text-red-600'
                              : ''
                          }`}>
                            {new Date(discipline.explanationDeadline).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Chưa gửi</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {discipline.decisionNumber ? (
                        <div className="text-sm">
                          <div className="font-medium">{discipline.decisionNumber}</div>
                          <div className="text-muted-foreground">
                            {discipline.decisionDate && new Date(discipline.decisionDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(discipline.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {(discipline.status === 'DRAFT' && (isManager || isAdmin)) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFormModal(discipline)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(discipline.id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && disciplines.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex} - {endIndex} trong tổng số {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(0);
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
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                >
                  Đầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="px-3 text-sm">
                  Trang {page + 1} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                >
                  Cuối
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <DisciplineDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        disciplineId={selectedDisciplineId}
        onSuccess={handleDetailSuccess}
        isAdmin={isAdmin}
        isManager={isManager}
      />

      <DisciplineFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        discipline={selectedDiscipline}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
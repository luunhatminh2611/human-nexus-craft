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
import { Search, Eye, ChevronLeft, ChevronRight, AlertCircle, FileText } from 'lucide-react';
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
import { mockDegrees, type Degree, calculateStatistics } from '../../../mock/degree';
import DegreeApprovalModal from '../components/DegreeApprovalModal';

export default function DegreeHRPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedDegreeId, setSelectedDegreeId] = useState<string | null>(null);

  useEffect(() => {
    fetchDegrees();
  }, [page, pageSize, searchTerm, typeFilter, statusFilter, departmentFilter]);

  const fetchDegrees = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...mockDegrees];
    
    // Lọc theo type
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(d => d.type === typeFilter);
    }
    
    // Lọc theo status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    
    // Lọc theo department
    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter(d => d.department === departmentFilter);
    }
    
    // Tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setTotalItems(filtered.length);
    
    // Pagination
    const start = page * pageSize;
    const end = start + pageSize;
    setDegrees(filtered.slice(start, end));
    
    setIsLoading(false);
  };

  const handleOpenApprovalModal = (id: string) => {
    setSelectedDegreeId(id);
    setIsApprovalModalOpen(true);
  };

  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setSelectedDegreeId(null);
  };

  const handleApprovalSuccess = () => {
    fetchDegrees();
    handleCloseApprovalModal();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
      'REJECTED': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
      'EXPIRED': { label: 'Hết hạn', className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'EDUCATION': { label: 'Học vấn', className: 'bg-blue-100 text-blue-800' },
      'CERTIFICATION': { label: 'Chứng chỉ', className: 'bg-purple-100 text-purple-800' },
      'LICENSE': { label: 'Giấy phép', className: 'bg-orange-100 text-orange-800' },
    };

    const config = typeConfig[type];
    if (!config) return null;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getExpiryWarning = (degree: Degree) => {
    if (!degree.expiryDate) return null;
    
    const now = new Date();
    const expiryDate = new Date(degree.expiryDate);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      return (
        <div className="flex items-center gap-1 text-orange-600 text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>Còn {daysUntilExpiry} ngày</span>
        </div>
      );
    }
    
    return null;
  };

  const stats = calculateStatistics(mockDegrees);
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  // Lấy danh sách phòng ban unique
  const departments = Array.from(new Set(mockDegrees.map(d => d.department)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý bằng cấp</h1>
          <p className="text-muted-foreground">
            Phê duyệt và quản lý bằng cấp của tất cả nhân viên
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Tổng số</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="text-sm text-muted-foreground">Chờ duyệt</div>
          <div className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Đã duyệt</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{stats.approved}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Từ chối</div>
          <div className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</div>
        </Card>
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="text-sm text-muted-foreground">Sắp hết hạn</div>
          <div className="text-2xl font-bold mt-1 text-orange-600">{stats.expiringSoon}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên, bằng cấp hoặc tổ chức"
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

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="EDUCATION">Học vấn</SelectItem>
              <SelectItem value="CERTIFICATION">Chứng chỉ</SelectItem>
              <SelectItem value="LICENSE">Giấy phép</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
              <SelectItem value="EXPIRED">Hết hạn</SelectItem>
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
                <TableHead>Loại</TableHead>
                <TableHead>Tên bằng cấp</TableHead>
                <TableHead>Tổ chức cấp</TableHead>
                <TableHead>Ngày nộp</TableHead>
                <TableHead>Ngày hết hạn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : degrees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Không tìm thấy bằng cấp nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                degrees.map((degree) => (
                  <TableRow key={degree.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{degree.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{degree.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(degree.type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{degree.name}</p>
                        {degree.major && (
                          <p className="text-xs text-muted-foreground">{degree.major}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{degree.institution}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(degree.submittedDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        {degree.expiryDate ? (
                          <>
                            <span className="text-sm">
                              {new Date(degree.expiryDate).toLocaleDateString('vi-VN')}
                            </span>
                            {getExpiryWarning(degree)}
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(degree.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenApprovalModal(degree.id)}
                          title="Xem và phê duyệt"
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
        {!isLoading && degrees.length > 0 && (
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

      <DegreeApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={handleCloseApprovalModal}
        degreeId={selectedDegreeId}
        onSuccess={handleApprovalSuccess}
      />
    </div>
  );
}
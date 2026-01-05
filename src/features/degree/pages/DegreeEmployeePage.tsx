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
import { Search, Plus, Edit2, Trash2, FileText, AlertCircle } from 'lucide-react';
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
import { mockDegrees, type Degree } from '../../../mock/degree';
import DegreeFormModal from '../components/DegreeFormModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

export default function DegreeEmployeePage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [degreeToDelete, setDegreeToDelete] = useState<Degree | null>(null);

  const isAdmin = user?.roles?.includes('ADMIN');
  const isManager = user?.roles?.includes('MANAGER');

  useEffect(() => {
    fetchDegrees();
  }, [searchTerm, typeFilter, statusFilter, user]);

  const fetchDegrees = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...mockDegrees];
    
    // Lọc theo user hiện tại (nếu không phải ADMIN)
    if (!isAdmin && user?.employeeId) {
      filtered = filtered.filter(d => d.employeeId === user.employeeId);
    }
    
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(d => d.type === typeFilter);
    }
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setDegrees(filtered);
    setIsLoading(false);
  };

  const handleOpenFormModal = (degree?: Degree) => {
    setSelectedDegree(degree || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedDegree(null);
  };

  const handleFormSuccess = () => {
    fetchDegrees();
    handleCloseFormModal();
  };

  const handleDeleteClick = (degree: Degree) => {
    setDegreeToDelete(degree);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!degreeToDelete) return;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Remove from mockDegrees
    const index = mockDegrees.findIndex(d => d.id === degreeToDelete.id);
    if (index > -1) {
      mockDegrees.splice(index, 1);
    }
    
    setIsDeleteDialogOpen(false);
    setDegreeToDelete(null);
    fetchDegrees();
  };

  const canEdit = (degree: Degree) => {
    if (isAdmin) return true;
    return degree.status === 'PENDING' || degree.status === 'REJECTED';
  };

  const canDelete = (degree: Degree) => {
    if (isAdmin) return true;
    return degree.status === 'PENDING' || degree.status === 'REJECTED';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
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
        <div className="flex items-center gap-1 text-orange-600 text-xs mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>Còn {daysUntilExpiry} ngày</span>
        </div>
      );
    }
    
    return null;
  };

  const stats = {
    total: degrees.length,
    pending: degrees.filter(d => d.status === 'PENDING').length,
    approved: degrees.filter(d => d.status === 'APPROVED').length,
    rejected: degrees.filter(d => d.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Quản lý bằng cấp' : 'Bằng cấp của tôi'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Quản lý bằng cấp của tất cả nhân viên'
              : 'Quản lý bằng cấp, chứng chỉ và giấy phép của bạn'
            }
          </p>
        </div>
        <Button onClick={() => handleOpenFormModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm bằng cấp
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Tổng số</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="text-sm text-muted-foreground">Chờ duyệt</div>
          <div className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="text-sm text-muted-foreground">Hoàn thành</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{stats.approved}</div>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="text-sm text-muted-foreground">Từ chối</div>
          <div className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên bằng cấp hoặc tổ chức"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại bằng cấp</SelectItem>
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
              <SelectItem value="APPROVED">Hoàn thành</SelectItem>
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
                <TableHead>Loại bằng cấp</TableHead>
                <TableHead>Tên bằng cấp</TableHead>
                <TableHead>Tổ chức cấp</TableHead>
                <TableHead>Ngày cấp</TableHead>
                <TableHead>Thời gian hiệu lực</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : degrees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Chưa có bằng cấp nào</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenFormModal()}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm bằng cấp đầu tiên
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                degrees.map((degree) => (
                  <TableRow key={degree.id}>
                    <TableCell>
                      {getTypeBadge(degree.type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{degree.name}</p>
                        {degree.major && (
                          <p className="text-xs text-muted-foreground">{degree.major}</p>
                        )}
                        {degree.certificateNumber && (
                          <p className="text-xs text-muted-foreground">
                            Số: {degree.certificateNumber}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{degree.institution}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(degree.issueDate).toLocaleDateString('vi-VN')}
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
                          <span className="text-sm text-muted-foreground">Vô thời hạn</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {getStatusBadge(degree.status)}
                        {degree.status === 'REJECTED' && degree.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">
                            {degree.rejectionReason}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        {canEdit(degree) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFormModal(degree)}
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete(degree) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(degree)}
                            title="Xóa"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {!canEdit(degree) && !canDelete(degree) && (
                          <span className="text-xs text-muted-foreground px-2">
                            Không thể sửa
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Form Modal */}
      <DegreeFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        degree={selectedDegree}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bằng cấp "{degreeToDelete?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
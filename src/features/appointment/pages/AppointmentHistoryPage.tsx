// pages/hr/termination/TerminationPage.tsx

import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Search, Eye, ChevronLeft, ChevronRight, Plus, Edit, UserMinus } from 'lucide-react';
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
  mockTerminations, 
  type Termination, 
  calculateTerminationStatistics
} from '../../../mock/appointment';
import TerminationDetailModal from '../components/TerminationDetailModal';
import TerminationFormModal from '../components/TerminationFormModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

export default function TerminationPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [terminations, setTerminations] = useState<Termination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTermination, setSelectedTermination] = useState<Termination | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTerminationId, setSelectedTerminationId] = useState<string | null>(null);

  useEffect(() => {
    fetchTerminations();
  }, [page, pageSize, searchTerm, refreshKey, isAdmin]);

  const fetchTerminations = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockTerminations];

    // Nếu không phải admin, chỉ xem quyết định của chính mình
    if (!isAdmin && user?.id) {
      filtered = filtered.filter(t => t.employeeId === user.id);
    }

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.appointmentDecisionNumber && t.appointmentDecisionNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sắp xếp theo ngày quyết định mới nhất
    filtered.sort((a, b) => new Date(b.decisionDate).getTime() - new Date(a.decisionDate).getTime());

    setTotalItems(filtered.length);

    const start = page * pageSize;
    const end = start + pageSize;
    setTerminations(filtered.slice(start, end));

    setIsLoading(false);
  };

  const handleOpenFormModal = (termination?: Termination) => {
    setSelectedTermination(termination || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedTermination(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedTerminationId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTerminationId(null);
  };

  const handleDetailSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseDetailModal();
  };

  const stats = calculateTerminationStatistics(mockTerminations);
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Quản lý quyết định miễn nhiệm' : 'Quyết định miễn nhiệm của tôi'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Tạo và quản lý các quyết định miễn nhiệm nhân sự' 
              : 'Xem các quyết định miễn nhiệm liên quan đến bạn'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenFormModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo quyết định miễn nhiệm
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên, chức vụ, phòng ban hoặc số quyết định"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Chức vụ miễn nhiệm</TableHead>
                <TableHead>Số QĐ miễn nhiệm</TableHead>
                <TableHead>Số QĐ bổ nhiệm</TableHead>
                <TableHead>Ngày QĐ</TableHead>
                <TableHead>Ngày hiệu lực</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
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
              ) : terminations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UserMinus className="h-8 w-8" />
                      <p>Không tìm thấy quyết định miễn nhiệm nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                terminations.map((termination) => (
                  <TableRow key={termination.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{termination.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{termination.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{termination.position}</p>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{termination.decisionNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {termination.appointmentDecisionNumber || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(termination.decisionDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(termination.effectiveDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFormModal(termination)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(termination.id)}
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
        {!isLoading && terminations.length > 0 && (
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

      {isAdmin && (
        <TerminationFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          termination={selectedTermination}
          onSuccess={handleFormSuccess}
        />
      )}

      <TerminationDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        terminationId={selectedTerminationId}
        onSuccess={handleDetailSuccess}
        isAdmin={isAdmin}
      />
    </div>
  );
}
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import mockFamilyVisits, { visitTypes } from '@/mock/familyVisitData';
import familyVisitApi from '../api/familyVisitApi';
import FamilyVisitFormModal from '../components/VisitFormModal';
import FamilyVisitDetailModal from '../components/VisitDetailModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface FamilyVisit {
  id: number;
  employee: {
    id: number;
    code: string;
    fullName: string;
    department?: { id: number; name: string };
    position?: { id: number; name: string };
  };
  visitType: string;
  visitDate: string;
  visitPerson: string;
  relationShip: string;
  reason: string;
  giftAmount: number;
  giftDescription: string;
  notes?: string;
  visitedBy?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function FamilyVisitList() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [visits, setVisits] = useState<FamilyVisit[]>(mockFamilyVisits);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<FamilyVisit | null>(null);

  // Lọc dữ liệu
  const filteredVisits = useMemo(() => {
    let filtered = visits;

    // Nếu không phải admin, chỉ lấy dữ liệu của nhân viên hiện tại
    if (!isAdmin && user?.employeeId) {
      filtered = filtered.filter(v => v.employee.id === user.employeeId);
    }

    // Lọc theo tìm kiếm
    const text = searchTerm.toLowerCase();
    filtered = filtered.filter(visit => {
      const matchesSearch =
        visit.employee.fullName.toLowerCase().includes(text) ||
        visit.employee.code.toLowerCase().includes(text) ||
        visit.visitType.toLowerCase().includes(text);

      const matchesStatus =
        filterStatus === 'all' || visit.status === filterStatus;

      const matchesType =
        filterType === 'all' || visit.visitType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });

    return filtered;
  }, [visits, searchTerm, filterStatus, filterType, user, isAdmin]);

  // Phân trang
  const paginatedVisits = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVisits.slice(startIndex, endIndex);
  }, [filteredVisits, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);

  const handleAdd = () => {
    setSelectedVisit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (visit: FamilyVisit, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedVisit(visit);
    setIsFormModalOpen(true);
  };

  const handleViewDetail = (visit: FamilyVisit, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedVisit(visit);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa lượt thăm này?')) {
      try {
        await familyVisitApi.delete(id);
        setVisits(prev => prev.filter(v => v.id !== id));
        toast({
          title: 'Thành công',
          description: 'Đã xóa lượt thăm người thân',
        });
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: 'Không thể xóa lượt thăm',
          variant: 'destructive',
        });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const pageTitle = isAdmin ? 'Quản lý thăm người thân' : 'Lượt thăm người thân của tôi';
  const pageDescription = isAdmin
    ? 'Quản lý các lượt thăm hỏi người thân của tất cả nhân viên'
    : 'Xem các lượt thăm người thân của bạn';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm lượt thăm
          </Button>
        )}
      </div>

      {/* FILTERS */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isAdmin ? 'Tìm theo tên, mã nhân viên, loại thăm...' : 'Tìm theo loại thăm...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Loại thăm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {visitTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Đã thăm">Đã thăm</SelectItem>
              <SelectItem value="Chưa thăm">Chưa thăm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* TABLE */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-16">STT</TableHead>
                {isAdmin && <TableHead>Nhân viên</TableHead>}
                <TableHead>Loại thăm</TableHead>
                <TableHead>Người được thăm</TableHead>
                <TableHead>Ngày thăm</TableHead>
                <TableHead>Quà tặng</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center w-32">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVisits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p>Chưa có dữ liệu</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVisits.map((visit, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <TableRow key={visit.id}>
                      <TableCell className="text-center text-muted-foreground">
                        {globalIndex}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{visit.employee.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {visit.employee.code} • {visit.employee.department?.name}
                            </p>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant="outline">{visit.visitType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{visit.visitPerson}</p>
                          <p className="text-xs text-muted-foreground">{visit.relationShip}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{formatDate(visit.visitDate)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{formatCurrency(visit.giftAmount)}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={visit.status === 'Đã thăm' ? 'default' : 'secondary'}>
                          {visit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleViewDetail(visit, e)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleEdit(visit, e)}
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDelete(visit.id, e)}
                                title="Xóa"
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* PAGINATION */}
      {filteredVisits.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
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
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">mục</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                Đầu
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>

              <span className="text-sm px-3">
                Trang {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Cuối
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* MODALS */}
      <FamilyVisitFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedVisit(null);
        }}
        visit={selectedVisit}
        onSuccess={() => {
          setIsFormModalOpen(false);
          setSelectedVisit(null);
        }}
      />

      <FamilyVisitDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedVisit(null);
        }}
        visit={selectedVisit}
      />
    </div>
  );
}
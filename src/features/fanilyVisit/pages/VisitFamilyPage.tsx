import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
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
  Calendar,
  Gift,
} from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';
import mockFamilyVisits, { visitTypes } from '@/mock/familyVisitData';
import familyVisitApi from '../api/familyVisitApi';
import FamilyVisitFormModal from '../components/VisitFormModal';
import FamilyVisitDetailModal from '../components/VisitDetailModal';

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
  status: 'Đã thăm' | 'Chưa thăm';
  createdAt: string;
  updatedAt: string;
}

export default function FamilyVisitList() {
  const [visits, setVisits] = useState(mockFamilyVisits);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Lọc
  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      const text = searchTerm.toLowerCase();
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
  }, [visits, searchTerm, filterStatus, filterType]);

  // Phân trang
  const paginatedVisits = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVisits.slice(startIndex, endIndex);
  }, [filteredVisits, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thăm người thân</h1>
          <p className="text-muted-foreground">
            Quản lý các lượt thăm hỏi người thân của nhân viên
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, mã nhân viên, loại thăm..."
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

            <Button onClick={() => setIsFormModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="max-h-[calc(100vh-500px)] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="text-center p-3 text-sm font-semibold w-16">STT</th>
                <th className="text-left p-3 text-sm font-semibold">Nhân viên</th>
                <th className="text-left p-3 text-sm font-semibold">Loại thăm</th>
                <th className="text-left p-3 text-sm font-semibold">Người được thăm</th>
                <th className="text-left p-3 text-sm font-semibold">Ngày thăm</th>
                <th className="text-left p-3 text-sm font-semibold">Quà tặng</th>
                <th className="text-center p-3 text-sm font-semibold">Trạng thái</th>
                <th className="text-center p-3 text-sm font-semibold w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVisits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">Chưa có dữ liệu</p>
                  </td>
                </tr>
              ) : (
                paginatedVisits.map((visit, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr
                      key={visit.id}
                      className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedVisit(visits);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <td className="p-3 text-center text-sm text-muted-foreground">
                        {globalIndex}
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-sm">{visit.employee.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {visit.employee.code} • {visit.employee.department?.name}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{visit.visitType}</Badge>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm">{visit.visitPerson}</p>
                          <p className="text-xs text-muted-foreground">{visit.relationShip}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{formatDate(visit.visitDate)}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm font-medium">{formatCurrency(visit.giftAmount)}</p>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={visit.status === 'Đã thăm' ? 'default' : 'secondary'}>
                          {visit.status}
                        </Badge>
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVisit(visits);
                              setIsDetailModalOpen(true);
                            }}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVisit(visits);
                              setIsFormModalOpen(true);
                            }}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(visit.id, e)}
                            title="Xóa"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
      {filteredVisits.length > 0 && (
        <Card>
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

                <span className="text-sm px-4">
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
          </CardContent>
        </Card>
      )}
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
          // Refresh data
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
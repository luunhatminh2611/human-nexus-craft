import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
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
  Edit,
  Trash2,
  Users,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import RelativeFormModal from '../components/RelativeFormModal';
import DeleteRelativeConfirmModal from '../components/DeleteConnffirm';

/* ================= MOCK DATA ================= */

const mockEmployees = [
  { id: 1, code: 'NV001', fullName: 'Nguyễn Văn A', department: 'Hành chính' },
  { id: 2, code: 'NV002', fullName: 'Trần Thị B', department: 'Kế toán' },
  { id: 3, code: 'NV003', fullName: 'Lê Văn C', department: 'Kỹ thuật' },
];

const relationshipTypes = ['Cha', 'Mẹ', 'Vợ', 'Chồng', 'Con'];

const mockFamilies = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'Nguyễn Văn A',
    employeeCode: 'NV001',
    relationship: 'Vợ',
    familyName: 'Trần Thị Hoa',
    phone: '0912345678',
  },
  {
    id: 2,
    employeeId: 1,
    employeeName: 'Nguyễn Văn A',
    employeeCode: 'NV001',
    relationship: 'Con',
    familyName: 'Nguyễn Văn D',
    phone: '',
  },
  {
    id: 3,
    employeeId: 2,
    employeeName: 'Trần Thị B',
    employeeCode: 'NV002',
    relationship: 'Mẹ',
    familyName: 'Lê Thị M',
    phone: '0909123123',
  },
];

/* ============================================ */

export default function FamilyRelationshipList() {
  const [families, setFamilies] = useState(mockFamilies);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedFamily, setSelectedFamily] = useState(null);

  /* ===== FILTER ===== */
  const filteredFamilies = useMemo(() => {
    const text = searchTerm.toLowerCase();
    return families.filter(f => {
      const matchesSearch =
        f.employeeName.toLowerCase().includes(text) ||
        f.employeeCode.toLowerCase().includes(text) ||
        f.familyName.toLowerCase().includes(text);

      const matchesRelationship =
        filterRelationship === 'all' || f.relationship === filterRelationship;

      return matchesSearch && matchesRelationship;
    });
  }, [families, searchTerm, filterRelationship]);

  /* ===== PAGINATION ===== */
  const paginatedFamilies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFamilies.slice(start, start + itemsPerPage);
  }, [filteredFamilies, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredFamilies.length / itemsPerPage);

  const getRelationshipBadge = (type) => {
    const map = {
      Cha: 'bg-blue-100 text-blue-800',
      Mẹ: 'bg-pink-100 text-pink-800',
      Vợ: 'bg-purple-100 text-purple-800',
      Chồng: 'bg-purple-100 text-purple-800',
      Con: 'bg-green-100 text-green-800',
    };
    return <Badge className={map[type] || 'bg-gray-100'}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className="text-3xl font-bold">Quan hệ gia đình</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin thân nhân của toàn bộ nhân viên
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedFamily(null);
            setIsFormModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm quan hệ gia đình
        </Button>
      </div>

      {/* FILTER */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, mã NV, thân nhân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filterRelationship}
            onValueChange={setFilterRelationship}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Quan hệ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {relationshipTypes.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
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
                <TableHead>Nhân viên</TableHead>
                <TableHead>Thân nhân</TableHead>
                <TableHead>Quan hệ</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead className="text-center w-32">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFamilies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p>Chưa có dữ liệu</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFamilies.map((f, index) => {
                  const stt = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <TableRow key={f.id}>
                      <TableCell className="text-center text-muted-foreground">
                        {stt}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{f.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.employeeCode}
                        </p>
                      </TableCell>
                      <TableCell>{f.familyName}</TableCell>
                      <TableCell>{getRelationshipBadge(f.relationship)}</TableCell>
                      <TableCell>{f.phone || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFamily(f);
                              setIsFormModalOpen(true);
                            }}
                            title="Sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              setSelectedFamily(f);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
      {filteredFamilies.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(v) => {
                  setItemsPerPage(Number(v));
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
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                Đầu
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>

              <span className="px-3 text-sm">
                Trang {currentPage} / {totalPages}
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Cuối
              </Button>
            </div>
          </div>
        </Card>
      )}

      <RelativeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedFamily(null);
        }}
        relative={selectedFamily}
        onSuccess={() => {
          setIsFormModalOpen(false);
          setSelectedFamily(null);
        }}
      />
      <DeleteRelativeConfirmModal
        isOpen={isDeleteModalOpen}
        relativeName={selectedFamily?.familyName}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedFamily(null);
        }}
        onConfirm={() => {
          setFamilies(prev =>
            prev.filter(item => item.id !== selectedFamily.id)
          );
          setIsDeleteModalOpen(false);
          setSelectedFamily(null);
        }}
      />
    </div>
  );
}
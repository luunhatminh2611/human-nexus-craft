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
  Edit,
  Trash2,
  Users,
} from 'lucide-react';
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
    <div className="space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Quan hệ gia đình</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin thân nhân của toàn bộ nhân viên
        </p>
      </div>

      {/* FILTER */}
      <Card>
        <CardContent className="pt-6">
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

            <Button
              onClick={() => {
                setSelectedFamily(null);
                setIsFormModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm thân nhân
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="overflow-hidden">
        <div className="max-h-[calc(100vh-500px)] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="p-3 text-center w-16">STT</th>
                <th className="p-3 text-left">Nhân viên</th>
                <th className="p-3 text-left">Thân nhân</th>
                <th className="p-3 text-left">Quan hệ</th>
                <th className="p-3 text-left">SĐT</th>
                <th className="p-3 text-center w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFamilies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">Chưa có dữ liệu</p>
                  </td>
                </tr>
              ) : (
                paginatedFamilies.map((f, index) => {
                  const stt =
                    (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr
                      key={f.id}
                      className="border-b hover:bg-muted/50 transition"
                    >
                      <td className="p-3 text-center text-muted-foreground">
                        {stt}
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-sm">{f.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.employeeCode}
                        </p>
                      </td>
                      <td className="p-3">{f.familyName}</td>
                      <td className="p-3">{getRelationshipBadge(f.relationship)}</td>
                      <td className="p-3">{f.phone || '-'}</td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsFormModalOpen(true);
                            }}
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

      {/* PAGINATION */}
      {filteredFamilies.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
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
          </CardContent>
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
          // sau này gọi lại API getAll
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

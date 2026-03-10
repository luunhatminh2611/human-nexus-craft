import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
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
import { familyApi, FamilyMember } from '../../employees/api/family';
import BulkAddFamilyModal from '../components/BulkAddFamilyModal';

const relationshipTypes = ['Cha', 'Mẹ', 'Vợ', 'Chồng', 'Con', 'Anh', 'Chị', 'Em', 'Khác'];

export default function FamilyRelationshipList() {
  const [families, setFamilies] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FamilyMember | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      setIsLoading(true);
      const data = await familyApi.getAll();
      setFamilies(data || []);
    } catch (e) {
      console.error('Lỗi lấy danh sách quan hệ gia đình', e);
      setFamilies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFamily) return;
    try {
      await familyApi.delete(selectedFamily.id);
      await fetchFamilies();
    } catch (e) {
      console.error('Lỗi xóa thân nhân', e);
      alert('Không thể xóa thân nhân. Vui lòng thử lại.');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedFamily(null);
    }
  };

  /* ===== FILTER ===== */
  const filteredFamilies = useMemo(() => {
    const text = searchTerm.toLowerCase();
    return families.filter(f => {
      const matchesSearch =
        f.name?.toLowerCase().includes(text) ||
        f.phone?.toLowerCase().includes(text) ||
        f.address?.toLowerCase().includes(text);

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

  const getRelationshipBadge = (type: string) => {
    const map: Record<string, string> = {
      Cha: 'bg-blue-100 text-blue-800',
      Mẹ: 'bg-pink-100 text-pink-800',
      Vợ: 'bg-purple-100 text-purple-800',
      Chồng: 'bg-purple-100 text-purple-800',
      Con: 'bg-green-100 text-green-800',
    };
    return <Badge className={map[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quan hệ gia đình</h1>
          <p className="text-muted-foreground">Quản lý thông tin thân nhân của toàn bộ nhân viên</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => { setSelectedFamily(null); setIsFormModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm quan hệ gia đình
          </Button>
          <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
              <Users className="h-4 w-4 mr-2" /> Thêm hàng loạt
            </Button>
        </div>
      </div>

      {/* FILTER */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, SĐT, địa chỉ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRelationship} onValueChange={setFilterRelationship}>
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
                <TableHead>Tên thân nhân</TableHead>
                <TableHead>Quan hệ</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead className="text-center w-32">Thao tác</TableHead>
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
              ) : paginatedFamilies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
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
                      <TableCell className="text-center text-muted-foreground">{stt}</TableCell>
                      <TableCell className="font-medium text-sm">{f.name}</TableCell>
                      <TableCell>{getRelationshipBadge(f.relationship)}</TableCell>
                      <TableCell className="text-sm">{f.birthday || '-'}</TableCell>
                      <TableCell className="text-sm">{f.phone || '-'}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{f.address || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => { setSelectedFamily(f); setIsFormModalOpen(true); }}
                            title="Sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="text-destructive"
                            onClick={() => { setSelectedFamily(f); setIsDeleteModalOpen(true); }}
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
                onValueChange={v => { setItemsPerPage(Number(v)); setCurrentPage(1); }}
              >
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">mục</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>Đầu</Button>
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Trước</Button>
              <span className="px-3 text-sm">Trang {currentPage} / {totalPages}</span>
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Sau</Button>
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Cuối</Button>
            </div>
          </div>
        </Card>
      )}

      <RelativeFormModal
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setSelectedFamily(null); }}
        relative={selectedFamily}
        onSuccess={() => { fetchFamilies(); setIsFormModalOpen(false); setSelectedFamily(null); }}
      />

      <BulkAddFamilyModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={fetchFamilies}
      />
      <DeleteRelativeConfirmModal
        isOpen={isDeleteModalOpen}
        relativeName={selectedFamily?.name}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedFamily(null); }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
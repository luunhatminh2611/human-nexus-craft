import { useEffect, useState, useMemo } from 'react';
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
  Edit,
  Trash2,
  Users,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import FamilyModal from '../../employees/components/modal/FamilyModal';
import { familyApi } from '../../employees/api/family';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

const relationshipTypes = ['Cha', 'Mẹ', 'Vợ', 'Chồng', 'Con'];
const MAX_FAMILY_MEMBERS = 2;

export default function MyFamilyMembersPage() {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [mode, setMode] = useState('create');

  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.employeeId) {
      fetchFamilyMembers();
    }
  }, [user?.employeeId]);

  const fetchFamilyMembers = async () => {
    try {
      setIsLoading(true);
      const res = await familyApi.getByEmployeeId(user?.employeeId);
      setFamilyMembers(res || []);
    } catch (e) {
      console.error('Lỗi lấy thông tin thân nhân', e);
      setFamilyMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFamilies = useMemo(() => {
    const text = searchTerm.toLowerCase();
    return familyMembers.filter(f => {
      const matchesSearch =
        f.name?.toLowerCase().includes(text) ||
        f.phone?.toLowerCase().includes(text);

      const matchesRelationship =
        filterRelationship === 'all' || f.relationship === filterRelationship;

      return matchesSearch && matchesRelationship;
    });
  }, [familyMembers, searchTerm, filterRelationship]);

  const paginatedFamilies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFamilies.slice(start, start + itemsPerPage);
  }, [filteredFamilies, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredFamilies.length / itemsPerPage);

  const canAddMore = familyMembers.length < MAX_FAMILY_MEMBERS;

  const handleAdd = () => {
    setMode('create');
    setSelectedFamily(null);
    setIsFamilyModalOpen(true);
  };

  const handleEdit = (member) => {
    setMode('edit');
    setSelectedFamily(member);
    setIsFamilyModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thông tin thân nhân này?')) return;
    try {
      await familyApi.delete(id);
      fetchFamilyMembers();
    } catch (e) {
      console.error('Lỗi xóa thân nhân', e);
      alert('Không thể xóa thân nhân. Vui lòng thử lại.');
    }
  };

  const getRelationshipBadge = (relationship) => {
    const map = {
      Cha: 'bg-blue-100 text-blue-800',
      Mẹ: 'bg-pink-100 text-pink-800',
      Vợ: 'bg-purple-100 text-purple-800',
      Chồng: 'bg-purple-100 text-purple-800',
      Con: 'bg-green-100 text-green-800',
    };
    return <Badge className={map[relationship] || 'bg-gray-100'}>{relationship}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thông tin thân nhân của tôi</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin thân nhân của bạn
          </p>
        </div>
      </div>

      {/* Info banner */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Thông tin quan trọng</p>
            <p>Bạn có thể quản lý tối đa {MAX_FAMILY_MEMBERS} thành viên gia đình. Nếu cần thay đổi thông tin, vui lòng liên hệ với phòng Nhân sự.</p>
          </div>
        </div>
      </Card>

      {/* Limit warning */}
      {!canAddMore && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-medium">Đã đạt giới hạn</p>
              <p>Bạn đã thêm tối đa {MAX_FAMILY_MEMBERS} thành viên gia đình. Để thêm thành viên mới, vui lòng xóa một thành viên cũ.</p>
            </div>
          </div>
        </Card>
      )}

      {/* FILTER */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên thân nhân hoặc SĐT..."
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
              <SelectItem value="all">Tất cả quan hệ</SelectItem>
              {relationshipTypes.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleAdd}
            disabled={!canAddMore}
            title={!canAddMore ? `Đã đạt giới hạn ${MAX_FAMILY_MEMBERS} thành viên` : ''}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm thân nhân
          </Button>
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
                <TableHead>Số điện thoại</TableHead>
                <TableHead className="text-center w-32">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedFamilies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p>Chưa có thông tin thân nhân</p>
                      <p className="text-sm">Nhấn "Thêm thân nhân" để bắt đầu</p>
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
                        <span className="text-sm font-medium">{f.name}</span>
                      </TableCell>
                      <TableCell>
                        {getRelationshipBadge(f.relationship)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{f.phone || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(f)}
                            title="Sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(f.id)}
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

      {/* FAMILY MODAL */}
      <FamilyModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        employeeId={user?.employeeId}
        familyData={selectedFamily}
        mode={mode}
        onSuccess={fetchFamilyMembers}
      />
    </div>
  );
}
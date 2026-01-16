// pages/hr/reward/RewardPage.tsx

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
import { Search, Eye, ChevronLeft, ChevronRight, Plus, Edit, Award, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import RewardDetailModal from '../components/RewardApprovalModal';
import RewardFormModal from '../components/RewardFormModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import { decisionApi, DecisionType, type DecisionResponse } from '@/features/employees/api/decisionApi';

export default function RewardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [rewards, setRewards] = useState<DecisionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<DecisionResponse | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);

  // Lấy danh sách phòng ban từ chi tiết quyết định
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchRewards();
  }, [page, pageSize, searchTerm, departmentFilter, refreshKey]);

  const fetchRewards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Gọi API để lấy tất cả quyết định khen thưởng
      const allRewards = await decisionApi.getAll({
        title: searchTerm || undefined,
      });

      // Filter chỉ lấy quyết định khen thưởng (REWARD)
      let filtered = allRewards.filter(
        (r: DecisionResponse) => r.decisionType === DecisionType.REWARD
      );

      // Lấy danh sách phòng ban từ chi tiết quyết định
      const uniqueDepartments = Array.from(
        new Set(
          filtered
            .map((r: DecisionResponse) => r.details?.department)
            .filter(Boolean)
        )
      ) as string[];
      setDepartments(uniqueDepartments);

      // Filter theo phòng ban nếu được chọn
      if (departmentFilter !== 'ALL') {
        filtered = filtered.filter(
          (r: DecisionResponse) => r.details?.department === departmentFilter
        );
      }

      // Filter theo tìm kiếm
      if (searchTerm) {
        filtered = filtered.filter((r: DecisionResponse) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            r.title?.toLowerCase().includes(searchLower) ||
            r.decisionNumber.toLowerCase().includes(searchLower) ||
            r.details?.rewardReason?.toLowerCase().includes(searchLower) ||
            r.details?.achievement?.toLowerCase().includes(searchLower)
          );
        });
      }

      setTotalItems(filtered.length);

      // Pagination
      const start = page * pageSize;
      const end = start + pageSize;
      setRewards(filtered.slice(start, end));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Lỗi khi tải danh sách quyết định khen thưởng'
      );
      console.error('Lỗi fetch rewards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFormModal = (reward?: DecisionResponse) => {
    setSelectedReward(reward || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedReward(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: number) => {
    setSelectedRewardId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRewardId(null);
  };

  const formatCurrency = (amount: number | string | undefined) => {
    if (!amount) return 'N/A';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'N/A';
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý khen thưởng</h1>
          <p className="text-muted-foreground">
            Quản lý quyết định khen thưởng của nhân viên
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenFormModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo quyết định khen thưởng
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Lỗi</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchRewards()}
              className="ml-auto"
            >
              Thử lại
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề, số quyết định, lý do hoặc thành tích"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="pl-10"
            />
          </div>

          <Select value={departmentFilter} onValueChange={(value) => {
            setDepartmentFilter(value);
            setPage(0);
          }}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
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
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Số quyết định</TableHead>
                <TableHead>Ngày quyết định</TableHead>
                <TableHead>Loại khen thưởng</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Mức thưởng</TableHead>
                <TableHead>Người tạo</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
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
              ) : rewards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Award className="h-8 w-8" />
                      <p>Không tìm thấy quyết định khen thưởng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-1">{reward.title || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{reward.decisionNumber}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(reward.decisionDate)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{reward.details?.rewardType || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[250px] line-clamp-2">
                        {reward.details?.rewardReason || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {formatCurrency(reward.details?.rewardValue)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{reward.createdBy || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFormModal(reward)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(reward.id)}
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
        {!isLoading && rewards.length > 0 && (
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

      {selectedRewardId && (
        <RewardDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          rewardId={selectedRewardId.toString()}
        />
      )}

      {isAdmin && (
        <RewardFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          reward={selectedReward}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
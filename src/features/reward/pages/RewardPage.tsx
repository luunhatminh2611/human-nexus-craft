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
import { Search, Eye, ChevronLeft, ChevronRight, Plus, Edit, Award } from 'lucide-react';
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
  mockRewards, 
  type Reward, 
  calculateRewardStatistics,
} from '../../../mock/reward';
import RewardDetailModal from '../components/RewardApprovalModal';
import RewardFormModal from '../components/RewardFormModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

export default function RewardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, [page, pageSize, searchTerm, departmentFilter, refreshKey]);

  const fetchRewards = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockRewards];

    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter(r => r.departmentName === departmentFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.rewardType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.achievement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setTotalItems(filtered.length);

    const start = page * pageSize;
    const end = start + pageSize;
    setRewards(filtered.slice(start, end));

    setIsLoading(false);
  };

  const handleOpenFormModal = (reward?: Reward) => {
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

  const handleOpenDetailModal = (id: string) => {
    setSelectedRewardId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRewardId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const stats = calculateRewardStatistics(mockRewards);
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  const departments = Array.from(new Set(mockRewards.map(r => r.departmentName)));

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

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên, loại khen thưởng, thành tích hoặc số quyết định"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
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
                <TableHead>Nhân viên</TableHead>
                <TableHead>Loại khen thưởng</TableHead>
                <TableHead>Thành tích</TableHead>
                <TableHead>Số quyết định</TableHead>
                <TableHead>Ngày quyết định</TableHead>
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
                        <p className="font-medium">{reward.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{reward.departmentName}</p>
                        <p className="text-xs text-muted-foreground">{reward.position}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{reward.rewardType}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[250px] line-clamp-2">{reward.achievement}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{reward.decisionNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(reward.decisionDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {formatCurrency(reward.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{reward.createdBy}</p>
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

      <RewardDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        rewardId={selectedRewardId}
      />

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
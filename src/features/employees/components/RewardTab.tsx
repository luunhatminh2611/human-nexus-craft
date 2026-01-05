// components/RewardTab.tsx

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
import { 
  mockRewards, 
  type Reward, 
  statusLabels 
} from '../../../mock/reward';
import RewardApprovalModal from '../../../features/reward/components/RewardApprovalModal';
import RewardFormModal from '../../../features/reward/components/RewardFormModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface RewardTabProps {
  employeeId: number;
  userData?: any;
}

export default function RewardTab({ employeeId, userData }: RewardTabProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, [page, pageSize, searchTerm, statusFilter, refreshKey, employeeId]);

  const fetchRewards = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter rewards for this specific employee
    let filtered = mockRewards.filter(r => 
      r.employeeId === employeeId.toString()
    );

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.rewardType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.achievement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.decisionNumber && r.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleOpenApprovalModal = (id: string) => {
    setSelectedRewardId(id);
    setIsApprovalModalOpen(true);
  };

  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setSelectedRewardId(null);
  };

  const handleApprovalSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseApprovalModal();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: statusLabels.DRAFT, className: 'bg-gray-100 text-gray-800' },
      'PENDING': { label: statusLabels.PENDING, className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: statusLabels.APPROVED, className: 'bg-green-100 text-green-800' },
      'REJECTED': { label: statusLabels.REJECTED, className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className='flex items-center'>
          <h3 className="font-semibold text-lg text-blue-600 text-center">I. Danh sách quyết định khen thưởng của {userData?.fullName || userData?.name}</h3>
        </div>
        <Button onClick={() => handleOpenFormModal()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Thêm khen thưởng
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo loại khen thưởng, thành tích hoặc số quyết định"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
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
                <TableHead>Loại khen thưởng</TableHead>
                <TableHead>Thành tích</TableHead>
                <TableHead>Người đề xuất</TableHead>
                <TableHead>Ngày đề xuất</TableHead>
                <TableHead>Số QĐ</TableHead>
                <TableHead>Mức thưởng</TableHead>
                <TableHead>Trạng thái</TableHead>
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
                      <p>Chưa có khen thưởng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>
                      <span className="font-medium text-sm">{reward.rewardType}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[250px] line-clamp-2">{reward.achievement}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{reward.proposedBy}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(reward.proposedDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {reward.decisionNumber ? (
                        <div className="text-sm">
                          <div className="font-medium">{reward.decisionNumber}</div>
                          <div className="text-muted-foreground">
                            {reward.decisionDate && new Date(reward.decisionDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {reward.proposedAmount && (
                          <div className="text-muted-foreground">
                            ĐX: {formatCurrency(reward.proposedAmount)}
                          </div>
                        )}
                        {reward.approvedAmount && (
                          <div className="font-medium text-green-600">
                            Duyệt: {formatCurrency(reward.approvedAmount)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reward.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {(reward.status === 'DRAFT' || !isAdmin) && (
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
                          onClick={() => handleOpenApprovalModal(reward.id)}
                          title={isAdmin ? "Xem và phê duyệt" : "Xem chi tiết"}
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

      <RewardApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={handleCloseApprovalModal}
        rewardId={selectedRewardId}
        onSuccess={handleApprovalSuccess}
        isAdmin={isAdmin}
      />

      <RewardFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        reward={selectedReward}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
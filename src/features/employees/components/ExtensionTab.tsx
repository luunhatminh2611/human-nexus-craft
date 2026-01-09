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
import { Search, Eye, Plus, Edit, FileClock } from 'lucide-react';
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
  mockExtensionDecisions, 
  type ExtensionDecision,
  extensionDecisionTypeLabels,
} from '../../../mock/contractDecision';
import ExtensionDecisionDetailModal from '../../../features/contracDecision/components/ExtensionDecisionDetailModal';
import ExtensionDecisionFormModal from '../../../features/contracDecision/components/ExtensionDecisionModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface ExtensionTabProps {
  userData: any;
  employeeId: number | string;
}

export default function ExtensionTab({ userData, employeeId }: ExtensionTabProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXTEND' | 'RENEW'>('ALL');
  const [decisions, setDecisions] = useState<ExtensionDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<ExtensionDecision | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  useEffect(() => {
    fetchDecisions();
  }, [employeeId, searchTerm, typeFilter, refreshKey]);

  const fetchDecisions = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter decisions for this specific employee
    let filtered = mockExtensionDecisions.filter(d => 
      d.employeeId === employeeId.toString()
    );

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(d => d.decisionType === typeFilter);
    }

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.decisionNumber.toLowerCase().includes(keyword) ||
        d.reason.toLowerCase().includes(keyword)
      );
    }

    // Sort by decision date (newest first)
    filtered.sort((a, b) => new Date(b.decisionDate).getTime() - new Date(a.decisionDate).getTime());

    setDecisions(filtered);
    setIsLoading(false);
  };

  const handleOpenFormModal = (decision?: ExtensionDecision) => {
    setSelectedDecision(decision || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedDecision(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedDecisionId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDecisionId(null);
  };

  const getTypeBadge = (type: ExtensionDecision['decisionType']) => {
    const config = {
      EXTEND: {
        label: extensionDecisionTypeLabels.EXTEND,
        className: 'bg-blue-100 text-blue-800',
      },
      RENEW: {
        label: extensionDecisionTypeLabels.RENEW,
        className: 'bg-purple-100 text-purple-800',
      },
    };

    return (
      <Badge className={config[type].className}>
        {config[type].label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo số quyết định hoặc lý do"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as 'ALL' | 'EXTEND' | 'RENEW')}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Loại quyết định" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="EXTEND">Gia hạn</SelectItem>
              <SelectItem value="RENEW">Tái ký</SelectItem>
            </SelectContent>
          </Select>

          {isAdmin && (
            <Button onClick={() => handleOpenFormModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo quyết định
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại</TableHead>
                <TableHead>Số quyết định</TableHead>
                <TableHead>Ngày quyết định</TableHead>
                <TableHead>Ngày hiệu lực</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Ngày hết hạn mới</TableHead>
                <TableHead>File đính kèm</TableHead>
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
              ) : decisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileClock className="h-8 w-8" />
                      <p>Nhân viên này chưa có quyết định gia hạn/tái ký nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                decisions.map((decision) => (
                  <TableRow key={decision.id} className="hover:bg-muted/50">
                    <TableCell>
                      {getTypeBadge(decision.decisionType)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{decision.decisionNumber}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(decision.decisionDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(decision.effectiveDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-blue-600">
                        {decision.termMonths} tháng
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-green-600">
                        {new Date(decision.newExpiryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {decision.attachments && decision.attachments.length > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          {decision.attachments.length} file
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Không có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFormModal(decision)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(decision.id)}
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
      </Card>

      {/* Modals */}
      <ExtensionDecisionDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        decisionId={selectedDecisionId}
      />

      <ExtensionDecisionFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        decision={selectedDecision}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
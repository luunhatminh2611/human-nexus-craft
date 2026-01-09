import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Search, Eye, Plus, Edit, FileX } from 'lucide-react';
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
  mockTerminationDecisions, 
  type TerminationDecision,
} from '../../../mock/contractDecision';
import TerminationDecisionDetailModal from '../../../features/contracDecision/components/ExtensionDecisionDetailModal';
import TerminationDecisionFormModal from '../../../features/contracDecision/components/TerminationFormModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface TerminationTabProps {
  userData: any;
  employeeId: number | string;
}

export default function TerminationTab({ userData, employeeId }: TerminationTabProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [decisions, setDecisions] = useState<TerminationDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<TerminationDecision | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  useEffect(() => {
    fetchDecisions();
  }, [employeeId, searchTerm, refreshKey]);

  const fetchDecisions = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter decisions for this specific employee
    let filtered = mockTerminationDecisions.filter(d => 
      d.employeeId === employeeId.toString()
    );

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.reason.toLowerCase().includes(keyword) ||
        d.decisionNumber.toLowerCase().includes(keyword)
      );
    }

    // Sort by decision date (newest first)
    filtered.sort((a, b) => new Date(b.decisionDate).getTime() - new Date(a.decisionDate).getTime());

    setDecisions(filtered);
    setIsLoading(false);
  };

  const handleOpenFormModal = (decision?: TerminationDecision) => {
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo lý do hoặc số quyết định"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

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
                <TableHead>Số quyết định</TableHead>
                <TableHead>Ngày quyết định</TableHead>
                <TableHead>Ngày hiệu lực</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>File đính kèm</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : decisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileX className="h-8 w-8" />
                      <p>Nhân viên này chưa có quyết định chấm dứt hợp đồng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                decisions.map((decision) => (
                  <TableRow key={decision.id} className="hover:bg-muted/50">
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
                      <span className="text-sm max-w-[300px] line-clamp-2">
                        {decision.reason}
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
      <TerminationDecisionDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        decisionId={selectedDecisionId}
      />

      <TerminationDecisionFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        decision={selectedDecision}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
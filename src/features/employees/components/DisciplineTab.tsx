// components/DisciplineTab.tsx

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
import { Search, Eye, Plus, Edit, FileText } from 'lucide-react';
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
  mockDisciplines, 
  type Discipline,
  statusLabels,
  severityLabels,
  actionLabels
} from '../../../mock/dismissed';
import DisciplineDetailModal from '../../../features/discipline/components/DisciplineDetailModal';
import DisciplineFormModal from '../../../features/discipline/components/DisciplineFormModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface DisciplineTabProps {
  userData: any;
  employeeId: number | string;
}

export default function DisciplineTab({ userData, employeeId }: DisciplineTabProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string | null>(null);

  useEffect(() => {
    fetchDisciplines();
  }, [employeeId, searchTerm, statusFilter, severityFilter, refreshKey]);

  const fetchDisciplines = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter disciplines for this specific employee
    let filtered = mockDisciplines.filter(d => 
      d.employeeId === employeeId.toString()
    );

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (severityFilter !== 'ALL') {
      filtered = filtered.filter(d => d.severity === severityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.violationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.violationDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.decisionNumber && d.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort by violation date (newest first)
    filtered.sort((a, b) => new Date(b.violationDate).getTime() - new Date(a.violationDate).getTime());

    setDisciplines(filtered);
    setIsLoading(false);
  };

  const handleOpenFormModal = (discipline?: Discipline) => {
    setSelectedDiscipline(discipline || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedDiscipline(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedDisciplineId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDisciplineId(null);
  };

  const handleDetailSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseDetailModal();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: statusLabels.DRAFT, className: 'bg-gray-100 text-gray-800' },
      'ACTIVE': { label: statusLabels.ACTIVE, className: 'bg-green-100 text-green-800' },
      'EXPIRED': { label: statusLabels.EXPIRED, className: 'bg-gray-100 text-gray-600' },
    };

    const config = statusConfig[status] || { label: status, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      'LIGHT': { label: severityLabels.LIGHT, className: 'bg-blue-100 text-blue-800' },
      'MEDIUM': { label: severityLabels.MEDIUM, className: 'bg-orange-100 text-orange-800' },
      'SERIOUS': { label: severityLabels.SERIOUS, className: 'bg-red-100 text-red-800' },
    };

    const config = severityConfig[severity] || { label: severity, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      'WARNING': { label: actionLabels.WARNING, className: 'bg-yellow-100 text-yellow-800' },
      'REPRIMAND': { label: actionLabels.REPRIMAND, className: 'bg-orange-100 text-orange-800' },
      'SALARY_CUT': { label: actionLabels.SALARY_CUT, className: 'bg-red-100 text-red-800' },
      'DEMOTION': { label: actionLabels.DEMOTION, className: 'bg-purple-100 text-purple-800' },
      'TERMINATION': { label: actionLabels.TERMINATION, className: 'bg-red-200 text-red-900' },
    };

    const config = actionConfig[action] || { label: action, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Calculate statistics for this employee
  const stats = {
    total: disciplines.length,
    active: disciplines.filter(d => d.status === 'ACTIVE').length,
    draft: disciplines.filter(d => d.status === 'DRAFT').length,
    expired: disciplines.filter(d => d.status === 'EXPIRED').length,
  };

  return (
    <div className="space-y-4">

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo loại vi phạm, mô tả hoặc số quyết định"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Mức độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả mức độ</SelectItem>
              <SelectItem value="LIGHT">Nhẹ</SelectItem>
              <SelectItem value="MEDIUM">Trung bình</SelectItem>
              <SelectItem value="SERIOUS">Nghiêm trọng</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Đang hiệu lực</SelectItem>
              <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
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
                <TableHead>Loại vi phạm</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>Ngày vi phạm</TableHead>
                <TableHead>Hình thức KL</TableHead>
                <TableHead>Số QĐ</TableHead>
                <TableHead>Ngày QĐ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : disciplines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Nhân viên này chưa có quyết định kỷ luật nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                disciplines.map((discipline) => (
                  <TableRow key={discipline.id} className="hover:bg-muted/50">
                    <TableCell>
                      <span className="font-medium text-sm">{discipline.violationType}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[250px] line-clamp-2">
                        {discipline.violationDescription}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(discipline.severity)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(discipline.violationDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {discipline.disciplineAction ? (
                        getActionBadge(discipline.disciplineAction)
                      ) : (
                        <span className="text-sm text-muted-foreground">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {discipline.decisionNumber ? (
                        <span className="text-sm font-medium">{discipline.decisionNumber}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {discipline.decisionDate ? (
                        <span className="text-sm">
                          {new Date(discipline.decisionDate).toLocaleDateString('vi-VN')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(discipline.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {discipline.status === 'DRAFT' && isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFormModal(discipline)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(discipline.id)}
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
      <DisciplineDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        disciplineId={selectedDisciplineId}
        onSuccess={handleDetailSuccess}
      />

      <DisciplineFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        discipline={selectedDiscipline}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
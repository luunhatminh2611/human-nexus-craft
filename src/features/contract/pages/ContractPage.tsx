// pages/hr/contract/ContractPage.tsx

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
import { Search, Eye, ChevronLeft, ChevronRight, Plus, Edit, FileText, AlertCircle, Trash2 } from 'lucide-react';
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
  mockContracts, 
  type Contract,
  calculateContractStatistics,
  getActiveContracts,
  getInactiveContracts,
  statusLabels,
  contractTypeLabels,
  getDaysUntilExpiry
} from '../../../mock/contract';
import ContractFormModal from '../components/ContractFormModal';
import ContractDetailModal from '../components/ContractDetailModal';
import RenewalModal from '../components/RenewalModal';
import SuspendTerminateModal from '../components/SuspendTerminateModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

export default function ContractPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [renewalContract, setRenewalContract] = useState<Contract | null>(null);

  const [isSuspendTerminateModalOpen, setIsSuspendTerminateModalOpen] = useState(false);
  const [suspendTerminateContract, setSuspendTerminateContract] = useState<Contract | null>(null);
  const [suspendTerminateAction, setSuspendTerminateAction] = useState<'suspend' | 'terminate'>('suspend');

  useEffect(() => {
    fetchContracts();
  }, [page, pageSize, searchTerm, typeFilter, statusFilter, departmentFilter, refreshKey, activeTab]);

  const fetchContracts = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Lọc theo tab
    let filtered = activeTab === 'active' 
      ? getActiveContracts(mockContracts)
      : getInactiveContracts(mockContracts);

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(c => c.contractType === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter(c => c.departmentName === departmentFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setTotalItems(filtered.length);

    const start = page * pageSize;
    const end = start + pageSize;
    setContracts(filtered.slice(start, end));

    setIsLoading(false);
  };

  const handleOpenFormModal = (contract?: Contract) => {
    setSelectedContract(contract || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedContract(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedContractId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedContractId(null);
  };

  const handleOpenRenewalModal = (contract: Contract) => {
    setRenewalContract(contract);
    setIsRenewalModalOpen(true);
  };

  const handleCloseRenewalModal = () => {
    setIsRenewalModalOpen(false);
    setRenewalContract(null);
  };

  const handleRenewalSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseRenewalModal();
  };

  const handleOpenSuspendTerminateModal = (contract: Contract, action: 'suspend' | 'terminate') => {
    setSuspendTerminateContract(contract);
    setSuspendTerminateAction(action);
    setIsSuspendTerminateModalOpen(true);
  };

  const handleCloseSuspendTerminateModal = () => {
    setIsSuspendTerminateModalOpen(false);
    setSuspendTerminateContract(null);
  };

  const handleSuspendTerminateSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseSuspendTerminateModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      console.log('Delete contract:', id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { label: statusLabels.ACTIVE, className: 'bg-green-100 text-green-800' },
      'EXPIRING_SOON': { label: statusLabels.EXPIRING_SOON, className: 'bg-orange-100 text-orange-800' },
      'EXPIRED': { label: statusLabels.EXPIRED, className: 'bg-red-100 text-red-800' },
      'SUSPENDED': { label: statusLabels.SUSPENDED, className: 'bg-yellow-100 text-yellow-800' },
      'TERMINATED': { label: statusLabels.TERMINATED, className: 'bg-gray-100 text-gray-800' },
      'RENEWED': { label: statusLabels.RENEWED, className: 'bg-blue-100 text-blue-800' },
      'REPLACED': { label: statusLabels.REPLACED, className: 'bg-purple-100 text-purple-800' },
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

  const departments = Array.from(new Set(mockContracts.map(c => c.departmentName)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Hợp đồng</h1>
          <p className="text-muted-foreground">
            Quản lý hợp đồng lao động của nhân viên
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenFormModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo hợp đồng mới
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setActiveTab('active');
            setPage(0);
          }}
        >
          Hợp đồng hiệu lực
          <Badge className="ml-2 bg-green-100 text-green-800">
            {getActiveContracts(mockContracts).length}
          </Badge>
        </button>
        <button
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'inactive'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setActiveTab('inactive');
            setPage(0);
          }}
        >
          Hợp đồng hết hiệu lực
          <Badge className="ml-2 bg-gray-100 text-gray-800">
            {getInactiveContracts(mockContracts).length}
          </Badge>
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên, số hợp đồng, vị trí"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Loại hợp đồng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="INDEFINITE">Không xác định TH</SelectItem>
              <SelectItem value="DEFINITE_1_YEAR">Xác định TH - 1 năm</SelectItem>
              <SelectItem value="DEFINITE_2_YEAR">Xác định TH - 2 năm</SelectItem>
              <SelectItem value="DEFINITE_3_YEAR">Xác định TH - 3 năm</SelectItem>
              <SelectItem value="PROBATION">Thử việc</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {activeTab === 'active' ? (
                <>
                  <SelectItem value="ACTIVE">Đang hiệu lực</SelectItem>
                  <SelectItem value="EXPIRING_SOON">Sắp hết hạn</SelectItem>
                  <SelectItem value="SUSPENDED">Tạm hoãn</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
                  <SelectItem value="TERMINATED">Đã chấm dứt</SelectItem>
                  <SelectItem value="RENEWED">Đã gia hạn</SelectItem>
                  <SelectItem value="REPLACED">Đã thay thế</SelectItem>
                </>
              )}
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
                <TableHead>Số hợp đồng</TableHead>
                <TableHead>Loại hợp đồng</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Lương cơ bản</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Cảnh báo</TableHead>
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
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Không tìm thấy hợp đồng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => {
                  const daysLeft = getDaysUntilExpiry(contract.endDate);
                  return (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contract.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{contract.departmentName}</p>
                          <p className="text-xs text-muted-foreground">{contract.position}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm">{contract.contractNumber}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{contractTypeLabels[contract.contractType]}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(contract.startDate).toLocaleDateString('vi-VN')}</div>
                          <div className="text-muted-foreground">
                            {contract.endDate 
                              ? new Date(contract.endDate).toLocaleDateString('vi-VN')
                              : 'Không xác định'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{formatCurrency(contract.baseSalary)}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contract.status)}
                      </TableCell>
                      <TableCell>
                        {daysLeft !== null && daysLeft >= 0 && daysLeft <= 30 && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">Còn {daysLeft} ngày</span>
                          </div>
                        )}
                        {contract.status === 'EXPIRED' && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">Cần gia hạn</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          {isAdmin && activeTab === 'active' && contract.status !== 'SUSPENDED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenFormModal(contract)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetailModal(contract.id)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {isAdmin && activeTab === 'inactive' && 
                           (contract.status === 'EXPIRED' || contract.status === 'EXPIRING_SOON') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenRenewalModal(contract)}
                              title="Gia hạn/Tái ký"
                              className="text-green-600 hover:text-green-700"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}

                          {isAdmin && activeTab === 'active' && 
                           (contract.status === 'ACTIVE' || contract.status === 'EXPIRING_SOON') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenSuspendTerminateModal(contract, 'suspend')}
                                title="Tạm hoãn"
                                className="text-yellow-600 hover:text-yellow-700"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenSuspendTerminateModal(contract, 'terminate')}
                                title="Chấm dứt"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {isAdmin && contract.status !== 'ACTIVE' && contract.status !== 'EXPIRING_SOON' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(contract.id)}
                              title="Xóa"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && contracts.length > 0 && (
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

      <ContractFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        contract={selectedContract}
        onSuccess={handleFormSuccess}
      />

      <ContractDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        contractId={selectedContractId}
      />

      <RenewalModal
        isOpen={isRenewalModalOpen}
        onClose={handleCloseRenewalModal}
        contract={renewalContract}
        onSuccess={handleRenewalSuccess}
      />

      <SuspendTerminateModal
        isOpen={isSuspendTerminateModalOpen}
        onClose={handleCloseSuspendTerminateModal}
        contract={suspendTerminateContract}
        action={suspendTerminateAction}
        onSuccess={handleSuspendTerminateSuccess}
      />
    </div>
  );
}
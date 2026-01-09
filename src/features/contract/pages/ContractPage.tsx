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
import { Search, Eye, ChevronLeft, ChevronRight, Plus, Edit, FileText, AlertCircle, Trash2, Download, Upload } from 'lucide-react';
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
import { contractApi } from '../api/contractApi';
import { toast } from '@/shared/components/ui/use-toast';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import ContractFormModal from '../components/ContractFormModal';
import ContractDetailModal from '../components/ContractDetailModal';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { categoriesApi } from '@/features/categories/api/categoriesApi';


interface Contract {
  id: number;
  employee: {
    id: number;
    code: string;
    fullName: string;
    department?: {
      id: number;
      name: string;
    };
    position?: {
      id: number;
      name: string;
    };
  };
  contractType: string;
  startDate: string;
  endDate: string;
  salary: number;
  notes?: string;
  fileName?: string;
  fileType?: string;
  attachmentData?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContractPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [contractTypes, setContractTypes] = useState<{ id: number, name: string }[]>([]);

  const [contractsData, setContractsData] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  // Fetch contracts
  useEffect(() => {
    const fetchContracts = async () => {
      setIsLoading(true);
      try {
        const data = await contractApi.getAll();
        setContractsData(data);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách hợp đồng',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [refreshKey]);

  useEffect(() => {
    const fetchContractTypes = async () => {
      try {
        const response = await categoriesApi.laborContractType.getAll();
        setContractTypes(response);
      } catch (error) {
        console.error('Error fetching contract types:', error);
      }
    };
    fetchContractTypes();
  }, []);

  // Tính toán trạng thái hợp đồng
  const getContractStatus = (contract: Contract) => {
    if (!contract.endDate) return 'ACTIVE';

    const now = new Date();
    const endDate = new Date(contract.endDate);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'EXPIRED';
    if (daysUntilExpiry <= 30) return 'EXPIRING_SOON';
    return 'ACTIVE';
  };

  const getContractTypeName = (contractTypeId: string | number) => {
    const type = contractTypes.find(t => t.id === Number(contractTypeId));
    return type?.name || contractTypeId; // Fallback to ID if not found
  };

  // Lọc và phân trang
  const filteredContracts = contractsData.filter((contract: Contract) => {
    const status = getContractStatus(contract);
    const isActive = status === 'ACTIVE' || status === 'EXPIRING_SOON';

    // Filter by tab
    if (activeTab === 'active' && !isActive) return false;
    if (activeTab === 'inactive' && isActive) return false;

    // Filter by search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesEmployee = contract.employee?.fullName?.toLowerCase().includes(searchLower);
      const matchesCode = contract.employee?.code?.toLowerCase().includes(searchLower);
      const matchesPosition = contract.employee?.position?.name?.toLowerCase().includes(searchLower);

      if (!matchesEmployee && !matchesCode && !matchesPosition) return false;
    }

    // Filter by type
    if (typeFilter && !contract.contractType?.toLowerCase().includes(typeFilter.toLowerCase())) return false;

    // Filter by department
    if (departmentFilter !== 'ALL' && contract.employee?.department?.name !== departmentFilter) return false;

    // Filter by status
    if (statusFilter !== 'ALL' && status !== statusFilter) return false;

    return true;
  });

  const totalItems = filteredContracts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  // Get unique departments
  const departments = Array.from(
    new Set(contractsData.map((c: Contract) => c.employee?.department?.name).filter(Boolean))
  );

  // Count active/inactive
  const activeCount = contractsData.filter((c: Contract) => {
    const status = getContractStatus(c);
    return status === 'ACTIVE' || status === 'EXPIRING_SOON';
  }).length;

  const inactiveCount = contractsData.length - activeCount;

  const getDaysUntilExpiry = (endDate: string) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (contract: Contract) => {
    const status = getContractStatus(contract);

    const statusConfig = {
      'ACTIVE': { label: 'Đang hiệu lực', className: 'bg-green-100 text-green-800' },
      'EXPIRING_SOON': { label: 'Sắp hết hạn', className: 'bg-orange-100 text-orange-800' },
      'EXPIRED': { label: 'Đã hết hạn', className: 'bg-red-100 text-red-800' },
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

  const handleOpenDetailModal = (id: number) => {
    setSelectedContractId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedContractId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      try {
        await contractApi.delete(id);
        toast({
          title: 'Thành công',
          description: 'Đã xóa hợp đồng',
        });
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting contract:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể xóa hợp đồng',
          variant: 'destructive',
        });
      }
    }
  };

  const handleExport = async () => {
    try {
      await contractApi.export();
      toast({
        title: 'Thành công',
        description: 'Đã tải xuống file Excel',
      });
    } catch (error) {
      console.error('Error exporting contracts:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải xuống file',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Hợp đồng</h1>
          <p className="text-muted-foreground">
            Quản lý hợp đồng lao động của nhân viên
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" onClick={handleExport}>
                <Upload className="h-4 w-4 mr-1" />
                Tải Lên
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Tải Xuống
              </Button>
              <Button onClick={() => handleOpenFormModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm hợp đồng mới
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'inactive')}>
        <TabsList>
          <TabsTrigger value="active">
            Đang hiệu lực
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10">
              {activeCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Đã hết hạn
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10">
              {inactiveCount}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>


      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên, mã NV, vị trí"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Mã NV</TableHead>
                <TableHead>Loại hợp đồng</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Lương cơ bản</TableHead>
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
              ) : paginatedContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Không tìm thấy hợp đồng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedContracts.map((contract: Contract) => {
                  const daysLeft = getDaysUntilExpiry(contract.endDate);
                  const status = getContractStatus(contract);

                  return (
                    <TableRow key={`contract-${contract.id}-${contract.employee.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{contract.employee?.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {contract.employee?.department?.name || 'Chưa có phòng ban'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contract.employee?.position?.name || 'Chưa có chức vụ'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm">{contract.employee?.code}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getContractTypeName(contract.contractType)}
                        </span>
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
                        <span className="text-sm font-medium">{formatCurrency(contract.salary)}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contract)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          {isAdmin && status === 'ACTIVE' && (
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

                          {isAdmin && (
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
        {!isLoading && paginatedContracts.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex + 1} - {endIndex} trong tổng số {totalItems}
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

      {/* Modals */}
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
    </div>
  );
}
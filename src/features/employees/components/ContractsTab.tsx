import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button as Button2 } from '@/shared/components/ui/button/Button2';
import {
  FileText,
  Download,
  Trash2,
  Upload,
  Eye,
  Edit,
  Plus,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { contractApi } from '../../contract/api/contractApi';
import { toast } from '@/shared/hooks/use-toast';
import ContractFormModal from '../../contract/components/ContractFormModal';
import ContractDetailModal from '../../contract/components/ContractDetailModal';
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
  createdAt: string;
  updatedAt: string;
}

interface ContractsTabProps {
  employeeId: number;
}

export default function ContractsTab({ employeeId }: ContractsTabProps) {
  const queryClient = useQueryClient();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [contractTypes, setContractTypes] = useState<{ id: number; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch contracts by employee
  const { data: contracts = [], isLoading, refetch } = useQuery({
    queryKey: ['contracts', employeeId],
    queryFn: () => contractApi.getByEmployeeId(employeeId),
    enabled: !!employeeId,
  });

  // Fetch contract types
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (contractId: number) => contractApi.delete(contractId),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã xóa hợp đồng',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa hợp đồng',
        variant: 'destructive',
      });
    },
  });

  // Pagination
  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return contracts.slice(startIndex, endIndex);
  }, [contracts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(contracts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [contracts.length]);

  const getContractStatus = (contract: Contract) => {
    if (!contract.endDate) return 'active';
    const now = new Date();
    const endDate = new Date(contract.endDate);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { label: 'Đang hiệu lực', variant: 'default' },
      'expiring_soon': { label: 'Sắp hết hạn', variant: 'warning' },
      'expired': { label: 'Hết hạn', variant: 'secondary' },
    };
    return statusConfig[status] || statusConfig['active'];
  };

  const getContractTypeName = (contractTypeId: string | number) => {
    const type = contractTypes.find(t => t.id === Number(contractTypeId));
    return type?.name || contractTypeId;
  };

  const handleDownload = async (contract: Contract) => {
    if (!contract.fileName) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy file đính kèm',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (contract.attachmentData) {
        const byteCharacters = atob(contract.attachmentData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contract.fileType || 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = contract.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Thành công',
          description: 'Đã tải xuống file hợp đồng',
        });
      } else {
        toast({
          title: 'Lỗi',
          description: 'Không tìm thấy dữ liệu file',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải xuống file',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (contractId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      deleteMutation.mutate(contractId);
    }
  };

  const openCreate = () => {
    setSelectedContract(null);
    setIsFormModalOpen(true);
  };

  const openEdit = (contract: Contract, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedContract(contract);
    setIsFormModalOpen(true);
  };

  const openDetail = (contractId: number) => {
    setSelectedContractId(contractId);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Hợp đồng lao động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Header Card */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Hợp đồng lao động
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tổng số: {contracts.length} hợp đồng
              </p>
            </div>
            <Button2 onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm hợp đồng
            </Button2>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="text-center p-3 text-sm font-semibold w-16">STT</th>
                <th className="text-left p-3 text-sm font-semibold">Loại hợp đồng</th>
                <th className="text-left p-3 text-sm font-semibold">Ngày bắt đầu</th>
                <th className="text-left p-3 text-sm font-semibold">Ngày kết thúc</th>
                <th className="text-left p-3 text-sm font-semibold">Lương cơ bản</th>
                <th className="text-left p-3 text-sm font-semibold">File đính kèm</th>
                <th className="text-center p-3 text-sm font-semibold">Trạng thái</th>
                <th className="text-center p-3 text-sm font-semibold w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">Chưa có hợp đồng nào</p>
                  </td>
                </tr>
              ) : (
                paginatedContracts.map((contract: Contract, index) => {
                  const status = getContractStatus(contract);
                  const statusConfig = getStatusBadge(status);
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr
                      key={contract.id}
                      className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => openDetail(contract.id)}
                    >
                      <td className="p-3 text-center text-sm text-muted-foreground">
                        {globalIndex}
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-sm">
                          {getContractTypeName(contract.contractType)}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">{formatDate(contract.startDate)}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm">
                          {contract.endDate ? formatDate(contract.endDate) : 'Không xác định'}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-sm font-medium">{formatCurrency(contract.salary)}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {contract.fileName ? (
                            <>
                              <FileText className="h-4 w-4 text-blue-600" />
                              <p className="text-sm truncate max-w-[150px]" title={contract.fileName}>
                                {contract.fileName}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-400">Không có file</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={statusConfig.variant as any}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1 justify-center">
                          <Button2
                            variant="ghost"
                            size="sm"
                            onClick={(e) => openEdit(contract, e)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button2>
                          <Button2
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(contract.id, e)}
                            title="Xóa"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button2>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {contracts.length > 0 && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Hiển thị</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">mục</span>
              </div>

              <div className="flex items-center gap-2">
                <Button2
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Đầu
                </Button2>
                <Button2
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button2>

                <span className="text-sm px-4">
                  Trang {currentPage} / {totalPages}
                </span>

                <Button2
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button2>
                <Button2
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Cuối
                </Button2>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <ContractFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedContract(null);
        }}
        contract={selectedContract}
        onSuccess={() => {
          setIsFormModalOpen(false);
          setSelectedContract(null);
          refetch();
        }}
      />

      {/* Detail Modal */}
      <ContractDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedContractId(null);
        }}
        contractId={selectedContractId}
      />
    </>
  );
}
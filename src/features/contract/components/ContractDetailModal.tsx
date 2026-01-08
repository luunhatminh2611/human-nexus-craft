// components/ContractDetailModal.tsx

import { useQuery } from '@tanstack/react-query';
import { X, Download, FileText, Calendar, DollarSign, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { contractApi } from '../api/contractApi';
import { toast } from '@/shared/hooks/use-toast';
import { useEffect, useState } from 'react';
import { categoriesApi } from '@/features/categories/api/categoriesApi';

interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: number | null;
}

export default function ContractDetailModal({
  isOpen,
  onClose,
  contractId,
}: ContractDetailModalProps) {

  // Fetch contract detail
  const { data: contractData, isLoading } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => contractApi.getById(contractId!),
    enabled: isOpen && contractId !== null,
  });

  const [contractTypes, setContractTypes] = useState<{ id: number, name: string }[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const contract = contractData?.data || contractData;

  const getContractStatus = (contract: any) => {
    if (!contract?.endDate) return 'ACTIVE';

    const now = new Date();
    const endDate = new Date(contract.endDate);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'EXPIRED';
    if (daysUntilExpiry <= 30) return 'EXPIRING_SOON';
    return 'ACTIVE';
  };

  const getDaysUntilExpiry = (endDate: string) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
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

  const getContractTypeName = (contractTypeId: string | number) => {
    const type = contractTypes.find(t => t.id === Number(contractTypeId));
    return type?.name || contractTypeId;
  };

  const handleDownload = async () => {
    if (!contract?.id || !contract?.fileName) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy file đính kèm',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);

    try {
      // Phương pháp 1: Nếu có attachmentData (Base64)
      if (contract.attachmentData) {
        console.log('📥 Downloading from Base64 data');
        
        // Decode Base64 và tạo Blob
        const byteCharacters = atob(contract.attachmentData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contract.fileType || 'application/pdf' });
        
        // Tạo URL và download
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
        return;
      }
      
      // Phương pháp 2: Download trực tiếp từ API
      console.log('📥 Downloading from API endpoint');
      
      const response = await fetch(`/api/contract/${contract.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải file từ server');
      }
      
      const blob = await response.blob();
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
      
    } catch (error) {
      console.error('❌ Error downloading contract:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tải xuống file',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (!isOpen) return null;

  if (isLoading || !contract) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  const status = getContractStatus(contract);
  const daysLeft = getDaysUntilExpiry(contract.endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Chi tiết hợp đồng</h2>
            {getStatusBadge(status)}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Contract Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Thông tin hợp đồng</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-blue-700">ID Hợp đồng</Label>
                  <p className="font-medium text-blue-900">#{contract.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-blue-700">Loại hợp đồng</Label>
                  <p className="text-blue-900">{getContractTypeName(contract.contractType)}</p>
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Thông tin nhân viên</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Mã nhân viên</Label>
                  <p className="font-medium">{contract.employee?.code}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Tên nhân viên</Label>
                  <p className="font-medium">{contract.employee?.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phòng ban</Label>
                  <p>{contract.employee?.department?.name || 'Chưa có'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Vị trí</Label>
                  <p>{contract.employee?.position?.name || 'Chưa có'}</p>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Thời hạn hợp đồng</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-green-700">Ngày bắt đầu</Label>
                  <p className="font-medium text-green-900">
                    {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-green-700">Ngày kết thúc</Label>
                  <p className="font-medium text-green-900">
                    {contract.endDate
                      ? new Date(contract.endDate).toLocaleDateString('vi-VN')
                      : 'Không xác định'}
                  </p>
                </div>
              </div>
              {daysLeft !== null && daysLeft >= 0 && (
                <div className="mt-3 pt-3 border-t border-green-300">
                  <p className={`text-sm font-medium ${daysLeft <= 30 ? 'text-orange-600' : 'text-green-700'
                    }`}>
                    Còn {daysLeft} ngày đến hết hạn
                  </p>
                </div>
              )}
            </div>

            {/* Salary */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Lương</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-purple-700">Lương cơ bản</Label>
                  <p className="text-lg font-bold text-purple-900">
                    {formatCurrency(contract.salary)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {contract.notes && (
              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-sm text-gray-600">Ghi chú</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{contract.notes}</p>
              </div>
            )}

            {/* File Info */}
            {contract.fileName && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600">File đính kèm</Label>
                    <p className="text-sm mt-1 font-medium">{contract.fileName}</p>
                    {contract.fileType && (
                      <p className="text-xs text-gray-500 mt-1">{contract.fileType}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Tải xuống
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Created Info */}
            <div className="border-t pt-4 text-sm text-gray-500">
              <p>
                Được tạo vào{' '}
                {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
              </p>
              <p className="mt-1">
                Cập nhật lần cuối vào{' '}
                {new Date(contract.updatedAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Download, FileText, Calendar, User, Building2, Briefcase, CheckCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { transferApi } from '../api/transferApi';
import { useAuthStore } from '../../../features/employees/hooks/useAuth'; // Import authStore

interface TransferDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transferId?: string | number | null;
    onSuccess?: () => void; // Callback sau khi ký thành công
}

export default function TransferDetailModal({
    isOpen,
    onClose,
    transferId,
    onSuccess,
}: TransferDetailModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [transferData, setTransferData] = useState<any>(null);
    
    // Lấy thông tin user từ authStore
    const { user } = useAuthStore();

    useEffect(() => {
        if (isOpen && transferId) {
            fetchTransferDetail();
        } else {
            setTransferData(null);
        }
    }, [isOpen, transferId]);

    const fetchTransferDetail = async () => {
        try {
            setIsLoading(true);
            const data = await transferApi.getById(transferId!);
            console.log('Transfer detail:', data);
            setTransferData(data);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết điều động:', error);
            alert('Không thể tải thông tin điều động');
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!transferData) return;

        // Xác nhận trước khi ký
        if (!confirm('Bạn có chắc chắn muốn ký xác nhận quyết định điều động này?')) {
            return;
        }

        try {
            setIsUpdating(true);

            // Xác định status mới dựa trên role và status hiện tại
            let newStatus = transferData.status;
            
            if (user?.roles?.includes('ADMIN')) {
                // Admin ký -> chuyển sang CHO_TIEP_NHAN
                if (transferData.status === 'GIAM_DOC_CHO_KY') {
                    newStatus = 'CHO_TIEP_NHAN';
                }
            } else if (user?.roles?.includes('MANAGER')) {
                // Manager phòng ban tiếp nhận ký -> chuyển sang SUCCEEDED
                if (transferData.status === 'CHO_TIEP_NHAN') {
                    newStatus = 'SUCCEEDED';
                }
            }

            // Gọi API update
            await transferApi.updateStatus({
                id: transferData.id,
                status: newStatus,
                note: transferData.note,
                employeeName: transferData.employeeName,
                title: transferData.title,
                orderIndex: transferData.orderIndex,
                updateAt: new Date().toISOString(),
                transferEmployeeId: transferData.transferEmployeeId,
            });

            alert('Ký xác nhận thành công!');
            
            // Gọi callback để refresh data
            if (onSuccess) {
                onSuccess();
            }
            
            onClose();
        } catch (error) {
            console.error('Lỗi khi ký xác nhận:', error);
            alert('Không thể ký xác nhận. Vui lòng thử lại!');
        } finally {
            setIsUpdating(false);
        }
    };

    // Kiểm tra xem có hiển thị nút ký không
    const canApprove = () => {
        if (!transferData || !user) return false;

        const roles = user.roles || [];
        const status = transferData.status;
        console.log("transferData",transferData)

        // Admin có thể ký khi status = GIAM_DOC_CHO_KY
        if (roles.includes('ADMIN') && status === 'GIAM_DOC_CHO_KY') {
            return true;
        }

        // Manager có thể ký khi status = CHO_TIEP_NHAN
        if (roles.includes('MANAGER') && status === 'CHO_TIEP_NHAN') {
            return true;
        }

        return false;
    };

    const handleDownloadFile = () => {
        if (!transferData?.keyFile) {
            alert('Không có file để tải xuống');
            return;
        }
        const fileUrl = transferApi.getFileUrl(transferData.keyFile);
        window.open(fileUrl, "_blank");
    };

    const getFileName = (keyFile: string) => {
        const parts = keyFile.split('/');
        return parts[parts.length - 1];
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'TRUONG_PHONG_CHO_KY': { label: 'Chờ trưởng phòng ký', className: 'bg-yellow-100 text-yellow-800' },
            'DA_TAO': { label: 'Đã tạo', className: 'bg-yellow-100 text-yellow-800' },
            'GIAM_DOC_CHO_KY': { label: 'Chờ giám đốc ký', className: 'bg-blue-100 text-blue-800' },
            'CHO_TIEP_NHAN': { label: 'Chờ tiếp nhận', className: 'bg-purple-100 text-purple-800' },
            'REJECTED': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
            'SUCCEEDED': { label: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
        };

        const config = statusConfig[status] || { label: status, className: '' };

        return (
            <Badge className={config.className}>
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl">
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span>Đang tải...</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!transferData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Chi tiết quyết định điều động</span>
                        {getStatusBadge(transferData.status)}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Thông tin nhân viên */}
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Thông tin nhân viên
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Nhân viên</p>
                                <p className="font-medium">{transferData.employeeName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Người tạo quyết định</p>
                                <p className="font-medium">{transferData.creatorName || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Từ phòng ban */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Từ vị trí hiện tại
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Phòng ban</p>
                                <p className="font-medium">{transferData.fromDepartmentName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Chức vụ</p>
                                <p className="font-medium">{transferData.fromPositionName || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Đến phòng ban */}
                    <div className="bg-green-50 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-green-900 flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Đến vị trí mới
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Phòng ban</p>
                                <p className="font-medium">{transferData.toDepartmentName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Chức vụ</p>
                                <p className="font-medium">{transferData.toPositionName || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin bổ sung */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Ngày tạo</p>
                                <p className="font-medium">{formatDate(transferData.createdAt)}</p>
                            </div>
                        </div>

                        {transferData.description && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Mô tả</p>
                                <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                                    {transferData.description}
                                </p>
                            </div>
                        )}

                        {transferData.note && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                                <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                                    {transferData.note}
                                </p>
                            </div>
                        )}

                        {/* File đính kèm */}
                        {transferData.keyFile && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">File đính kèm</p>
                                <div className="border rounded-lg p-3 bg-blue-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                            <span className="text-sm truncate" title={getFileName(transferData.keyFile)}>
                                                {getFileName(transferData.keyFile)}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleDownloadFile}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 flex-shrink-0"
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Tải xuống
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isUpdating}
                    >
                        Đóng
                    </Button>
                    
                    {canApprove() && (
                        <Button
                            type="button"
                            onClick={handleApprove}
                            disabled={isUpdating}
                            className="bg-green-500 hover:bg-green-600 text-white"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Ký xác nhận
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Download, FileText, Calendar, User, Building2, Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { transferApi } from '../api/transferApi';
import { useAuthStore } from '../../../features/employees/hooks/useAuth';

interface TransferDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transferId?: string | number | null;
    onSuccess?: () => void;
}

interface TransferHistory {
    id: string;
    note: string | null;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
    employeeName: string | null;
    title: string;
    orderIndex: string;
    updateAt: string | null;
    transferEmployeeId: string;
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
    const [historyData, setHistoryData] = useState<TransferHistory[]>([]);

    const { user } = useAuthStore();

    useEffect(() => {
        if (isOpen && transferId) {
            fetchTransferDetail();
        } else {
            setTransferData(null);
            setHistoryData([]);
        }
    }, [isOpen, transferId]);

    const fetchTransferDetail = async () => {
        try {
            setIsLoading(true);
            const data = await transferApi.getById(transferId!);
            console.log('Transfer detail:', data);
            setTransferData(data);

            // Fetch history data
            if (data) {
                await fetchHistoryData(data.id);
            }
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết điều động:', error);
            alert('Không thể tải thông tin điều động');
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistoryData = async (transferEmployeeId: string) => {
        try {
            // Sử dụng hàm API thay vì fetch trực tiếp
            const history = await transferApi.getHistory(transferEmployeeId);

            // Sắp xếp theo orderIndex
            const sortedHistory = history.sort((a: TransferHistory, b: TransferHistory) =>
                parseInt(a.orderIndex) - parseInt(b.orderIndex)
            );
            setHistoryData(sortedHistory);
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử:', error);
        }
    };

    const handleApproveStep = async (historyItem: TransferHistory) => {
        if (!confirm(`Bạn có chắc chắn muốn ký xác nhận: ${historyItem.title}?`)) {
            return;
        }

        try {
            setIsUpdating(true);

            // Sử dụng hàm API thay vì fetch trực tiếp
            await transferApi.updateHistoryStatus({
                id: historyItem.id,
                note: historyItem.note || '',
                status: 'CONFIRMED',
                employeeName: user?.fullName || '',
                title: historyItem.title,
                orderIndex: historyItem.orderIndex,
                updateAt: new Date().toISOString(),
                transferEmployeeId: historyItem.transferEmployeeId,
            });

            alert('Ký xác nhận thành công!');

            // Refresh data
            await fetchTransferDetail();

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Lỗi khi ký xác nhận:', error);
            alert('Không thể ký xác nhận. Vui lòng thử lại!');
        } finally {
            setIsUpdating(false);
        }
    };

    // Kiểm tra xem bước nào có thể ký
    const canApproveStep = (historyItem: TransferHistory, index: number): boolean => {
        if (!user || historyItem.status === 'CONFIRMED') return false;

        const roles = user.roles || [];

        // Kiểm tra bước trước đã CONFIRMED chưa (trừ bước đầu tiên)
        if (index > 0) {
            const previousStep = historyData[index - 1];
            if (previousStep?.status !== 'CONFIRMED') {
                return false;
            }
        }

        // orderIndex "1" - Trưởng phòng tạo phiếu
        if (historyItem.orderIndex === '1') {
            return roles.includes('MANAGER') &&
                transferData?.creatorId === user.id;
        }

        // orderIndex "2" - Admin/Giám đốc
        if (historyItem.orderIndex === '2') {
            return roles.includes('ADMIN');
        }

        // orderIndex "3" - Trưởng phòng tiếp nhận
        if (historyItem.orderIndex === '3') {
            return roles.includes('MANAGER') &&
                transferData?.toDepartmentId === user.departmentId;
        }

        return false;
    };

    const handleDownloadFile = async () => {
        if (!transferData?.keyFile) {
            alert('Không có file để tải xuống');
            return;
        }

        try {
            // Gọi API để lấy blob
            const blob = await transferApi.downloadFile(transferData.keyFile);

            // Tạo URL từ blob
            const url = window.URL.createObjectURL(blob);

            // Tạo thẻ a để tải file
            const a = document.createElement('a');
            a.href = url;
            a.download = getFileName(transferData.keyFile);
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Lỗi khi tải file:', error);
            alert('Không thể tải file. Vui lòng thử lại!');
        }
    };
    const getFileName = (keyFile: string) => {
        const parts = keyFile.split('/');
        return parts[parts.length - 1];
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'PENDING':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case 'REJECTED':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const config = {
            'CONFIRMED': { label: 'Đã xác nhận', className: 'bg-green-100 text-green-800' },
            'PENDING': { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
            'REJECTED': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
        };

        const statusConfig = config[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

        return (
            <Badge className={statusConfig.className}>
                {statusConfig.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string | null) => {
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
                <DialogContent className="max-w-5xl">
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
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        Chi tiết quyết định điều động
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cột trái - Thông tin chi tiết */}
                    <div className="lg:col-span-2 space-y-6">
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

                    {/* Cột phải - Luồng phê duyệt */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border rounded-lg p-4 sticky top-4">
                            <h3 className="font-semibold text-lg mb-4">Luồng phê duyệt</h3>

                            <div className="space-y-4">
                                {historyData.map((item, index) => {
                                    const isLast = index === historyData.length - 1;
                                    const canApprove = canApproveStep(item, index);

                                    return (
                                        <div key={item.id} className="relative">
                                            {/* Đường nối */}
                                            {!isLast && (
                                                <div className="absolute left-[10px] top-[32px] w-0.5 h-[calc(100%+16px)] bg-gray-200" />
                                            )}

                                            <div className="relative flex gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {getStatusIcon(item.status)}
                                                </div>

                                                <div className="flex-1 pb-4">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <p className="font-medium text-sm">{item.title}</p>
                                                        {getStatusBadge(item.status)}
                                                    </div>

                                                    {item.employeeName && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Người ký: {item.employeeName}
                                                        </p>
                                                    )}

                                                    {item.updateAt && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDate(item.updateAt)}
                                                        </p>
                                                    )}

                                                    {item.note && (
                                                        <p className="text-xs text-muted-foreground mt-1 p-2 bg-gray-50 rounded">
                                                            {item.note}
                                                        </p>
                                                    )}

                                                    {canApprove && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => handleApproveStep(item)}
                                                            disabled={isUpdating}
                                                            className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white"
                                                        >
                                                            {isUpdating ? (
                                                                <>
                                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                                                    Đang xử lý...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="h-3 w-3 mr-2" />
                                                                    Ký xác nhận
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
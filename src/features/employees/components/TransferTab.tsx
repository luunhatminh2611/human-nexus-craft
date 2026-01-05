import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, ArrowRight, FileText } from 'lucide-react';
import { transferApi } from '@/features/transfer/api/transferApi';

interface Transfer {
    id: number;
    fromDepartmentName: string;
    fromPositionName: string;
    toDepartmentName: string;
    toPositionName: string;
    description?: string;
    note?: string;
    status: string;
    createdAt: string;
    creatorName?: string;
}

interface TransferTabProps {
    employeeId: number;
    userData?: any;
}

export default function TransferTab({ employeeId, userData }: TransferTabProps) {
    const [transferHistory, setTransferHistory] = useState<Transfer[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        fetchTransferHistory();
    }, [employeeId]);

    const fetchTransferHistory = async () => {
        setIsLoadingHistory(true);
        try {
            // TODO: Replace with your actual API call
            const response = await transferApi.getByEmployeeId(employeeId);
            setTransferHistory(response.content[0] || []);

        } catch (error) {
            console.error('Error fetching transfer history:', error);
            setTransferHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            pending: { label: 'Chờ duyệt', variant: 'secondary' },
            approved: { label: 'Đã duyệt', variant: 'default' },
            rejected: { label: 'Từ chối', variant: 'destructive' },
            completed: { label: 'Hoàn thành', variant: 'default' }
        };

        const config = statusConfig[status] || { label: status, variant: 'outline' };
        return (
            <Badge variant={config.variant} className="text-xs">
                {config.label}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lịch sử điều động</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span>Đang tải...</span>
                        </div>
                    </div>
                ) : transferHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Chưa có lịch sử điều động</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transferHistory.map((transfer, index) => (
                            <div
                                key={transfer.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-500">
                                            Lần {transferHistory.length - index}
                                        </span>
                                        {getStatusBadge(transfer.status)}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(transfer.createdAt)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-1">Từ</p>
                                        <p className="font-medium text-sm">{transfer.fromDepartmentName}</p>
                                        <p className="text-xs text-muted-foreground">{transfer.fromPositionName}</p>
                                    </div>

                                    <ArrowRight className="h-5 w-5 text-blue-500 flex-shrink-0" />

                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-1">Đến</p>
                                        <p className="font-medium text-sm">{transfer.toDepartmentName}</p>
                                        <p className="text-xs text-muted-foreground">{transfer.toPositionName}</p>
                                    </div>
                                </div>

                                {transfer.description && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-muted-foreground mb-1">Mô tả:</p>
                                        <p className="text-sm">{transfer.description}</p>
                                    </div>
                                )}

                                {transfer.note && (
                                    <div className="mt-2">
                                        <p className="text-xs text-muted-foreground mb-1">Ghi chú:</p>
                                        <p className="text-sm">{transfer.note}</p>
                                    </div>
                                )}

                                {transfer.creatorName && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Người tạo: <span className="font-medium">{transfer.creatorName}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
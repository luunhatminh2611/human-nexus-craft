import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import {
    ArrowLeft,
    Calendar,
    Shield,
    FileText,
    Package,
    ClipboardList,
    Plus,
    Edit,
    Send,
    CheckCircle,
    FileDown,
    Building2,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/tables/table';
import { ppeApi } from '../../api/safetyApi';
import { employeeApi } from '@/features/employees/api/employeeApi';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import PPERegistrationModal from '../../components/PPERegistrationModal';
import DistributionsModal from '../../components/DistributionModal';

export default function ManagerPPEPlanDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [planDetail, setPlanDetail] = useState<any>(null);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [employeeInfo, setEmployeeInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [editingRegistration, setEditingRegistration] = useState(null);

    const [isDistributionsModalOpen, setIsDistributionsModalOpen] = useState(false);
    const [distributionsData, setDistributionsData] = useState<any[]>([]);

    const [selectedRegistrationForDist, setSelectedRegistrationForDist] = useState(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Lấy thông tin employee để có departmentId
            let empInfo = null;
            if (user?.employeeId) {
                empInfo = await employeeApi.getById(user.employeeId);
                setEmployeeInfo(empInfo);
            }

            const [planResponse, registrationsResponse] = await Promise.all([
                ppeApi.getPlanById(Number(id)),
                ppeApi.getRegistrationsByPlan(Number(id)),
            ]);

            setPlanDetail(planResponse);

            setRegistrations(registrationsResponse || []);
        } catch (err) {
            console.error('Lỗi khi tải thông tin kế hoạch:', err);
            setError('Không thể tải thông tin kế hoạch');
            toast.error('Không thể tải thông tin kế hoạch');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            'ACTIVE': { label: 'Đang hoạt động', className: 'bg-green-100 text-green-800' },
            'CLOSED': { label: 'Đã đóng', className: 'bg-gray-100 text-gray-800' },
            'DRAFT': { label: 'Nháp', className: 'bg-yellow-100 text-yellow-800' },
        };

        const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const getRegistrationStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            'DRAFT': { label: 'Nháp', className: 'bg-gray-100 text-gray-800' },
            'PENDING': { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
            'APPROVED': { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
            'REJECTED': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
            'RECEIVED': { label: 'Đã nhận', className: 'bg-blue-100 text-blue-800' },
        };

        const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCreateRegistration = () => {
        setEditingRegistration(null);
        setIsRegistrationModalOpen(true);
    };

    // Handler edit
    const handleEditRegistration = (registration: any) => {
        setEditingRegistration(registration);
        setIsRegistrationModalOpen(true);
    };

    const handleSubmitRegistration = async (registration: any) => {
        if (!window.confirm(`Bạn có chắc chắn muốn gửi đơn đăng ký #${registration.id} để phê duyệt?`)) {
            return;
        }

        try {
            setIsProcessing(true);
            await ppeApi.submitRegistration(registration.id);
            toast.success('Gửi đơn đăng ký thành công');
            fetchData();
        } catch (error) {
            console.error('Lỗi khi gửi đơn đăng ký:', error);
            toast.error('Không thể gửi đơn đăng ký');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmReceived = async (registration: any) => {
        if (!window.confirm(`Bạn có chắc chắn đã nhận đủ hàng cho đơn #${registration.id}?`)) {
            return;
        }

        try {
            setIsProcessing(true);
            await ppeApi.confirmReceived(registration.id);
            toast.success('Xác nhận đã nhận hàng thành công');
            fetchData();
        } catch (error) {
            console.error('Lỗi khi xác nhận nhận hàng:', error);
            toast.error('Không thể xác nhận nhận hàng');
        } finally {
            setIsProcessing(false);
        }
    };


    const handleViewDistributions = async (registration: any) => {
        try {
            setIsProcessing(true);
            const distributions = await ppeApi.getDistributionsByRegistration(registration.id);
            toast.success('Tải danh sách phát thành công');

            setDistributionsData(distributions || []);
            setSelectedRegistrationForDist(registration);
            setIsDistributionsModalOpen(true);
        } catch (error) {
            console.error('Lỗi khi tải danh sách phát:', error);
            toast.error('Không thể tải danh sách phát');
        } finally {
            setIsProcessing(false);
        }
    };

    // Render action buttons dựa trên status
    const renderActionButton = (registration: any) => {
        const { status } = registration;

        if (status === 'DRAFT') {
            // Nháp: Hiển thị nút Gửi
            return (
                <Button
                    size="sm"
                    onClick={() => handleSubmitRegistration(registration)}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                    <Send className="h-4 w-4 mr-1" />
                    Gửi
                </Button>
            );
        } else if (status === 'PENDING') {
            // Chờ duyệt: Hiển thị badge
            return (
                <Badge className="bg-yellow-100 text-yellow-800">
                    Đang chờ phê duyệt
                </Badge>
            );
        } else if (status === 'APPROVED') {
            // Đã duyệt: Hiển thị nút Xác nhận nhận hàng
            return (
                <Button
                    size="sm"
                    onClick={() => handleConfirmReceived(registration)}
                    disabled={isProcessing}
                    className="bg-green-500 hover:bg-green-600 text-white"
                >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Xác nhận nhận hàng
                </Button>
            );
        } else if (status === 'RECEIVED') {
            // Đã nhận: Hiển thị nút Xem danh sách phát
            return (
                <Button
                    size="sm"
                    onClick={() => handleViewDistributions(registration)}
                    disabled={isProcessing}
                    variant="outline"
                >
                    <FileDown className="h-4 w-4 mr-1" />
                    Xem danh sách phát
                </Button>
            );
        } else if (status === 'REJECTED') {
            // Từ chối: Hiển thị badge
            return (
                <Badge className="bg-red-100 text-red-800">
                    Đã từ chối
                </Badge>
            );
        }

        return null;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (error || !planDetail) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-destructive mb-4">{error || 'Không tìm thấy kế hoạch'}</p>
                    <Button onClick={() => navigate(-1)} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </div>


            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thông tin chi tiết kế hoạch */}
                <Card className="lg:col-span-3 p-6">
                    <div className='flex flex-row justify-between'>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Thông tin chi tiết kế hoạch
                        </h2>
                        {/* Nút tạo đơn đăng ký */}
                        {planDetail.status === 'ACTIVE' && (
                            <Button
                                onClick={handleCreateRegistration}
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo đơn đăng ký
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Mã kế hoạch</p>
                                    <p className="font-medium">#{planDetail.id}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Năm áp dụng
                                    </p>
                                    <p className="font-medium text-lg">{planDetail.year}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                                    {getStatusBadge(planDetail.status)}
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Ngày tạo</p>
                                    <p className="font-medium">{formatDate(planDetail.createdAt)}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                                <p className="text-sm leading-relaxed">
                                    {planDetail.notes || 'Không có ghi chú'}
                                </p>
                            </div>

                            {/* Danh sách vật phẩm trong kế hoạch */}

                        </div>
                        <div className="">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                Danh sách vật phẩm ({planDetail.planDetails?.length || 0})
                            </h3>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>STT</TableHead>
                                            <TableHead>Tên vật phẩm</TableHead>
                                            <TableHead>Kích cỡ</TableHead>
                                            <TableHead className="text-right">Số lượng chuẩn</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {planDetail.planDetails?.map((detail: any, index: number) => (
                                            <TableRow key={detail.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-medium">{detail.ppeItemName}</TableCell>
                                                <TableCell>
                                                    {detail.ppeItemSize ? (
                                                        <Badge variant="outline">{detail.ppeItemSize}</Badge>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {detail.standardQuantity}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Danh sách đơn đăng ký của phòng ban */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                    Đơn đăng ký của phòng ban ({registrations.length})
                </h2>

                {registrations.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã đơn</TableHead>
                                    <TableHead>Vật phẩm đăng ký</TableHead>
                                    <TableHead>Kích cỡ</TableHead>
                                    <TableHead>Số lượng yêu cầu</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ghi chú</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registrations.map((registration) => (
                                    <TableRow key={registration.id}>
                                        <TableCell className="font-medium">
                                            #{registration.id}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {registration.registrationDetails?.map((detail: any) => (
                                                    <div key={detail.id} className="text-sm">
                                                        {detail.ppeItemName}
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {registration.registrationDetails?.map((detail: any) => (
                                                    <div key={detail.id} className="font-semibold">
                                                        {detail.ppeItemSize}
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {registration.registrationDetails?.map((detail: any) => (
                                                    <div key={detail.id} className="font-semibold">
                                                        {detail.requestedQuantity}
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getRegistrationStatusBadge(registration.status)}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {registration.notes || '-'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatDate(registration.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Nút sửa - chỉ hiển thị khi DRAFT */}
                                                {registration.status === 'DRAFT' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEditRegistration(registration)}
                                                    >
                                                        <Edit className="h-4 w-4 text-amber-600" />
                                                    </Button>
                                                )}

                                                {/* Action button động theo trạng thái */}
                                                {renderActionButton(registration)}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="mb-4">Chưa có đơn đăng ký nào</p>
                        {planDetail.status === 'ACTIVE' && (
                            <Button
                                onClick={handleCreateRegistration}
                                variant="outline"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo đơn đăng ký đầu tiên
                            </Button>
                        )}
                    </div>
                )}
            </Card>

            <PPERegistrationModal
                isOpen={isRegistrationModalOpen}
                onClose={() => {
                    setIsRegistrationModalOpen(false);
                    setEditingRegistration(null);
                }}
                onSuccess={fetchData}
                planId={Number(id)}
                planDetails={planDetail?.planDetails || []}
                editData={editingRegistration}
            />

            <DistributionsModal
                isOpen={isDistributionsModalOpen}
                onClose={() => setIsDistributionsModalOpen(false)}
                distributions={distributionsData}
                registration={selectedRegistrationForDist}
                onDistributionCreated={() => selectedRegistrationForDist && handleViewDistributions(selectedRegistrationForDist)}
            />
        </div>
    );
}
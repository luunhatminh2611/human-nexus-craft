// components/AllDecisionsTab.tsx

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
import { Search, Eye, ChevronLeft, ChevronRight, Plus, Edit, Award, AlertCircle, UserPlus, UserMinus, DollarSign, ArrowRightLeft, FileText, Calendar, Trash2, XCircle, Upload } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

interface AllDecisionsTabProps {
    employeeId: number;
    userData?: any;
    onSwitchToDecisionType?: (type: string) => void;
}

// ==================== MOCK DATA ====================

export type DecisionStatus = 'ACTIVE' | 'INACTIVE';

export interface BaseDecision {
    id: string;
    employeeId: string;
    employeeName: string;
    departmentName: string;
    position: string;
    decisionType: 'reward' | 'discipline' | 'appointment' | 'dismissal' | 'salary-adjustment' | 'transfer' | 'terminate-contract' | 'extend-contract';
    decisionNumber: string;
    decisionDate: string;
    status: DecisionStatus;
    createdBy: string;
    createdDate: string;
    note?: string;
    attachments?: string[];
}

export interface RewardDecision extends BaseDecision {
    decisionType: 'reward';
    rewardType: string;
    achievement: string;
    reason: string;
    proposedAmount?: number;
    approvedAmount?: number;
}

export interface DisciplineDecision extends BaseDecision {
    decisionType: 'discipline';
    disciplineType: string;
    violation: string;
    penalty: string;
    effectiveDate?: string;
}

export interface AppointmentDecision extends BaseDecision {
    decisionType: 'appointment';
    newPosition: string;
    newDepartment?: string;
    effectiveDate: string;
    reason: string;
}

export interface DismissalDecision extends BaseDecision {
    decisionType: 'dismissal';
    currentPosition: string;
    dismissalDate: string;
    reason: string;
}

export interface SalaryAdjustmentDecision extends BaseDecision {
    decisionType: 'salary-adjustment';
    currentSalary: number;
    newSalary: number;
    adjustmentRate: number;
    effectiveDate: string;
    reason: string;
}

export interface TransferDecision extends BaseDecision {
    decisionType: 'transfer';
    fromDepartment: string;
    toDepartment: string;
    fromPosition: string;
    toPosition: string;
    effectiveDate: string;
    reason: string;
}

export interface TerminateContractDecision extends BaseDecision {
    decisionType: 'terminate-contract';
    terminateReason: string;
    terminateDate: string;
}

export interface ExtendContractDecision extends BaseDecision {
    decisionType: 'extend-contract';
    currentEndDate: string;
    newEndDate: string;
    extendReason: string;
}

export type Decision =
    | RewardDecision
    | DisciplineDecision
    | AppointmentDecision
    | DismissalDecision
    | SalaryAdjustmentDecision
    | TransferDecision
    | TerminateContractDecision
    | ExtendContractDecision;

// Mock data for all decision types
export const mockAllDecisions: Decision[] = [
    {
        id: 'R001',
        employeeId: '1',
        employeeName: 'Nguyễn Văn A',
        departmentName: 'Phòng Kỹ thuật',
        position: 'Kỹ sư phần mềm',
        decisionType: 'reward',
        rewardType: 'Chiến sĩ thi đua cơ sở',
        achievement: 'Hoàn thành xuất sắc dự án ABC trong Q4/2024',
        reason: 'Đóng góp xuất sắc cho dự án, làm việc chăm chỉ',
        proposedAmount: 5000000,
        status: 'ACTIVE',
        decisionNumber: 'QD-KT-2024-001',
        decisionDate: '2024-12-20',
        createdBy: 'Lê Văn C (Admin)',
        createdDate: '2024-12-18',
        attachments: ['quyet-dinh-001.pdf'],
    } as RewardDecision,
    {
        id: 'R002',
        employeeId: '1',
        employeeName: 'Nguyễn Văn A',
        departmentName: 'Phòng Kỹ thuật',
        position: 'Kỹ sư phần mềm',
        decisionType: 'reward',
        rewardType: 'Thưởng đột xuất',
        achievement: 'Phát hiện và sửa lỗi nghiêm trọng',
        reason: 'Kịp thời phát hiện lỗi, tránh thiệt hại lớn',
        proposedAmount: 3000000,
        status: 'ACTIVE',
        decisionNumber: 'QD-KT-2025-002',
        decisionDate: '2025-01-05',
        createdBy: 'Trần Thị B (Admin)',
        createdDate: '2025-01-05',
    } as RewardDecision,
    {
        id: 'D001',
        employeeId: '1',
        employeeName: 'Nguyễn Văn A',
        departmentName: 'Phòng Kỹ thuật',
        position: 'Kỹ sư phần mềm',
        decisionType: 'discipline',
        disciplineType: 'Khiển trách',
        violation: 'Đi muộn 3 lần trong tháng 11/2024',
        penalty: 'Nhắc nhở bằng văn bản',
        status: 'ACTIVE',
        decisionNumber: 'QD-KL-2024-005',
        decisionDate: '2024-11-25',
        effectiveDate: '2024-11-25',
        createdBy: 'Lê Văn C (Admin)',
        createdDate: '2024-11-23',
        note: 'Lần đầu vi phạm',
    } as DisciplineDecision,
];

export const statusLabels: Record<DecisionStatus, string> = {
    ACTIVE: 'Đang hiệu lực',
    INACTIVE: 'Đã vô hiệu',
};

export const decisionTypeLabels = {
    reward: 'Khen thưởng',
    discipline: 'Kỷ luật',
    appointment: 'Bổ nhiệm',
    dismissal: 'Miễn nhiệm',
    'salary-adjustment': 'Điều chỉnh lương',
    transfer: 'Điều chuyển',
    'terminate-contract': 'Chấm dứt hợp đồng',
    'extend-contract': 'Gia hạn hợp đồng',
};

export const decisionTypeIcons = {
    reward: Award,
    discipline: AlertCircle,
    appointment: UserPlus,
    dismissal: UserMinus,
    'salary-adjustment': DollarSign,
    transfer: ArrowRightLeft,
    'terminate-contract': XCircle,
    'extend-contract': Calendar,
};

export const decisionTypeColors = {
    reward: 'bg-green-100 text-green-800',
    discipline: 'bg-red-100 text-red-800',
    appointment: 'bg-blue-100 text-blue-800',
    dismissal: 'bg-orange-100 text-orange-800',
    'salary-adjustment': 'bg-purple-100 text-purple-800',
    transfer: 'bg-indigo-100 text-indigo-800',
    'terminate-contract': 'bg-gray-100 text-gray-800',
    'extend-contract': 'bg-cyan-100 text-cyan-800',
};

// ==================== ADD/EDIT MODAL ====================

interface DecisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (decision: Partial<Decision>) => void;
    decision?: Decision | null;
    employeeId: number;
    userData?: any;
}

function DecisionModal({ isOpen, onClose, onSave, decision, employeeId, userData }: DecisionModalProps) {
    const [formData, setFormData] = useState({
        decisionType: 'reward' as Decision['decisionType'],
        decisionNumber: '',
        decisionDate: new Date().toISOString().split('T')[0],
        note: '',
        // Reward fields
        achievement: '',
        // Discipline fields
        violationDescription: '',
        // Appointment fields
        newPosition: '',
        newDepartment: '',
        // Dismissal fields
        dismissalPosition: '',
        // Terminate contract fields
        terminateReason: '',
        terminateDate: '',
        // Extend contract fields
        currentEndDate: '',
        newEndDate: '',
        extendReason: '',
        // File upload
        attachments: [] as File[],
    });

    const fileInputRef = useState<HTMLInputElement | null>(null);

    useEffect(() => {
        if (decision) {
            setFormData({
                decisionType: decision.decisionType,
                decisionNumber: decision.decisionNumber,
                decisionDate: decision.decisionDate,
                note: decision.note || '',
                achievement: (decision as RewardDecision).achievement || '',
                violationDescription: (decision as DisciplineDecision).violation || '',
                newPosition: (decision as AppointmentDecision).newPosition || '',
                newDepartment: (decision as AppointmentDecision).newDepartment || '',
                dismissalPosition: (decision as DismissalDecision).currentPosition || '',
                terminateReason: (decision as TerminateContractDecision).terminateReason || '',
                terminateDate: (decision as TerminateContractDecision).terminateDate || '',
                currentEndDate: (decision as ExtendContractDecision).currentEndDate || '',
                newEndDate: (decision as ExtendContractDecision).newEndDate || '',
                extendReason: (decision as ExtendContractDecision).extendReason || '',
                attachments: [],
            });
        } else {
            setFormData({
                decisionType: 'reward',
                decisionNumber: '',
                decisionDate: new Date().toISOString().split('T')[0],
                note: '',
                achievement: '',
                violationDescription: '',
                newPosition: '',
                newDepartment: '',
                dismissalPosition: '',
                terminateReason: '',
                terminateDate: '',
                currentEndDate: '',
                newEndDate: '',
                extendReason: '',
                attachments: [],
            });
        }
    }, [decision, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData({ ...formData, attachments: Array.from(e.target.files) });
        }
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = [...formData.attachments];
        newFiles.splice(index, 1);
        setFormData({ ...formData, attachments: newFiles });
    };

    const handleSubmit = () => {
        const baseDecision = {
            id: decision?.id || `NEW-${Date.now()}`,
            employeeId: employeeId.toString(),
            employeeName: userData?.fullName || userData?.name || 'N/A',
            departmentName: userData?.departmentName || 'N/A',
            position: userData?.positionName || 'N/A',
            decisionType: formData.decisionType,
            decisionNumber: formData.decisionNumber,
            decisionDate: formData.decisionDate,
            status: 'ACTIVE' as DecisionStatus,
            createdBy: 'Admin',
            createdDate: new Date().toISOString(),
            note: formData.note,
            attachments: formData.attachments.map(f => f.name),
        };

        let newDecision: Partial<Decision> = baseDecision;

        // Add type-specific fields
        switch (formData.decisionType) {
            case 'reward':
                newDecision = {
                    ...baseDecision,
                    achievement: formData.achievement,
                    rewardType: '',
                    reason: '',
                } as Partial<RewardDecision>;
                break;
            case 'discipline':
                newDecision = {
                    ...baseDecision,
                    violation: formData.violationDescription,
                    disciplineType: '',
                    penalty: '',
                } as Partial<DisciplineDecision>;
                break;
            case 'appointment':
                newDecision = {
                    ...baseDecision,
                    newPosition: formData.newPosition,
                    newDepartment: formData.newDepartment,
                    effectiveDate: formData.decisionDate,
                    reason: '',
                } as Partial<AppointmentDecision>;
                break;
            case 'dismissal':
                newDecision = {
                    ...baseDecision,
                    currentPosition: formData.dismissalPosition,
                    dismissalDate: formData.decisionDate,
                    reason: '',
                } as Partial<DismissalDecision>;
                break;
            case 'terminate-contract':
                newDecision = {
                    ...baseDecision,
                    terminateReason: formData.terminateReason,
                    terminateDate: formData.terminateDate,
                } as Partial<TerminateContractDecision>;
                break;
            case 'extend-contract':
                newDecision = {
                    ...baseDecision,
                    currentEndDate: formData.currentEndDate,
                    newEndDate: formData.newEndDate,
                    extendReason: formData.extendReason,
                } as Partial<ExtendContractDecision>;
                break;
        }

        console.log('Saving with files:', formData.attachments);
        onSave(newDecision);
        onClose();
    };

    const renderConditionalFields = () => {
        switch (formData.decisionType) {
            case 'reward':
                return (
                    <div className="grid gap-2">
                        <Label htmlFor="achievement">Thành tích *</Label>
                        <Textarea
                            id="achievement"
                            value={formData.achievement}
                            onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                            placeholder="Mô tả thành tích đạt được"
                            rows={3}
                        />
                    </div>
                );
            case 'discipline':
                return (
                    <div className="grid gap-2">
                        <Label htmlFor="violationDescription">Mô tả vi phạm *</Label>
                        <Textarea
                            id="violationDescription"
                            value={formData.violationDescription}
                            onChange={(e) => setFormData({ ...formData, violationDescription: e.target.value })}
                            placeholder="Mô tả chi tiết vi phạm"
                            rows={3}
                        />
                    </div>
                );
            case 'appointment':
                return (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="newPosition">Chức vụ mới *</Label>
                            <Input
                                id="newPosition"
                                value={formData.newPosition}
                                onChange={(e) => setFormData({ ...formData, newPosition: e.target.value })}
                                placeholder="Nhập chức vụ mới"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="newDepartment">Phòng ban mới</Label>
                            <Input
                                id="newDepartment"
                                value={formData.newDepartment}
                                onChange={(e) => setFormData({ ...formData, newDepartment: e.target.value })}
                                placeholder="Nhập phòng ban mới (nếu có)"
                            />
                        </div>
                    </>
                );
            case 'dismissal':
                return (
                    <div className="grid gap-2">
                        <Label htmlFor="dismissalPosition">Chức vụ bị miễn nhiệm *</Label>
                        <Input
                            id="dismissalPosition"
                            value={formData.dismissalPosition}
                            onChange={(e) => setFormData({ ...formData, dismissalPosition: e.target.value })}
                            placeholder="Nhập chức vụ bị miễn nhiệm"
                        />
                    </div>
                );
            case 'terminate-contract':
                return (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="terminateDate">Ngày chấm dứt hợp đồng *</Label>
                            <Input
                                id="terminateDate"
                                type="date"
                                value={formData.terminateDate}
                                onChange={(e) => setFormData({ ...formData, terminateDate: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="terminateReason">Lý do chấm dứt *</Label>
                            <Textarea
                                id="terminateReason"
                                value={formData.terminateReason}
                                onChange={(e) => setFormData({ ...formData, terminateReason: e.target.value })}
                                placeholder="Nhập lý do chấm dứt hợp đồng"
                                rows={3}
                            />
                        </div>
                    </>
                );
            case 'extend-contract':
                return (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="currentEndDate">Ngày kết thúc hiện tại *</Label>
                            <Input
                                id="currentEndDate"
                                type="date"
                                value={formData.currentEndDate}
                                onChange={(e) => setFormData({ ...formData, currentEndDate: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="newEndDate">Ngày kết thúc mới *</Label>
                            <Input
                                id="newEndDate"
                                type="date"
                                value={formData.newEndDate}
                                onChange={(e) => setFormData({ ...formData, newEndDate: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="extendReason">Lý do gia hạn *</Label>
                            <Textarea
                                id="extendReason"
                                value={formData.extendReason}
                                onChange={(e) => setFormData({ ...formData, extendReason: e.target.value })}
                                placeholder="Nhập lý do gia hạn hợp đồng"
                                rows={3}
                            />
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    const isFormValid = () => {
        if (!formData.decisionNumber || !formData.decisionDate) return false;

        switch (formData.decisionType) {
            case 'reward':
                return !!formData.achievement;
            case 'discipline':
                return !!formData.violationDescription;
            case 'appointment':
                return !!formData.newPosition;
            case 'dismissal':
                return !!formData.dismissalPosition;
            case 'terminate-contract':
                return !!formData.terminateDate && !!formData.terminateReason;
            case 'extend-contract':
                return !!formData.currentEndDate && !!formData.newEndDate && !!formData.extendReason;
            default:
                return true;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {decision ? 'Chỉnh sửa quyết định' : 'Thêm quyết định mới'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="decisionType">Loại quyết định *</Label>
                            <Select
                                value={formData.decisionType}
                                onValueChange={(value) => setFormData({ ...formData, decisionType: value as Decision['decisionType'] })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(decisionTypeLabels).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="decisionNumber">Số quyết định *</Label>
                            <Input
                                id="decisionNumber"
                                value={formData.decisionNumber}
                                onChange={(e) => setFormData({ ...formData, decisionNumber: e.target.value })}
                                placeholder="VD: QD-KT-2025-001"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="decisionDate">Ngày quyết định *</Label>
                            <Input
                                id="decisionDate"
                                type="date"
                                value={formData.decisionDate}
                                onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })}
                            />
                        </div>

                        {/* Conditional fields based on decision type */}
                        {renderConditionalFields()}

                        <div className="grid gap-2">
                            <Label htmlFor="note">Ghi chú</Label>
                            <Textarea
                                id="note"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                placeholder="Nhập ghi chú (nếu có)"
                                rows={3}
                            />
                        </div>

                        {/* File Upload */}
                        <div className="grid gap-2">
                            <Label htmlFor="attachments">Tệp đính kèm</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef[0]?.click()}
                                    className="w-full"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Chọn tệp
                                </Button>
                                <input
                                    type="file"
                                    ref={(ref) => (fileInputRef[0] = ref)}
                                    onChange={handleFileChange}
                                    multiple
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                            </div>
                            {formData.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {formData.attachments.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span className="text-sm">{file.name}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveFile(index)}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isFormValid()}
                    >
                        Xác nhận
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
// ==================== VIEW DETAIL MODAL ====================

interface ViewDecisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    decision: Decision | null;
}

function ViewDecisionModal({ isOpen, onClose, decision }: ViewDecisionModalProps) {
    if (!decision) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chi tiết quyết định</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Loại quyết định</Label>
                            <div className="mt-1">
                                {decisionTypeLabels[decision.decisionType]}
                            </div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Trạng thái</Label>
                            <div className="mt-1">
                                <Badge className={decision.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {statusLabels[decision.status]}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Số quyết định</Label>
                            <div className="mt-1 font-medium">{decision.decisionNumber}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Ngày quyết định</Label>
                            <div className="mt-1">{new Date(decision.decisionDate).toLocaleDateString('vi-VN')}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Người tạo</Label>
                            <div className="mt-1">{decision.createdBy}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Ngày tạo</Label>
                            <div className="mt-1">{new Date(decision.createdDate).toLocaleDateString('vi-VN')}</div>
                        </div>
                    </div>

                    {decision.note && (
                        <div>
                            <Label className="text-muted-foreground">Ghi chú</Label>
                            <div className="mt-1 p-3 bg-muted rounded-md">{decision.note}</div>
                        </div>
                    )}

                    {decision.attachments && decision.attachments.length > 0 && (
                        <div>
                            <Label className="text-muted-foreground">Tệp đính kèm</Label>
                            <div className="mt-1 space-y-2">
                                {decision.attachments.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm">{file}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ==================== MAIN COMPONENT ====================

export default function AllDecisionsTab({
    employeeId,
    userData,
    onSwitchToDecisionType
}: AllDecisionsTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
    const [editingDecision, setEditingDecision] = useState<Decision | null>(null);

    useEffect(() => {
        fetchDecisions();
    }, [page, pageSize, searchTerm, statusFilter, typeFilter, employeeId]);

    const fetchDecisions = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));

        let filtered = mockAllDecisions.filter(d =>
            d.employeeId === employeeId.toString()
        );

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(d => d.status === statusFilter);
        }

        if (typeFilter !== 'ALL') {
            filtered = filtered.filter(d => d.decisionType === typeFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(d =>
                d.decisionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                decisionTypeLabels[d.decisionType].toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setTotalItems(filtered.length);

        const start = page * pageSize;
        const end = start + pageSize;
        setDecisions(filtered.slice(start, end));

        setIsLoading(false);
    };

    const handleSaveDecision = (decision: Partial<Decision>) => {
        console.log('Saving decision:', decision);
        // TODO: Call API to save
        fetchDecisions();
    };

    const handleDeleteDecision = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa quyết định này?')) {
            console.log('Deleting decision:', id);
            // TODO: Call API to delete
            fetchDecisions();
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: DecisionStatus) => {
        const action = currentStatus === 'ACTIVE' ? 'vô hiệu hóa' : 'kích hoạt lại';
        if (confirm(`Bạn có chắc chắn muốn ${action} quyết định này?`)) {
            console.log('Toggling status:', id, currentStatus);
            // TODO: Call API to toggle status
            fetchDecisions();
        }
    };

    const handleViewDetail = (decision: Decision) => {
        setSelectedDecision(decision);
        setIsViewModalOpen(true);
    };

    const handleEdit = (decision: Decision) => {
        setEditingDecision(decision);
        setIsModalOpen(true);
    };

    const getStatusBadge = (status: DecisionStatus) => {
        const config = {
            'ACTIVE': { label: statusLabels.ACTIVE, className: 'bg-green-100 text-green-800' },
            'INACTIVE': { label: statusLabels.INACTIVE, className: 'bg-red-100 text-red-800' },
        };
        return <Badge className={config[status].className}>{config[status].label}</Badge>;
    };

    const getDecisionTypeBadge = (type: Decision['decisionType']) => {
        const Icon = decisionTypeIcons[type];
        return (
            <Badge className={decisionTypeColors[type]}>
                <Icon className="h-3 w-3 mr-1" />
                {decisionTypeLabels[type]}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const getDecisionDetails = (decision: Decision) => {
        switch (decision.decisionType) {
            case 'reward':
                return (
                    <div className="text-sm">
                        <div className="font-medium">{decision.rewardType}</div>
                        <div className="text-muted-foreground line-clamp-1">{decision.achievement}</div>
                        {decision.proposedAmount && (
                            <div className="text-green-600 font-medium mt-1">
                                {formatCurrency(decision.proposedAmount)}
                            </div>
                        )}
                    </div>
                );
            case 'discipline':
                return (
                    <div className="text-sm">
                        <div className="font-medium">{decision.disciplineType}</div>
                        <div className="text-muted-foreground line-clamp-1">{decision.violation}</div>
                    </div>
                );
            case 'appointment':
                return (
                    <div className="text-sm">
                        <div className="font-medium">→ {decision.newPosition}</div>
                        <div className="text-muted-foreground">{decision.newDepartment || decision.departmentName}</div>
                    </div>
                );
            case 'dismissal':
                return (
                    <div className="text-sm">
                        <div className="font-medium">{decision.currentPosition}</div>
                        <div className="text-muted-foreground">
                            Ngày miễn nhiệm: {new Date(decision.dismissalDate).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                );
            case 'salary-adjustment':
                return (
                    <div className="text-sm">
                        <div className="flex items-center gap-2">
                            <span className="line-through text-muted-foreground">
                                {formatCurrency(decision.currentSalary)}
                            </span>
                            <span>→</span>
                            <span className="font-medium text-green-600">
                                {formatCurrency(decision.newSalary)}
                            </span>
                        </div>
                        <div className="text-muted-foreground">
                            Tăng {decision.adjustmentRate}%
                        </div>
                    </div>
                );
            case 'transfer':
                return (
                    <div className="text-sm">
                        <div className="font-medium">
                            {decision.fromDepartment} → {decision.toDepartment}
                        </div>
                        <div className="text-muted-foreground">
                            {decision.fromPosition} → {decision.toPosition}
                        </div>
                    </div>
                );
            case 'terminate-contract':
                return (
                    <div className="text-sm">
                        <div className="font-medium">Chấm dứt hợp đồng</div>
                        <div className="text-muted-foreground">
                            Ngày: {new Date(decision.terminateDate).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                );
            case 'extend-contract':
                return (
                    <div className="text-sm">
                        <div className="font-medium">Gia hạn hợp đồng</div>
                        <div className="text-muted-foreground">
                            {new Date(decision.currentEndDate).toLocaleDateString('vi-VN')} → {new Date(decision.newEndDate).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = page * pageSize + 1;
    const endIndex = Math.min((page + 1) * pageSize, totalItems);

    return (
        <div className="space-y-4">
            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo số quyết định, loại quyết định..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Loại quyết định" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả loại</SelectItem>
                            {Object.entries(decisionTypeLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value="ACTIVE">Đang hiệu lực</SelectItem>
                            <SelectItem value="INACTIVE">Đã vô hiệu</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={() => {
                            setEditingDecision(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-green-500 hover:bg-green-600"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm quyết định
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Loại quyết định</TableHead>
                                <TableHead>Chi tiết</TableHead>
                                <TableHead>Số quyết định</TableHead>
                                <TableHead>Ngày quyết định</TableHead>
                                <TableHead>Trạng thái</TableHead>
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
                                            <FileText className="h-8 w-8" />
                                            <p>Chưa có quyết định nào</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                decisions.map((decision) => (
                                    <TableRow key={decision.id}>
                                        <TableCell>
                                            {getDecisionTypeBadge(decision.decisionType)}
                                        </TableCell>
                                        <TableCell>
                                            {getDecisionDetails(decision)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{decision.decisionNumber}</div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(decision.decisionDate).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(decision.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 justify-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetail(decision)}
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(decision)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(decision.id, decision.status)}
                                                    title={decision.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt lại'}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteDecision(decision.id)}
                                                    title="Xóa"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {!isLoading && decisions.length > 0 && (
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
            <DecisionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingDecision(null);
                }}
                onSave={handleSaveDecision}
                decision={editingDecision}
                employeeId={employeeId}
                userData={userData}
            />

            <ViewDecisionModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedDecision(null);
                }}
                decision={selectedDecision}
            />
        </div>
    )
}
// components/DisciplineDetailModal.tsx

import { useState, useEffect } from 'react';
import { X, Download, Upload, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { 
  mockDisciplines,
  type Discipline,
  type DisciplineAction,
  statusLabels,
  actionLabels,
  severityLabels
} from '../../../mock/dismissed';

interface DisciplineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  disciplineId: string | null;
  onSuccess: () => void;
  isAdmin: boolean;
  isManager: boolean;
}

export default function DisciplineDetailModal({
  isOpen,
  onClose,
  disciplineId,
  onSuccess,
  isAdmin,
  isManager,
}: DisciplineDetailModalProps) {
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'explanation' | 'decision'>('info');
  
  // For employee explanation
  const [explanationText, setExplanationText] = useState('');
  const [explanationFiles, setExplanationFiles] = useState<File[]>([]);
  const [isSubmittingExplanation, setIsSubmittingExplanation] = useState(false);

  // For admin decision
  const [decisionNumber, setDecisionNumber] = useState('');
  const [decisionDate, setDecisionDate] = useState('');
  const [disciplineAction, setDisciplineAction] = useState<DisciplineAction | ''>('');
  const [decisionReason, setDecisionReason] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  useEffect(() => {
    if (isOpen && disciplineId) {
      fetchDisciplineDetail();
    }
  }, [isOpen, disciplineId]);

  const fetchDisciplineDetail = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const found = mockDisciplines.find(d => d.id === disciplineId);
    if (found) {
      setDiscipline(found);
      setExplanationText(found.explanationText || '');
      setDecisionNumber(found.decisionNumber || '');
      setDecisionDate(found.decisionDate || '');
      setDisciplineAction(found.disciplineAction || '');
      setDecisionReason(found.decisionReason || '');
    }

    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setExplanationFiles(Array.from(e.target.files));
    }
  };

  const handleSubmitExplanation = async () => {
    if (!explanationText.trim()) {
      alert('Vui lòng nhập nội dung giải trình');
      return;
    }

    setIsSubmittingExplanation(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Submit explanation:', {
      disciplineId,
      explanationText,
      files: explanationFiles.map(f => f.name),
    });

    setIsSubmittingExplanation(false);
    onSuccess();
  };

  const handleSubmitDecision = async () => {
    if (!decisionNumber.trim()) {
      alert('Vui lòng nhập số quyết định');
      return;
    }
    if (!decisionDate) {
      alert('Vui lòng chọn ngày quyết định');
      return;
    }
    if (!disciplineAction) {
      alert('Vui lòng chọn hình thức kỷ luật');
      return;
    }
    if (!decisionReason.trim()) {
      alert('Vui lòng nhập lý do quyết định');
      return;
    }

    setIsSubmittingDecision(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Submit decision:', {
      disciplineId,
      decisionNumber,
      decisionDate,
      disciplineAction,
      decisionReason,
    });

    setIsSubmittingDecision(false);
    onSuccess();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: statusLabels.DRAFT, className: 'bg-gray-100 text-gray-800', icon: FileText },
      'PENDING_EXPLANATION': { label: statusLabels.PENDING_EXPLANATION, className: 'bg-blue-100 text-blue-800', icon: AlertTriangle },
      'PENDING_REVIEW': { label: statusLabels.PENDING_REVIEW, className: 'bg-yellow-100 text-yellow-800', icon: FileText },
      'OVERDUE': { label: statusLabels.OVERDUE, className: 'bg-red-100 text-red-800', icon: AlertTriangle },
      'COMPLETED': { label: statusLabels.COMPLETED, className: 'bg-green-100 text-green-800', icon: CheckCircle },
      'DISMISSED': { label: statusLabels.DISMISSED, className: 'bg-purple-100 text-purple-800', icon: XCircle },
    };

    const config = statusConfig[status] || { label: status, className: '', icon: FileText };
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (!isOpen) return null;

  if (isLoading || !discipline) {
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

  const canSubmitExplanation = discipline.status === 'PENDING_EXPLANATION' && !isManager && !isAdmin;
  const canMakeDecision = isAdmin && 
    (discipline.status === 'PENDING_REVIEW' || discipline.status === 'OVERDUE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Chi tiết hồ sơ kỷ luật</h2>
            {getStatusBadge(discipline.status)}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('info')}
          >
            Thông tin vi phạm
          </button>
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'explanation'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('explanation')}
          >
            Giải trình
            {discipline.explanationText && (
              <Badge className="ml-2 bg-green-100 text-green-800">Đã nộp</Badge>
            )}
          </button>
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'decision'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('decision')}
          >
            Quyết định
            {discipline.decisionNumber && (
              <Badge className="ml-2 bg-blue-100 text-blue-800">Đã có</Badge>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Tab: Thông tin vi phạm */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nhân viên</Label>
                  <div className="mt-1">
                    <p className="font-medium">{discipline.employeeName}</p>
                    <p className="text-sm text-gray-500">{discipline.departmentName}</p>
                    <p className="text-sm text-gray-500">{discipline.position}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Mức độ vi phạm</Label>
                  <div className="mt-1">
                    <Badge className={
                      discipline.severity === 'LIGHT' ? 'bg-blue-100 text-blue-800' :
                      discipline.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {severityLabels[discipline.severity]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Loại vi phạm</Label>
                  <p className="mt-1 font-medium">{discipline.violationType}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Ngày vi phạm</Label>
                  <p className="mt-1">
                    {new Date(discipline.violationDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Địa điểm</Label>
                  <p className="mt-1">{discipline.violationLocation}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Người ghi nhận</Label>
                  <div className="mt-1">
                    <p className="font-medium">{discipline.createdByName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(discipline.createdDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Mô tả hành vi vi phạm</Label>
                <p className="mt-1 text-sm bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                  {discipline.violationDescription}
                </p>
              </div>

              {discipline.sentDate && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Ngày gửi thông báo</Label>
                    <p className="mt-1">
                      {new Date(discipline.sentDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Hạn giải trình</Label>
                    <p className={`mt-1 ${
                      discipline.explanationDeadline && 
                      new Date(discipline.explanationDeadline) < new Date() &&
                      discipline.status === 'PENDING_EXPLANATION'
                        ? 'text-red-600 font-medium'
                        : ''
                    }`}>
                      {discipline.explanationDeadline 
                        ? new Date(discipline.explanationDeadline).toLocaleDateString('vi-VN')
                        : 'Chưa có'}
                    </p>
                  </div>
                </div>
              )}

              {discipline.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ghi chú</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                    {discipline.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Giải trình */}
          {activeTab === 'explanation' && (
            <div className="space-y-6">
              {discipline.explanationText ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-500">
                      Nội dung giải trình
                    </Label>
                    <span className="text-sm text-gray-500">
                      Ngày nộp: {discipline.explanationDate 
                        ? new Date(discipline.explanationDate).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{discipline.explanationText}</p>
                  </div>

                  {discipline.explanationFiles && discipline.explanationFiles.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-500">
                        File đính kèm ({discipline.explanationFiles.length})
                      </Label>
                      <div className="mt-2 space-y-2">
                        {discipline.explanationFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{file}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : canSubmitExplanation ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Bạn cần nộp giải trình</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Hạn cuối: {discipline.explanationDeadline 
                            ? new Date(discipline.explanationDeadline).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="explanationText">
                      Nội dung giải trình <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="explanationText"
                      value={explanationText}
                      onChange={(e) => setExplanationText(e.target.value)}
                      placeholder="Nhập nội dung giải trình của bạn..."
                      rows={6}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="explanationFiles">File đính kèm</Label>
                    <div className="mt-1">
                      <label
                        htmlFor="explanationFiles"
                        className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:border-blue-400 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Tải lên tài liệu minh chứng (PDF, DOCX, hình ảnh)
                        </span>
                      </label>
                      <input
                        id="explanationFiles"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </div>
                    {explanationFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {explanationFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4" />
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Nhân viên chưa nộp giải trình</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Quyết định */}
          {activeTab === 'decision' && (
            <div className="space-y-6">
              {discipline.decisionNumber ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Đã có quyết định kỷ luật</p>
                        <p className="text-sm text-green-700 mt-1">
                          Số QĐ: {discipline.decisionNumber} - 
                          Ngày: {discipline.decisionDate 
                            ? new Date(discipline.decisionDate).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Hình thức kỷ luật</Label>
                      <div className="mt-1">
                        <Badge className={
                          discipline.disciplineAction === 'DISMISSED' ? 'bg-purple-100 text-purple-800' :
                          discipline.disciplineAction === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {discipline.disciplineAction && actionLabels[discipline.disciplineAction]}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Người quyết định</Label>
                      <p className="mt-1 font-medium">{discipline.decisionByName || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Lý do quyết định</Label>
                    <p className="mt-1 text-sm bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                      {discipline.decisionReason}
                    </p>
                  </div>
                </div>
              ) : canMakeDecision ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Cần ra quyết định kỷ luật</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Vui lòng xem xét hồ sơ và đưa ra quyết định cuối cùng
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="decisionNumber">
                        Số quyết định <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="decisionNumber"
                        value={decisionNumber}
                        onChange={(e) => setDecisionNumber(e.target.value)}
                        placeholder="VD: QĐ-KL-2024-001"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="decisionDate">
                        Ngày quyết định <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="decisionDate"
                        type="date"
                        value={decisionDate}
                        onChange={(e) => setDecisionDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="disciplineAction">
                      Hình thức kỷ luật <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={disciplineAction}
                      onValueChange={(value: DisciplineAction) => setDisciplineAction(value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn hình thức kỷ luật" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WARNING">Khiển trách</SelectItem>
                        <SelectItem value="REPRIMAND">Cảnh cáo</SelectItem>
                        <SelectItem value="SALARY_CUT">Cắt giảm lương</SelectItem>
                        <SelectItem value="DEMOTION">Giáng chức</SelectItem>
                        <SelectItem value="TERMINATION">Sa thải</SelectItem>
                        <SelectItem value="DISMISSED">Không xử lý kỷ luật</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="decisionReason">
                      Lý do quyết định <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="decisionReason"
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      placeholder="Nhập lý do và căn cứ pháp lý của quyết định..."
                      rows={5}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Chưa có quyết định kỷ luật</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>

          {canSubmitExplanation && activeTab === 'explanation' && (
            <Button
              onClick={handleSubmitExplanation}
              disabled={isSubmittingExplanation || !explanationText.trim()}
            >
              {isSubmittingExplanation ? 'Đang gửi...' : 'Nộp giải trình'}
            </Button>
          )}

          {canMakeDecision && activeTab === 'decision' && (
            <Button
              onClick={handleSubmitDecision}
              disabled={isSubmittingDecision}
            >
              {isSubmittingDecision ? 'Đang xử lý...' : 'Ra quyết định'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
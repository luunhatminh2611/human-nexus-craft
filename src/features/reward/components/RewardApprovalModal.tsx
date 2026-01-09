// pages/hr/components/RewardDetailModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button/Button2';
import { Card } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { 
  X, 
  Award, 
  User, 
  Calendar,
  FileText,
  History,
  Download,
  Eye as EyeIcon
} from 'lucide-react';
import { mockRewards, type Reward } from '../../../mock/reward';

interface RewardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardId: string | null;
}

export default function RewardDetailModal({
  isOpen,
  onClose,
  rewardId,
}: RewardDetailModalProps) {
  const [reward, setReward] = useState<Reward | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && rewardId) {
      fetchRewardDetails();
    }
  }, [isOpen, rewardId]);

  const fetchRewardDetails = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const foundReward = mockRewards.find(r => r.id === rewardId);
    if (foundReward) {
      setReward(foundReward);
    }

    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!reward) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>Không tìm thấy thông tin quyết định khen thưởng</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Chi tiết quyết định khen thưởng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ID and Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mã: {reward.id}</span>
            <div className="text-sm text-muted-foreground">
              Ngày tạo: {new Date(reward.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>

          {/* Employee Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin nhân viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Tên nhân viên</Label>
                <p className="font-medium">{reward.employeeName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phòng ban</Label>
                <p className="font-medium">{reward.departmentName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Chức vụ</Label>
                <p className="font-medium">{reward.position}</p>
              </div>
            </div>
          </Card>

          {/* Reward Details */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Chi tiết khen thưởng
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Loại khen thưởng</Label>
                <p className="font-medium">{reward.rewardType}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Thành tích</Label>
                <p className="whitespace-pre-wrap">{reward.achievement}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Lý do khen thưởng</Label>
                <p className="whitespace-pre-wrap">{reward.reason}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Mức khen thưởng</Label>
                <p className="font-medium text-lg text-green-600">
                  {formatCurrency(reward.amount)}
                </p>
              </div>
            </div>
          </Card>

          {/* Decision Information */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
              <FileText className="h-4 w-4" />
              Thông tin quyết định
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Số quyết định</Label>
                <p className="font-medium">{reward.decisionNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ngày quyết định</Label>
                <p className="font-medium">
                  {new Date(reward.decisionDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Người tạo</Label>
                <p className="font-medium">{reward.createdBy}</p>
              </div>
            </div>
          </Card>

          {/* Reward History */}
          {reward.rewardHistory && reward.rewardHistory.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                Lịch sử khen thưởng
              </h3>
              <div className="space-y-3">
                {reward.rewardHistory.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{item.rewardType}</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Attachments */}
          {reward.attachments && reward.attachments.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                File đính kèm
              </h3>
              <div className="space-y-2">
                {reward.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg hover:bg-muted transition-colors"
                  >
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.fileSize / 1024).toFixed(1)} KB • 
                        {new Date(attachment.uploadedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                        title="Xem file"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = attachment.url;
                          link.download = attachment.fileName;
                          link.click();
                        }}
                        title="Tải xuống"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
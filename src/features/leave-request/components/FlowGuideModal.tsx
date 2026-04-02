import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, ShieldCheck, AlertTriangle, BanknoteIcon, Clock, FileText } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const Section = ({ icon: Icon, title, children, color }: { icon: any; title: string; children: React.ReactNode; color: string }) => (
  <div className="space-y-2">
    <h3 className={`font-semibold flex items-center gap-2 ${color}`}>
      <Icon className="h-4 w-4" />
      {title}
    </h3>
    <div className="pl-6 text-sm text-muted-foreground space-y-1">{children}</div>
  </div>
);

export default function FlowGuideModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">📋 Hướng dẫn quy trình nghỉ phép — TKV</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <Section icon={CalendarDays} title="1. Nghỉ phép năm (ANNUAL)" color="text-violet-600">
            <p>• Yêu cầu: Đủ <strong>12 tháng</strong> làm việc trở lên</p>
            <p>• Định mức: <strong>12–16 ngày/năm</strong> tùy điều kiện lao động</p>
            <p>• Cứ mỗi <strong>5 năm</strong> công tác → +1 ngày phép</p>
            <p className="font-medium text-foreground mt-1">Thời gian tính vào tháng làm việc:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Thời gian tập sự, thử việc</li>
              <li>Nghỉ phép có lương</li>
              <li>Nghỉ ốm (giới hạn theo quy định)</li>
              <li>Nghỉ tai nạn lao động</li>
            </ul>
          </Section>

          <Separator />

          <Section icon={ShieldCheck} title="2. Nghỉ chế độ BHXH (SOCIAL)" color="text-blue-600">
            <p>• <strong>Không trừ</strong> phép năm</p>
            <p>• Bắt buộc nộp giấy tờ chứng minh (giấy bác sĩ, giấy khai sinh...)</p>
            <p>• Bao gồm: Ốm đau, Thai sản, Tai nạn lao động</p>
            <p>• Thời gian hưởng theo quy định BHXH</p>
          </Section>

          <Separator />

          <Section icon={AlertTriangle} title="3. Nghỉ khẩn cấp (Emergency)" color="text-red-600">
            <p>• Được phép nghỉ trước, làm đơn sau</p>
            <p>• Phải <strong>thông báo trong vòng 2 giờ</strong></p>
            <p>• Nộp giấy tờ bổ sung trong 3 ngày làm việc</p>
          </Section>

          <Separator />

          <Section icon={FileText} title="4. Nghỉ việc riêng hưởng lương (PERSONAL_PAID)" color="text-emerald-600">
            <p>• Tang lễ (ông bà, cha mẹ): <strong>3 ngày</strong></p>
            <p>• Kết hôn: <strong>3 ngày</strong></p>
            <p>• Con kết hôn: <strong>1 ngày</strong></p>
            <p>• Không trừ vào phép năm</p>
          </Section>

          <Separator />

          <Section icon={BanknoteIcon} title="5. Nghỉ không lương (UNPAID)" color="text-orange-600">
            <p>• Cần được <strong>HR phê duyệt</strong></p>
            <p>• <strong>Ảnh hưởng trực tiếp</strong> đến lương tháng</p>
            <p>• Không tính vào thời gian đóng BHXH</p>
          </Section>

          <Separator />

          <Section icon={Clock} title="6. Quy trình duyệt" color="text-foreground">
            <div className="flex items-center gap-2 flex-wrap text-xs font-medium">
              <span className="px-2 py-1 bg-muted rounded">Nhân viên tạo đơn</span>
              <span>→</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">Quản lý duyệt</span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">HR duyệt</span>
              <span>→</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Hoàn tất</span>
            </div>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

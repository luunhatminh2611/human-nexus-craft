import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  BanknoteIcon,
  Clock,
  FileText,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

function Section({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className={`font-semibold flex items-center gap-2 ${color}`}>
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      <div className="pl-6 text-sm text-muted-foreground space-y-1">{children}</div>
    </div>
  );
}

export default function FlowGuideModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📘 Hướng dẫn quy trình nghỉ phép</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* ── Section 0: Working time calculation ─────────── */}
          <Section icon={Clock} title="Tính thời gian làm việc hiệu lực" color="text-foreground">
            <p className="font-medium text-foreground">Thời gian được tính vào 12 tháng:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>✅ Thời gian thực tế làm việc</li>
              <li>✅ Thử việc, tập sự</li>
              <li>✅ Nghỉ ốm (≤ 2 tháng)</li>
              <li>✅ Thai sản (toàn bộ)</li>
              <li>✅ Nghỉ không lương (≤ 1 tháng)</li>
              <li>✅ Tai nạn lao động (toàn bộ)</li>
              <li>✅ Thời gian làm tại <strong>công ty nhà nước</strong> trước đó (HR xác nhận)</li>
            </ul>
            <div className="mt-2 p-2 bg-muted rounded text-xs">
              <strong>VD Mock #2 — Trần Thị B:</strong> 5 th thực tế + 2 th thử việc + 1 th không
              lương = <strong>8 tháng</strong> → Chưa đủ 12 tháng
            </div>
          </Section>

          <Separator />

          {/* ── Section 1: Annual leave ──────────────────────── */}
          <Section icon={CalendarDays} title="1. Nghỉ phép năm (ANNUAL)" color="text-violet-600">
            <p>
              • Yêu cầu: Đủ <strong>12 tháng hiệu lực</strong> trở lên
            </p>
            <p>• Định mức theo loại công việc:</p>
            <table className="w-full mt-1 text-xs border">
              <thead>
                <tr className="bg-muted">
                  <th className="p-1.5 text-left border">Loại công việc</th>
                  <th className="p-1.5 text-center border">Ngày phép/năm</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1.5 border">Bình thường</td>
                  <td className="p-1.5 text-center border">12</td>
                </tr>
                <tr>
                  <td className="p-1.5 border">Nặng nhọc, độc hại</td>
                  <td className="p-1.5 text-center border">14</td>
                </tr>
                <tr>
                  <td className="p-1.5 border">Đặc biệt nặng nhọc (hầm lò)</td>
                  <td className="p-1.5 text-center border">16</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-1">
              • Cứ mỗi <strong>5 năm</strong> công tác → +1 ngày
            </p>
            <p>
              • <strong>Luồng:</strong> Nhân viên → Quản lý duyệt → Hoàn tất
            </p>
            <div className="mt-2 p-2 bg-muted rounded text-xs">
              <strong>VD Mock #1 — Nguyễn Văn A:</strong> Hầm lò = 16 ngày cơ sở + 0 thâm
              niên = 16 ngày. Đã dùng 3 → Còn 13.
            </div>
          </Section>

          <Separator />

          {/* ── Section 2: Social leave ──────────────────────── */}
          <Section icon={ShieldCheck} title="2. Nghỉ chế độ BHXH (SOCIAL)" color="text-blue-600">
            <p>
              • <strong>Không trừ</strong> phép năm
            </p>
            <p>• Bắt buộc nộp giấy tờ (giấy bác sĩ, giấy khai sinh...)</p>
            <p>• Bao gồm: Ốm đau, Thai sản</p>
            <p>
              • <strong>Luồng:</strong> Nhân viên → HR duyệt trực tiếp
            </p>
          </Section>

          <Separator />

          {/* ── Section 3: Personal paid ─────────────────────── */}
          <Section
            icon={FileText}
            title="3. Nghỉ việc riêng hưởng lương (PERSONAL_PAID)"
            color="text-emerald-600"
          >
            <p>
              • Tang lễ (ông bà, cha mẹ): <strong>3 ngày</strong>
            </p>
            <p>
              • Kết hôn: <strong>3 ngày</strong>
            </p>
            <p>
              • Con kết hôn: <strong>1 ngày</strong>
            </p>
            <p>• Không trừ vào phép năm</p>
            <p>
              • <strong>Luồng:</strong> Nhân viên → Quản lý duyệt → Hoàn tất
            </p>
          </Section>

          <Separator />

          {/* ── Section 4: Unpaid ────────────────────────────── */}
          <Section icon={BanknoteIcon} title="4. Nghỉ không lương (UNPAID)" color="text-orange-600">
            <p>
              • <strong>Ảnh hưởng trực tiếp</strong> đến lương
            </p>
            <p>
              • <strong>Luồng:</strong> Nhân viên → Quản lý → HR → Hoàn tất
            </p>
          </Section>

          <Separator />

          {/* ── Section 5: Emergency ────────────────────────── */}
          <Section icon={AlertTriangle} title="5. Nghỉ khẩn cấp (Emergency)" color="text-red-600">
            <p>
              • Được phép <strong>nghỉ trước, làm đơn sau</strong>
            </p>
            <p>
              • Phải <strong>thông báo trong vòng 2 giờ</strong>
            </p>
            <p>
              • <strong>Bổ sung giấy tờ</strong> trong 3 ngày làm việc
            </p>
            <p>• Hệ thống theo dõi: thời điểm thông báo, deadline giấy tờ, trạng thái hợp lệ</p>
          </Section>

          <Separator />

          {/* ── Section 6: Approval flow summary ────────────── */}
          <Section icon={Clock} title="6. Tổng hợp luồng duyệt" color="text-foreground">
            <table className="w-full text-xs border mt-1">
              <thead>
                <tr className="bg-muted">
                  <th className="p-1.5 text-left border">Loại nghỉ</th>
                  <th className="p-1.5 text-left border">Luồng duyệt</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1.5 border">Phép năm</td>
                  <td className="p-1.5 border">Quản lý duyệt</td>
                </tr>
                <tr>
                  <td className="p-1.5 border">Việc riêng hưởng lương</td>
                  <td className="p-1.5 border">Quản lý duyệt</td>
                </tr>
                <tr>
                  <td className="p-1.5 border">Không lương</td>
                  <td className="p-1.5 border">Quản lý → HR</td>
                </tr>
                <tr>
                  <td className="p-1.5 border">Chế độ BHXH</td>
                  <td className="p-1.5 border">HR trực tiếp</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-3 space-y-2">
              <p className="font-medium text-foreground">Trạng thái đơn:</p>
              <div className="flex flex-wrap gap-1 text-xs">
                <span className="px-2 py-1 bg-muted rounded">Nháp</span>
                <ArrowRight className="h-3 w-3 self-center" />
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                  Chờ Quản lý
                </span>
                <ArrowRight className="h-3 w-3 self-center" />
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Chờ HR</span>
                <ArrowRight className="h-3 w-3 self-center" />
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Đã duyệt</span>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── Section 7: NEW — Auto paid/unpaid logic ──────── */}
          <Section
            icon={GitBranch}
            title="7. Cách tính nghỉ có lương / không lương"
            color="text-violet-600"
          >
            <div className="space-y-3">
              <p className="font-medium text-foreground">
                ⚠️ Người dùng KHÔNG chọn loại này — hệ thống tự quyết định:
              </p>

              {/* Decision tree */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded">
                  <span className="font-bold text-destructive mt-0.5">❌</span>
                  <div>
                    <p className="font-semibold text-destructive">Chưa có lịch sử làm việc</p>
                    <p className="text-muted-foreground">→ Không thể tạo đơn</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-amber-50 rounded">
                  <span className="font-bold text-amber-600 mt-0.5">⚠️</span>
                  <div>
                    <p className="font-semibold text-amber-800">Có lịch sử nhưng &lt; 12 tháng</p>
                    <p className="text-muted-foreground">
                      → Được tạo đơn nhưng{' '}
                      <strong className="text-amber-700">tự động tính là không lương</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-emerald-50 rounded">
                  <span className="font-bold text-emerald-600 mt-0.5">✅</span>
                  <div>
                    <p className="font-semibold text-emerald-800">≥ 12 tháng hiệu lực</p>
                    <div className="text-muted-foreground mt-1 space-y-0.5">
                      <p>→ Kiểm tra số dư phép:</p>
                      <p className="pl-3">
                        • Còn đủ phép →{' '}
                        <strong className="text-emerald-700">toàn bộ có lương</strong>
                      </p>
                      <p className="pl-3">
                        • Vượt quota → phần trong quota{' '}
                        <strong className="text-emerald-700">có lương</strong>, phần dư{' '}
                        <strong className="text-amber-700">không lương</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2 bg-muted rounded text-xs">
                <p className="font-semibold">Ví dụ:</p>
                <p>
                  Nhân viên còn <strong>2 ngày phép</strong>, xin nghỉ <strong>3 ngày</strong>:
                </p>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                    2 ngày có lương
                  </span>
                  <span className="text-muted-foreground self-center">+</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                    1 ngày không lương
                  </span>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

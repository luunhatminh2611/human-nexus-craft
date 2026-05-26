import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button/Button2";
import { Input } from "@/shared/components/ui/input";
import { Clock, Briefcase, Shield, Users, Loader2 } from "lucide-react";
import { toast } from "@/shared/components/ui/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type SalaryRecord = {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  salaryTable: { code: string; name: string };
  salaryLevel: { code: string; name: string };
  salaryScale: {
    code: string;
    name: string;
    salaryTableName: string;
    salaryLevelName: string;
    coefficient: number;
    baseSalary: number;
  };
  salaryCoefficient: number;
  salaryAmount: number;
  effectiveDate: string;
  insuranceSalaryTable: { code: string; name: string };
  insuranceSalaryLevel: { code: string; name: string };
  insuranceSalaryScale: {
    code: string;
    name: string;
    salaryTableName: string;
    salaryLevelName: string;
    coefficient: number;
    baseSalary: number;
  };
  insuranceCoefficient: number;
  insuranceSalaryAmount: number;
  insurancePlace: { code: string; name: string };
  insuranceCode: string;
  unionFinanceSalary: number;
};

type EditData = {
  salaryTableId: string;
  salaryLevelId: string;
  salaryScaleId: string;
  salaryCoefficient: string;
  salaryAmount: string;
  effectiveDate: string;
  insuranceSalaryTableId: string;
  insuranceSalaryLevelId: string;
  insuranceSalaryScaleId: string;
  insuranceCoefficient: string;
  insuranceSalaryAmount: string;
  insurancePlaceId: string;
  insuranceCode: string;
  unionFinanceSalary: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  record: SalaryRecord | null;
  mode: "view" | "edit";
};

// ─── Fake history ─────────────────────────────────────────────────────────────

const generateFakeHistory = (record: SalaryRecord) => [
  {
    date: record.effectiveDate,
    action: "Cập nhật lương",
    by: "Admin Nguyễn",
    changes: [
      {
        field: "Mức lương",
        from: formatCurrency(record.salaryAmount * 0.85),
        to: formatCurrency(record.salaryAmount),
      },
      {
        field: "Hệ số",
        from: (record.salaryCoefficient - 0.33).toFixed(2),
        to: record.salaryCoefficient.toFixed(2),
      },
    ],
  },
  {
    date: "2022-01-01",
    action: "Tạo mới",
    by: "Admin Trần",
    changes: [
      {
        field: "Bảng lương",
        from: "—",
        to: record.salaryTable.name,
      },
      {
        field: "Mức lương khởi tạo",
        from: "—",
        to: formatCurrency(record.salaryAmount * 0.85),
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function recordToEditData(record: SalaryRecord): EditData {
  return {
    salaryTableId: record.salaryTable.code,
    salaryLevelId: record.salaryLevel.code,
    salaryScaleId: record.salaryScale.code,
    salaryCoefficient: String(record.salaryCoefficient),
    salaryAmount: String(record.salaryAmount),
    effectiveDate: record.effectiveDate,
    insuranceSalaryTableId: record.insuranceSalaryTable.code,
    insuranceSalaryLevelId: record.insuranceSalaryLevel.code,
    insuranceSalaryScaleId: record.insuranceSalaryScale.code,
    insuranceCoefficient: String(record.insuranceCoefficient),
    insuranceSalaryAmount: String(record.insuranceSalaryAmount),
    insurancePlaceId: record.insurancePlace.code,
    insuranceCode: record.insuranceCode,
    unionFinanceSalary: String(record.unionFinanceSalary),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  editing,
  inputNode,
}: {
  label: string;
  value: React.ReactNode;
  editing?: boolean;
  inputNode?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {editing && inputNode ? (
        inputNode
      ) : (
        <span className="text-sm font-medium text-foreground">{value ?? "—"}</span>
      )}
    </div>
  );
}

function SectionCard({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className={`px-5 py-3 flex items-center gap-2 border-b ${color}`}>
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SalaryProcessModal({ isOpen, onClose, record, mode }: Props) {
  const [tab, setTab] = useState<"info" | "history">("info");
  const [editData, setEditData] = useState<EditData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = mode === "edit";

  useEffect(() => {
    if (!isOpen) {
      setTab("info");
      setEditData(null);
      return;
    }
    if (record) {
      setEditData(recordToEditData(record));
      if (mode === "edit") setTab("info");
    }
  }, [isOpen, record, mode]);

  if (!record || !editData) return null;

  const history = generateFakeHistory(record);

  const setField = (field: keyof EditData, value: string) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // TODO: gọi API khi có BE
      console.log("[SalaryDetailModal] save payload:", {
        employeeId: record.employeeId,
        ...editData,
      });
      toast({ title: "Thành công", description: "Đã cập nhật thông tin lương" });
      onClose();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err?.message || "Không thể lưu dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "h-8 text-sm w-full";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">

        {/* ── Header ── */}
        <div className="px-6 py-5 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shrink-0">
              {getInitials(record.employeeName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold leading-tight">
                  {record.employeeName}
                </h2>
                {isEditing && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-700">
                    Đang chỉnh sửa
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground font-mono">
                  {record.employeeCode}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                  {record.salaryLevel.name}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                  {formatCurrency(record.salaryAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs — ẩn lịch sử khi đang edit */}
          <div className="flex gap-1 mt-4">
            {(["info", "history"] as const).map((t) => {
              if (t === "history" && isEditing) return null;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    tab === t
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "info" ? (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      Thông tin lương
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Lịch sử thay đổi
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {tab === "info" && (
            <>
              {/* Lương tại đơn vị */}
              <SectionCard
                icon={<Briefcase className="h-3.5 w-3.5 text-blue-600" />}
                title="Lương tại đơn vị"
                color="bg-blue-50/60 text-blue-700"
              >
                <InfoRow label="Bảng lương" value={record.salaryTable.name} editing={isEditing}
                  inputNode={<Input value={editData.salaryTableId} onChange={(e) => setField("salaryTableId", e.target.value)} className={inputCls} placeholder="Mã bảng lương..." />}
                />
                <InfoRow label="Bậc lương" value={record.salaryLevel.name} editing={isEditing}
                  inputNode={<Input value={editData.salaryLevelId} onChange={(e) => setField("salaryLevelId", e.target.value)} className={inputCls} placeholder="Bậc lương..." />}
                />
                <InfoRow label="Thang bảng lương" value={record.salaryScale.name} editing={isEditing}
                  inputNode={<Input value={editData.salaryScaleId} onChange={(e) => setField("salaryScaleId", e.target.value)} className={inputCls} placeholder="Mã thang lương..." />}
                />
                <InfoRow label="Hệ số lương" value={record.salaryCoefficient.toFixed(2)} editing={isEditing}
                  inputNode={<Input type="number" step="0.01" value={editData.salaryCoefficient} onChange={(e) => setField("salaryCoefficient", e.target.value)} className={inputCls} placeholder="0.00" />}
                />
                <InfoRow label="Mức lương"
                  value={<span className="text-blue-700 font-semibold">{formatCurrency(record.salaryAmount)}</span>}
                  editing={isEditing}
                  inputNode={<Input type="number" value={editData.salaryAmount} onChange={(e) => setField("salaryAmount", e.target.value)} className={inputCls} placeholder="VNĐ" />}
                />
                <InfoRow label="Ngày áp dụng" value={formatDate(record.effectiveDate)} editing={isEditing}
                  inputNode={<Input type="date" value={editData.effectiveDate} onChange={(e) => setField("effectiveDate", e.target.value)} className={inputCls} />}
                />
              </SectionCard>

              {/* Lương BHXH */}
              <SectionCard
                icon={<Shield className="h-3.5 w-3.5 text-emerald-600" />}
                title="Lương đóng BHXH"
                color="bg-emerald-50/60 text-emerald-700"
              >
                <InfoRow label="Bảng lương BHXH" value={record.insuranceSalaryTable.name} editing={isEditing}
                  inputNode={<Input value={editData.insuranceSalaryTableId} onChange={(e) => setField("insuranceSalaryTableId", e.target.value)} className={inputCls} placeholder="Mã bảng lương BHXH..." />}
                />
                <InfoRow label="Bậc BHXH" value={record.insuranceSalaryLevel.name} editing={isEditing}
                  inputNode={<Input value={editData.insuranceSalaryLevelId} onChange={(e) => setField("insuranceSalaryLevelId", e.target.value)} className={inputCls} placeholder="Bậc BHXH..." />}
                />
                <InfoRow label="Thang BHXH" value={record.insuranceSalaryScale.name} editing={isEditing}
                  inputNode={<Input value={editData.insuranceSalaryScaleId} onChange={(e) => setField("insuranceSalaryScaleId", e.target.value)} className={inputCls} placeholder="Mã thang BHXH..." />}
                />
                <InfoRow label="Hệ số BHXH" value={record.insuranceCoefficient.toFixed(2)} editing={isEditing}
                  inputNode={<Input type="number" step="0.01" value={editData.insuranceCoefficient} onChange={(e) => setField("insuranceCoefficient", e.target.value)} className={inputCls} placeholder="0.00" />}
                />
                <InfoRow label="Mức đóng BHXH"
                  value={<span className="text-emerald-700 font-semibold">{formatCurrency(record.insuranceSalaryAmount)}</span>}
                  editing={isEditing}
                  inputNode={<Input type="number" value={editData.insuranceSalaryAmount} onChange={(e) => setField("insuranceSalaryAmount", e.target.value)} className={inputCls} placeholder="VNĐ" />}
                />
                <InfoRow label="Nơi đóng BHXH" value={record.insurancePlace.name} editing={isEditing}
                  inputNode={<Input value={editData.insurancePlaceId} onChange={(e) => setField("insurancePlaceId", e.target.value)} className={inputCls} placeholder="Nơi đóng BHXH..." />}
                />
                <InfoRow label="Mã số BHXH"
                  value={<span className="font-mono text-sm">{record.insuranceCode}</span>}
                  editing={isEditing}
                  inputNode={<Input value={editData.insuranceCode} onChange={(e) => setField("insuranceCode", e.target.value)} className={inputCls} placeholder="VN..." />}
                />
              </SectionCard>

              {/* Công đoàn */}
              <SectionCard
                icon={<Users className="h-3.5 w-3.5 text-amber-600" />}
                title="Công đoàn"
                color="bg-amber-50/60 text-amber-700"
              >
                <InfoRow label="Lương NS tài chính công đoàn"
                  value={<span className="text-amber-700 font-semibold">{formatCurrency(record.unionFinanceSalary)}</span>}
                  editing={isEditing}
                  inputNode={<Input type="number" value={editData.unionFinanceSalary} onChange={(e) => setField("unionFinanceSalary", e.target.value)} className={inputCls} placeholder="VNĐ" />}
                />
              </SectionCard>
            </>
          )}

          {tab === "history" && (
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-6">
                {history.map((entry, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 border-primary bg-background" />
                    <div className="rounded-xl border bg-card overflow-hidden">
                      <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{entry.action}</span>
                          <span className="text-xs text-muted-foreground">bởi {entry.by}</span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        {entry.changes.map((change, j) => (
                          <div key={j} className="flex items-center gap-3">
                            <span className="text-muted-foreground min-w-[140px] text-xs">{change.field}</span>
                            <span className="line-through text-muted-foreground text-xs">{change.from}</span>
                            <span className="text-xs text-muted-foreground">→</span>
                            <span className="font-medium text-foreground text-xs">{change.to}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t shrink-0 flex justify-end gap-2 bg-muted/10">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
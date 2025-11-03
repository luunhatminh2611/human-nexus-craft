import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import mockData from "@/mock/data";
import { ArrowRight, Calendar, User, FileText } from "lucide-react";

interface TransferTabProps {
  employeeId: string;
}

const TransferTab = ({ employeeId }: TransferTabProps) => {
  const employeeTransfers = mockData.transfers.filter(
    (transfer) => transfer.employeeId === employeeId
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_director_approval: { label: "Chờ giám đốc duyệt", variant: "secondary" as const },
      pending_final_approval: { label: "Chờ phê duyệt cuối", variant: "default" as const },
      approved: { label: "Đã duyệt", variant: "default" as const },
      rejected: { label: "Từ chối", variant: "destructive" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (employeeTransfers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Chưa có lịch sử điều động
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {employeeTransfers.map((transfer) => (
        <Card key={transfer.id} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-lg">{transfer.fromDepartmentName}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-lg">{transfer.toDepartmentName}</span>
              </div>
              {getStatusBadge(transfer.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Người lập:</span>
                <span>{transfer.createdByName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ngày lập:</span>
                <span>{new Date(transfer.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground text-sm">Lý do: </span>
                <span className="text-sm">{transfer.reason}</span>
              </div>
            </div>

            {transfer.directorApprovedBy && (
              <div className="border-t pt-3 space-y-2">
                <div className="text-sm font-medium">Giám đốc duyệt:</div>
                <div className="text-sm space-y-1 ml-4">
                  <div>
                    <span className="text-muted-foreground">Người duyệt: </span>
                    {transfer.directorApprovedByName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ngày duyệt: </span>
                    {transfer.directorApprovedAt && new Date(transfer.directorApprovedAt).toLocaleDateString("vi-VN")}
                  </div>
                  {transfer.directorComment && (
                    <div>
                      <span className="text-muted-foreground">Nhận xét: </span>
                      {transfer.directorComment}
                    </div>
                  )}
                </div>
              </div>
            )}

            {transfer.finalApprovedBy && (
              <div className="border-t pt-3 space-y-2">
                <div className="text-sm font-medium">Phê duyệt cuối:</div>
                <div className="text-sm space-y-1 ml-4">
                  <div>
                    <span className="text-muted-foreground">Người phê duyệt: </span>
                    {transfer.finalApprovedByName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ngày phê duyệt: </span>
                    {transfer.finalApprovedAt && new Date(transfer.finalApprovedAt).toLocaleDateString("vi-VN")}
                  </div>
                  {transfer.finalComment && (
                    <div>
                      <span className="text-muted-foreground">Nhận xét: </span>
                      {transfer.finalComment}
                    </div>
                  )}
                  {transfer.effectiveDate && (
                    <div>
                      <span className="text-muted-foreground">Ngày hiệu lực: </span>
                      {new Date(transfer.effectiveDate).toLocaleDateString("vi-VN")}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TransferTab;

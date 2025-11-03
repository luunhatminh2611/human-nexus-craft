import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import mockData from "@/mock/data";
import { useAuthStore } from "@/store/authStore";
import { ArrowRight, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";

const TransferManagement = () => {
  const { role, employeeId } = useAuthStore();
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const pendingTransfers = mockData.transfers.filter(
    (t) => t.status === "pending_director_approval"
  );

  const processedTransfers = mockData.transfers.filter(
    (t) => t.status !== "pending_director_approval"
  );

  const handleApprove = () => {
    toast.success("Đã duyệt phiếu điều động");
    setSelectedTransfer(null);
    setComment("");
  };

  const handleReject = () => {
    if (!comment.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    toast.success("Đã từ chối phiếu điều động");
    setSelectedTransfer(null);
    setComment("");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_director_approval: { label: "Chờ duyệt", variant: "secondary" as const },
      pending_final_approval: { label: "Chờ phê duyệt cuối", variant: "default" as const },
      approved: { label: "Đã duyệt", variant: "default" as const },
      rejected: { label: "Từ chối", variant: "destructive" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const TransferCard = ({ transfer, showActions = false }: any) => (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium">Mã phiếu: {transfer.id}</div>
            <div className="text-sm text-muted-foreground">Nhân viên: {transfer.employeeName}</div>
          </div>
          {getStatusBadge(transfer.status)}
        </div>

        <div className="flex items-center gap-3 py-2">
          <span className="font-semibold">{transfer.fromDepartmentName}</span>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold">{transfer.toDepartmentName}</span>
        </div>

        <div className="text-sm space-y-1">
          <div>
            <span className="text-muted-foreground">Lý do: </span>
            {transfer.reason}
          </div>
          <div>
            <span className="text-muted-foreground">Người lập: </span>
            {transfer.createdByName}
          </div>
          <div>
            <span className="text-muted-foreground">Ngày lập: </span>
            {new Date(transfer.createdAt).toLocaleDateString("vi-VN")}
          </div>
        </div>

        {transfer.directorApprovedBy && (
          <div className="border-t pt-2 text-sm">
            <div className="font-medium mb-1">Giám đốc đã duyệt:</div>
            <div className="ml-4 space-y-1">
              <div>{transfer.directorApprovedByName} - {transfer.directorApprovedAt && new Date(transfer.directorApprovedAt).toLocaleDateString("vi-VN")}</div>
              {transfer.directorComment && <div className="text-muted-foreground">{transfer.directorComment}</div>}
            </div>
          </div>
        )}

        {transfer.finalApprovedBy && (
          <div className="border-t pt-2 text-sm">
            <div className="font-medium mb-1">Phê duyệt cuối:</div>
            <div className="ml-4 space-y-1">
              <div>{transfer.finalApprovedByName} - {transfer.finalApprovedAt && new Date(transfer.finalApprovedAt).toLocaleDateString("vi-VN")}</div>
              {transfer.finalComment && <div className="text-muted-foreground">{transfer.finalComment}</div>}
              {transfer.effectiveDate && (
                <div>
                  <span className="text-muted-foreground">Ngày hiệu lực: </span>
                  {new Date(transfer.effectiveDate).toLocaleDateString("vi-VN")}
                </div>
              )}
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button onClick={() => setSelectedTransfer(transfer.id)} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Duyệt
            </Button>
            <Button variant="destructive" onClick={() => setSelectedTransfer(transfer.id)} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Từ chối
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý điều động</h1>
          <p className="text-muted-foreground">Duyệt phiếu điều động nhân sự</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Chờ duyệt ({pendingTransfers.length})
            </TabsTrigger>
            <TabsTrigger value="processed">
              Đã xử lý ({processedTransfers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingTransfers.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                Không có phiếu điều động chờ duyệt
              </Card>
            ) : (
              pendingTransfers.map((transfer) => (
                <TransferCard key={transfer.id} transfer={transfer} showActions />
              ))
            )}
          </TabsContent>

          <TabsContent value="processed" className="space-y-4">
            {processedTransfers.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                Chưa có phiếu điều động nào được xử lý
              </Card>
            ) : (
              processedTransfers.map((transfer) => (
                <TransferCard key={transfer.id} transfer={transfer} />
              ))
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedTransfer} onOpenChange={() => setSelectedTransfer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xử lý phiếu điều động</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="comment">Nhận xét</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhập nhận xét..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApprove} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Duyệt
                </Button>
                <Button variant="destructive" onClick={handleReject} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default TransferManagement;

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button/Button2";
import { useState } from "react";

export default function RejectReasonModal({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return alert("Vui lòng nhập lý do!");
    onSubmit(reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Từ chối khóa đào tạo</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">Nhập lý do từ chối:</p>

          <Textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do..."
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button variant="destructive" onClick={handleSubmit}>
              Xác nhận
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
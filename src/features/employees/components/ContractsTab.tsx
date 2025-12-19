import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import Button from '@/shared/components/ui/button/Button';
import {
  FileText,
  Download,
  Trash2,
  Upload,
  Calendar,
  User,
  FileCheck,
  Edit,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface Contract {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'expired';
  uploadedBy: string;
  fileUrl?: string;
}

const initialForm = {
  contractType: '',
  startDate: '',
  endDate: '',
  file: null as File | null,
};

export default function ContractsTab() {
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: '1',
      fileName: 'Hop_dong_het_han_2023.pdf',
      fileSize: '1.5 MB',
      uploadDate: '01/01/2024',
      contractType: 'Hợp đồng thử việc',
      startDate: '01/11/2023',
      endDate: '31/12/2023',
      status: 'expired',
      uploadedBy: 'Nguyễn Văn Admin',
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form, setForm] = useState(initialForm);

  const hasActiveContract = contracts.some(c => c.status === 'active');

  const openCreate = () => {
    if (hasActiveContract) {
      alert('Đang có hợp đồng hiệu lực, không thể tạo hợp đồng mới');
      return;
    }
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEdit = (contract: Contract) => {
    setEditing(contract);
    setForm({
      contractType: contract.contractType,
      startDate: contract.startDate,
      endDate: contract.endDate || '',
      file: null,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.contractType || !form.startDate) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (editing) {
      setContracts(prev =>
        prev.map(c =>
          c.id === editing.id
            ? {
                ...c,
                contractType: form.contractType,
                startDate: form.startDate,
                endDate: form.endDate,
                fileName: form.file?.name || c.fileName,
                fileSize: form.file
                  ? `${(form.file.size / 1024 / 1024).toFixed(1)} MB`
                  : c.fileSize,
              }
            : c
        )
      );
    } else {
      const file = form.file;
      if (!file) {
        alert('Vui lòng chọn file hợp đồng');
        return;
      }

      setContracts(prev => [
        {
          id: String(Date.now()),
          fileName: file.name,
          fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toLocaleDateString('vi-VN'),
          contractType: form.contractType,
          startDate: form.startDate,
          endDate: form.endDate,
          status: 'active',
          uploadedBy: 'Nguyễn Văn Admin',
        },
        ...prev,
      ]);
    }

    setOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Hợp đồng lao động
        </CardTitle>

        <Button onClick={openCreate}>
          <Upload className="h-4 w-4 mr-2" />
          Thêm hợp đồng
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {contracts.map(contract => (
          <div
            key={contract.id}
            className="border rounded-lg p-4 grid grid-cols-12 gap-4 items-start"
          >
            {/* LEFT */}
            <div className="col-span-5 space-y-2">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium truncate">
                  {contract.fileName}
                </h4>
              </div>

              <p className="text-sm text-gray-600">
                {contract.contractType}
              </p>

              <span
                className={`inline-block text-xs px-2 py-1 rounded-full ${
                  contract.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {contract.status === 'active'
                  ? 'Đang hiệu lực'
                  : 'Hết hạn'}
              </span>
            </div>

            {/* RIGHT */}
            <div className="col-span-6 grid grid-cols-2 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Bắt đầu: {contract.startDate}
              </div>

              {contract.endDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Kết thúc: {contract.endDate}
                </div>
              )}

              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {contract.uploadedBy}
              </div>

              <div>Kích thước: {contract.fileSize}</div>

              <div className="col-span-2 text-xs text-gray-400">
                Ngày upload: {contract.uploadDate}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="col-span-1 flex flex-row gap-2 items-end">
              <button onClick={() => openEdit(contract)}>
                <Edit className="h-4 w-4 text-blue-600" />
              </button>
              <button>
                <Download className="h-4 w-4 text-green-600" />
              </button>
              <button onClick={() =>
                setContracts(c => c.filter(x => x.id !== contract.id))
              }>
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Chỉnh sửa hợp đồng' : 'Thêm hợp đồng'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label>Loại hợp đồng</Label>
              <Input
                value={form.contractType}
                onChange={e =>
                  setForm({ ...form, contractType: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Ngày bắt đầu</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={e =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Ngày kết thúc</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={e =>
                  setForm({ ...form, endDate: e.target.value })
                }
              />
            </div>

            <div>
              <Label>File hợp đồng</Label>
              <Input
                type="file"
                onChange={e =>
                  setForm({
                    ...form,
                    file: e.target.files?.[0] || null,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

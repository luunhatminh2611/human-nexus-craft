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
import { Search, Eye, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
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
import { transferApi } from '../../api/transferApi';
import TransferDetailModal from '../../components/TransferModalDetail';

export default function EmployeeTransferPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState(null);

  useEffect(() => {
    fetchMyTransfers();
  }, [page, pageSize, searchTerm, filterStatus]);

  const fetchMyTransfers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching my transfers with params:", {
        page,
        limit: pageSize,
        keyword: searchTerm,
        status: filterStatus
      });

      const data = await transferApi.getMy({
        page: page,
        limit: pageSize,
        keyword: searchTerm || '',
        status: filterStatus === 'all' ? '' : filterStatus
      });

      console.log("My transfers response:", data);

      // Xử lý response - có thể là array hoặc object với data và total
      if (Array.isArray(data)) {
        setTransfers(data[0]);
        setTotalItems(data.length);
      } else if (data?.data) {
        setTransfers(Array.isArray(data.data) ? data.data : []);
        setTotalItems(data.total || data.data.length);
      } else {
        setTransfers([]);
        setTotalItems(0);
      }

      setError(null);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách điều động của tôi:", err);
      setError(err);
      setTransfers([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'TRUONG_PHONG_CHO_KY': { label: 'Chờ trưởng phòng ký', className: 'bg-yellow-100 text-yellow-800' },
      'DA_TAO': { label: 'Đã tạo', className: 'bg-yellow-100 text-yellow-800' },
      'GIAM_DOC_CHO_KY': { label: 'Chờ giám đốc ký', className: 'bg-blue-100 text-blue-800' },
      'CHO_TIEP_NHAN': { label: 'Chờ tiếp nhận', className: 'bg-purple-100 text-purple-800' },
      'REJECTED': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
      'SUCCEEDED': { label: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleOpenDetailModal = (id: string | number) => {
    setSelectedTransferId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTransferId(null);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0); // Reset về trang đầu khi search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  if (error && !isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Lỗi: Không thể tải danh sách điều động</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Điều động của tôi</h1>
          <p className="text-muted-foreground">
            Danh sách quyết định điều động liên quan đến tôi ({totalItems} bản ghi)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, phòng ban..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="DA_TAO">Đã tạo</SelectItem>
              <SelectItem value="TRUONG_PHONG_CHO_KY">Chờ trưởng phòng ký</SelectItem>
              <SelectItem value="GIAM_DOC_CHO_KY">Chờ giám đốc ký</SelectItem>
              <SelectItem value="CHO_TIEP_NHAN">Chờ tiếp nhận</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
              <SelectItem value="SUCCEEDED">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>

                <TableHead>Từ phòng ban</TableHead>
                <TableHead>Đến phòng ban</TableHead>
                <TableHead>Người tạo</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
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
              ) : transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Chưa có quyết định điều động nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((transfer) => (
                  <TableRow key={transfer.id}>

                    <TableCell>
                      <div>
                        <p className="font-medium">{transfer.fromDepartmentName || '-'}</p>
                        <p className="text-sm text-muted-foreground">{transfer.fromPositionName || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transfer.toDepartmentName || '-'}</p>
                        <p className="text-sm text-muted-foreground">{transfer.toPositionName || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{transfer.creatorName || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {transfer.createdAt
                          ? new Date(transfer.createdAt).toLocaleDateString('vi-VN')
                          : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transfer.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(transfer.id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
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
        {!isLoading && transfers.length > 0 && (
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
                  <SelectItem value="100">100</SelectItem>
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

      <TransferDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        transferId={selectedTransferId}
      />
    </div>
  );
}
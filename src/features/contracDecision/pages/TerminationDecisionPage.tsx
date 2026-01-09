import { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Search,
  Eye,
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  FileX,
} from 'lucide-react';
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

import {
  mockTerminationDecisions,
  type TerminationDecision,
} from '../../../mock/contractDecision';

import TerminationDecisionFormModal from '../components/TerminationFormModal';
import TerminationDecisionDetailModal from '../components/TerminationDetailModal';

import { useAuthStore } from '@/features/employees/hooks/useAuth';

export default function TerminationDecisionPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [decisions, setDecisions] = useState<TerminationDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDecision, setEditingDecision] =
    useState<TerminationDecision | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDecisionId, setSelectedDecisionId] =
    useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDecisions();
  }, [searchTerm, page, pageSize, refreshKey, isAdmin]);

  const fetchDecisions = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockTerminationDecisions];

    // User chỉ xem quyết định của mình
    if (!isAdmin && user?.id) {
      filtered = filtered.filter(d => d.employeeId === user.id);
    }

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.employeeName.toLowerCase().includes(keyword) ||
        d.department.toLowerCase().includes(keyword) ||
        d.position.toLowerCase().includes(keyword) ||
        d.decisionNumber.toLowerCase().includes(keyword),
      );
    }

    // Sắp xếp theo ngày quyết định mới nhất
    filtered.sort(
      (a, b) =>
        new Date(b.decisionDate).getTime() -
        new Date(a.decisionDate).getTime(),
    );

    setTotalItems(filtered.length);

    const start = page * pageSize;
    setDecisions(filtered.slice(start, start + pageSize));
    setIsLoading(false);
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin
              ? 'Quản lý quyết định chấm dứt hợp đồng'
              : 'Quyết định chấm dứt của tôi'}
          </h1>
          <p className="text-muted-foreground">
            Lưu trữ và tra cứu các quyết định chấm dứt hợp đồng
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => {
              setEditingDecision(null);
              setIsFormModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo quyết định
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, phòng ban, chức vụ, số quyết định"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Số QĐ</TableHead>
                <TableHead>Ngày QĐ</TableHead>
                <TableHead>Ngày hiệu lực</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Đang tải...
                    </div>
                  </TableCell>
                </TableRow>
              ) : decisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileX className="h-8 w-8" />
                      Không có quyết định nào
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                decisions.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{d.employeeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {d.department}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>{d.position}</TableCell>

                    <TableCell className="font-medium">
                      {d.decisionNumber}
                    </TableCell>

                    <TableCell>
                      {new Date(d.decisionDate).toLocaleDateString('vi-VN')}
                    </TableCell>

                    <TableCell>
                      {new Date(d.effectiveDate).toLocaleDateString('vi-VN')}
                    </TableCell>

                    <TableCell>
                      <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {d.reason}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-center gap-1">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingDecision(d);
                              setIsFormModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDecisionId(d.id);
                            setIsDetailModalOpen(true);
                          }}
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
        {!isLoading && decisions.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex} - {endIndex} / {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={v => {
                  setPageSize(Number(v));
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
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm px-2">
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
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <TerminationDecisionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        decision={editingDecision}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />

      <TerminationDecisionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        decisionId={selectedDecisionId}
      />
    </div>
  );
}
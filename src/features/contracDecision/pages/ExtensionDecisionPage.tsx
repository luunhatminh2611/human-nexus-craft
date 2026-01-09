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
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  FileClock,
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
  mockExtensionDecisions,
  type ExtensionDecision,
  extensionDecisionTypeLabels,
} from '../../../mock/contractDecision';
import ExtensionDecisionFormModal from '../components/ExtensionDecisionModal';
import ExtensionDecisionDetailModal from '../components/ExtensionDecisionDetailModal';

import { useAuthStore } from '@/features/employees/hooks/useAuth';


export default function ExtensionDecisionPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXTEND' | 'RENEW'>(
    'ALL',
  );
  const [decisions, setDecisions] = useState<ExtensionDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDecision, setEditingDecision] =
    useState<ExtensionDecision | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDecisionId, setSelectedDecisionId] =
    useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDecisions();
  }, [page, pageSize, searchTerm, typeFilter, refreshKey, isAdmin]);

  const fetchDecisions = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockExtensionDecisions];

    // Không phải admin → chỉ xem của mình
    if (!isAdmin && user?.id) {
      filtered = filtered.filter(d => d.employeeId === user.id);
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(d => d.decisionType === typeFilter);
    }

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.employeeName.toLowerCase().includes(keyword) ||
        d.position.toLowerCase().includes(keyword) ||
        d.department.toLowerCase().includes(keyword) ||
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
    const end = start + pageSize;
    setDecisions(filtered.slice(start, end));

    setIsLoading(false);
  };

  const getTypeBadge = (type: ExtensionDecision['decisionType']) => {
    const config = {
      EXTEND: {
        label: extensionDecisionTypeLabels.EXTEND,
        className: 'bg-blue-100 text-blue-800',
      },
      RENEW: {
        label: extensionDecisionTypeLabels.RENEW,
        className: 'bg-purple-100 text-purple-800',
      },
    };

    return (
      <Badge className={config[type].className}>
        {config[type].label}
      </Badge>
    );
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
              ? 'Quản lý quyết định gia hạn / tái ký'
              : 'Quyết định gia hạn / tái ký của tôi'}
          </h1>
          <p className="text-muted-foreground">
            Lưu trữ và tra cứu các quyết định gia hạn, tái ký
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

          <Select
            value={typeFilter}
            onValueChange={v =>
              setTypeFilter(v as 'ALL' | 'EXTEND' | 'RENEW')
            }
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Loại quyết định" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="EXTEND">Gia hạn</SelectItem>
              <SelectItem value="RENEW">Tái ký</SelectItem>
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
                <TableHead>Nhân viên</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số QĐ</TableHead>
                <TableHead>Ngày QĐ</TableHead>
                <TableHead>Hiệu lực</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Đang tải...
                    </div>
                  </TableCell>
                </TableRow>
              ) : decisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileClock className="h-8 w-8" />
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

                    <TableCell>{getTypeBadge(d.decisionType)}</TableCell>

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
                      <div className="text-sm">
                        {d.termMonths} tháng
                        <div className="text-xs text-muted-foreground">
                          đến{' '}
                          {new Date(d.newExpiryDate).toLocaleDateString(
                            'vi-VN',
                          )}
                        </div>
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
      <ExtensionDecisionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        decision={editingDecision}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />

      <ExtensionDecisionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        decisionId={selectedDecisionId}
      />
    </div>
  );
}
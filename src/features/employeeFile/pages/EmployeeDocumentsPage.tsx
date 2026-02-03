// pages/hr/documents/EmployeeDocumentsPage.tsx

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
import { Search, Eye, ChevronLeft, ChevronRight, Plus, FileText, AlertCircle, Download, Trash2 } from 'lucide-react';
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
  mockEmployeeDocuments, 
  type EmployeeDocument, 
  calculateDocumentStatistics,
  documentTypeLabels 
} from '../../../mock/employeeFile';
import DocumentDetailModal from '../components/DocumentDetailModal';
import UploadDocumentModal from '../components/UploadDocumentModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

export default function EmployeeDocumentsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [employeeFilter, setEmployeeFilter] = useState<string>('ALL');
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [page, pageSize, searchTerm, typeFilter, employeeFilter, refreshKey]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockEmployeeDocuments];

    // Nếu không phải admin, chỉ hiển thị tài liệu của chính user
    if (!isAdmin && user?.employeeId) {
      filtered = filtered.filter(d => d.employeeId === user.employeeId);
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(d => d.documentType === typeFilter);
    }

    if (employeeFilter !== 'ALL') {
      filtered = filtered.filter(d => d.employeeId === employeeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.decisionNumber && d.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setTotalItems(filtered.length);

    const start = page * pageSize;
    const end = start + pageSize;
    setDocuments(filtered.slice(start, end));

    setIsLoading(false);
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedDocumentId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDocumentId(null);
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDownload = (doc: EmployeeDocument) => {
    console.log('Downloading document:', doc.id);
    // Implement download logic
  };

  const handleDelete = async (doc: EmployeeDocument) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài liệu "${doc.documentName}"?`)) {
      return;
    }
    console.log('Deleting document:', doc.id);
    setRefreshKey(prev => prev + 1);
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'RECRUITMENT': { label: documentTypeLabels.RECRUITMENT, className: 'bg-blue-100 text-blue-800' },
      'CONTRACT': { label: documentTypeLabels.CONTRACT, className: 'bg-purple-100 text-purple-800' },
      'INSURANCE': { label: documentTypeLabels.INSURANCE, className: 'bg-green-100 text-green-800' },
      'CERTIFICATE': { label: documentTypeLabels.CERTIFICATE, className: 'bg-yellow-100 text-yellow-800' },
      'DECISION': { label: documentTypeLabels.DECISION, className: 'bg-indigo-100 text-indigo-800' },
      'TRAINING': { label: documentTypeLabels.TRAINING, className: 'bg-pink-100 text-pink-800' },
      'OTHER': { label: documentTypeLabels.OTHER, className: 'bg-gray-100 text-gray-800' },
    };

    const config = typeConfig[type] || { label: type, className: '' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const stats = calculateDocumentStatistics(mockEmployeeDocuments);
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  // Get employees list - nếu không phải admin chỉ lấy dữ liệu của chính user
  let employees = Array.from(new Set(mockEmployeeDocuments.map(d => ({
    id: d.employeeId,
    name: d.employeeName
  }))));

  if (!isAdmin && user?.employeeId) {
    const userDocuments = mockEmployeeDocuments.filter(d => d.employeeId === user.employeeId);
    employees = Array.from(new Set(userDocuments.map(d => ({
      id: d.employeeId,
      name: d.employeeName
    }))));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Quản lý Hồ sơ Nhân viên' : 'Hồ sơ của tôi'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Quản lý tài liệu và hồ sơ của tất cả nhân viên'
              : 'Xem và quản lý tài liệu hồ sơ của bạn'
            }
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenUploadModal}>
            <Plus className="h-4 w-4 mr-2" />
            Tải lên tài liệu
          </Button>
        )}
      </div>

      {stats.expiringSoon > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Có {stats.expiringSoon} tài liệu sắp hết hạn trong vòng 30 ngày. Vui lòng kiểm tra và cập nhật.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isAdmin 
                ? 'Tìm kiếm theo tên nhân viên, tên tài liệu'
                : 'Tìm kiếm theo tên tài liệu'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isAdmin && (
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Nhân viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả nhân viên</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Loại tài liệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="RECRUITMENT">Hồ sơ tuyển dụng</SelectItem>
              <SelectItem value="CONTRACT">Hợp đồng</SelectItem>
              <SelectItem value="INSURANCE">Bảo hiểm & Thuế</SelectItem>
              <SelectItem value="CERTIFICATE">Bằng cấp</SelectItem>
              <SelectItem value="DECISION">Quyết định</SelectItem>
              <SelectItem value="TRAINING">Đào tạo</SelectItem>
              <SelectItem value="OTHER">Khác</SelectItem>
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
                <TableHead>Tên tài liệu</TableHead>
                {isAdmin && <TableHead>Nhân viên</TableHead>}
                <TableHead>Loại</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Ngày upload</TableHead>
                {isAdmin && <TableHead>Người upload</TableHead>}
                <TableHead>Đánh dấu</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Không tìm thấy tài liệu nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {getFileIcon(doc.fileType)}
                        <div>
                          <p className="font-medium">{doc.documentName}</p>
                          {doc.decisionNumber && (
                            <p className="text-xs text-muted-foreground">
                              Số: {doc.decisionNumber}
                            </p>
                          )}
                          {doc.expiryDate && (
                            <p className="text-xs text-muted-foreground">
                              HSD: {new Date(doc.expiryDate).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div>
                          <p className="font-medium">{doc.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{doc.departmentName}</p>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      {getTypeBadge(doc.documentType)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-mono text-xs truncate max-w-[150px]">
                          {doc.fileName}
                        </p>
                        <p className="text-muted-foreground">
                          {formatFileSize(doc.fileSize)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <span className="text-sm">{doc.uploadedBy}</span>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {doc.isImportant && (
                          <Badge variant="outline" className="text-red-600 text-xs">
                            Quan trọng
                          </Badge>
                        )}
                        {doc.isConfidential && (
                          <Badge variant="outline" className="text-orange-600 text-xs">
                            Bảo mật
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(doc.id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          title="Tải xuống"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doc)}
                            title="Xóa"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && documents.length > 0 && (
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

      <DocumentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        documentId={selectedDocumentId}
        isAdmin={isAdmin}
        onSuccess={handleSuccess}
      />

      {isAdmin && (
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={handleCloseUploadModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
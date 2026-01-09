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
import { Search, Eye, Plus, FileText, Download, Trash2, AlertCircle } from 'lucide-react';
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
  documentTypeLabels 
} from '../../../mock/employeeFile';
import DocumentDetailModal from '../../../features/employeeFile/components/DocumentDetailModal';
import UploadDocumentModal from '../../../features/employeeFile/components/UploadDocumentModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

interface EmployeeDocumentsTabProps {
  userData: any;
  employeeId: number | string;
}

export default function EmployeeDocumentsTab({ userData, employeeId }: EmployeeDocumentsTabProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [employeeId, searchTerm, typeFilter, refreshKey]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter documents for this specific employee
    let filtered = mockEmployeeDocuments.filter(d => 
      d.employeeId === employeeId.toString()
    );

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(d => d.documentType === typeFilter);
    }

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.documentName.toLowerCase().includes(keyword) ||
        d.fileName.toLowerCase().includes(keyword) ||
        (d.decisionNumber && d.decisionNumber.toLowerCase().includes(keyword))
      );
    }

    // Sort by upload date (newest first)
    filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    setDocuments(filtered);
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
    alert(`Đang tải xuống: ${doc.fileName}`);
  };

  const handleDelete = async (doc: EmployeeDocument) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài liệu "${doc.documentName}"?`)) {
      return;
    }
    console.log('Deleting document:', doc.id);
    alert('Đã xóa tài liệu');
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

  // Check for expiring documents
  const expiringDocs = documents.filter(d => {
    if (!d.expiryDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  });

  // Calculate statistics
  const stats = {
    total: documents.length,
    byType: {
      recruitment: documents.filter(d => d.documentType === 'RECRUITMENT').length,
      contract: documents.filter(d => d.documentType === 'CONTRACT').length,
      insurance: documents.filter(d => d.documentType === 'INSURANCE').length,
      certificate: documents.filter(d => d.documentType === 'CERTIFICATE').length,
      decision: documents.filter(d => d.documentType === 'DECISION').length,
      training: documents.filter(d => d.documentType === 'TRAINING').length,
      other: documents.filter(d => d.documentType === 'OTHER').length,
    },
    important: documents.filter(d => d.isImportant).length,
    confidential: documents.filter(d => d.isConfidential).length,
  };

  return (
    <div className="space-y-4">
      {/* Alert for expiring documents */}
      {expiringDocs.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Có {expiringDocs.length} tài liệu sắp hết hạn trong vòng 30 ngày. Vui lòng kiểm tra và cập nhật.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên tài liệu, tên file, số quyết định"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Loại tài liệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="RECRUITMENT">Hồ sơ tuyển dụng ({stats.byType.recruitment})</SelectItem>
              <SelectItem value="CONTRACT">Hợp đồng ({stats.byType.contract})</SelectItem>
              <SelectItem value="INSURANCE">Bảo hiểm & Thuế ({stats.byType.insurance})</SelectItem>
              <SelectItem value="CERTIFICATE">Bằng cấp ({stats.byType.certificate})</SelectItem>
              <SelectItem value="DECISION">Quyết định ({stats.byType.decision})</SelectItem>
              <SelectItem value="TRAINING">Đào tạo ({stats.byType.training})</SelectItem>
              <SelectItem value="OTHER">Khác ({stats.byType.other})</SelectItem>
            </SelectContent>
          </Select> */}

          {isAdmin && (
            <Button onClick={handleOpenUploadModal}>
              <Plus className="h-4 w-4 mr-1" />
              Tải lên tài liệu
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên tài liệu</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Ngày upload</TableHead>
                <TableHead>Người upload</TableHead>
                <TableHead>Đánh dấu</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Nhân viên này chưa có tài liệu nào</p>
                     
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/50">
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
                              {(() => {
                                const daysUntilExpiry = Math.ceil(
                                  (new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                );
                                if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
                                  return <span className="text-orange-600 font-medium"> (còn {daysUntilExpiry} ngày)</span>;
                                }
                                return null;
                              })()}
                            </p>
                          )}
                          {doc.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(doc.documentType)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-mono text-xs truncate max-w-[150px]" title={doc.fileName}>
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
                    <TableCell>
                      <span className="text-sm">{doc.uploadedBy}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {doc.isImportant && (
                          <Badge variant="outline" className="text-red-600 text-xs w-fit">
                            Quan trọng
                          </Badge>
                        )}
                        {doc.isConfidential && (
                          <Badge variant="outline" className="text-orange-600 text-xs w-fit">
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
      </Card>

      {/* Modals */}
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
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
import { Search, FileText, AlertCircle, Eye, Download } from 'lucide-react';
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
import { mockDegrees, type Degree, calculateStatistics } from '../../../mock/degree';
import DegreeDetailModal from '../components/DegreeDetailModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

export default function DegreeEmployeePage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDegreeId, setSelectedDegreeId] = useState<string | null>(null);

  useEffect(() => {
    fetchDegrees();
  }, [searchTerm, typeFilter, user]);

  const fetchDegrees = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...mockDegrees];
    
    // Lọc theo user hiện tại
    if (user?.employeeId) {
      filtered = filtered.filter(d => d.employeeId === user.employeeId);
    }
    
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(d => d.type === typeFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setDegrees(filtered);
    setIsLoading(false);
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedDegreeId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDegreeId(null);
  };

  const handleDownload = (degree: Degree) => {
    // Simulate download
    console.log('Downloading document:', degree.documentUrl);
    alert(`Đang tải xuống tài liệu: ${degree.name}`);
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'EDUCATION': { label: 'Học vấn', className: 'bg-blue-100 text-blue-800' },
      'CERTIFICATION': { label: 'Chứng chỉ', className: 'bg-purple-100 text-purple-800' },
      'LICENSE': { label: 'Giấy phép', className: 'bg-orange-100 text-orange-800' },
    };

    const config = typeConfig[type];
    if (!config) return null;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getExpiryWarning = (degree: Degree) => {
    if (!degree.expiryDate) return null;
    
    const now = new Date();
    const expiryDate = new Date(degree.expiryDate);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>Đã hết hạn</span>
        </div>
      );
    }

    if (daysUntilExpiry <= 30) {
      return (
        <div className="flex items-center gap-1 text-orange-600 text-xs mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>Còn {daysUntilExpiry} ngày</span>
        </div>
      );
    }
    
    return null;
  };

  const stats = calculateStatistics(degrees);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bằng cấp của tôi</h1>
          <p className="text-muted-foreground">
            Xem danh sách bằng cấp, chứng chỉ và giấy phép của bạn
          </p>
        </div>
      </div>

      {/* Info banner */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Thông tin quan trọng</p>
            <p>Bằng cấp của bạn được quản lý bởi phòng Nhân sự. Nếu có thắc mắc hoặc cần cập nhật thông tin, vui lòng liên hệ với phòng Nhân sự.</p>
          </div>
        </div>
      </Card>


      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên bằng cấp hoặc tổ chức"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="EDUCATION">Học vấn</SelectItem>
              <SelectItem value="CERTIFICATION">Chứng chỉ</SelectItem>
              <SelectItem value="LICENSE">Giấy phép</SelectItem>
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
                <TableHead>Loại</TableHead>
                <TableHead>Tên bằng cấp</TableHead>
                <TableHead>Tổ chức cấp</TableHead>
                <TableHead>Số bằng cấp</TableHead>
                <TableHead>Ngày cấp</TableHead>
                <TableHead>Ngày hết hạn</TableHead>
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
              ) : degrees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Chưa có bằng cấp nào</p>
                      <p className="text-sm">Liên hệ phòng Nhân sự để cập nhật bằng cấp của bạn</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                degrees.map((degree) => (
                  <TableRow key={degree.id}>
                    <TableCell>
                      {getTypeBadge(degree.type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{degree.name}</p>
                        {degree.major && (
                          <p className="text-xs text-muted-foreground">{degree.major}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{degree.institution}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{degree.certificateNumber || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(degree.issueDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        {degree.expiryDate ? (
                          <>
                            <span className="text-sm">
                              {new Date(degree.expiryDate).toLocaleDateString('vi-VN')}
                            </span>
                            {getExpiryWarning(degree)}
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Vô thời hạn</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(degree.id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {degree.documentUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(degree)}
                            title="Tải xuống"
                          >
                            <Download className="h-4 w-4" />
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

      {/* Detail Modal */}
      <DegreeDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        degreeId={selectedDegreeId}
      />
    </div>
  );
}
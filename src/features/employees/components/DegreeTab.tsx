// components/DegreeTab.tsx

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
import { Search, Plus, Edit2, Trash2, FileText, AlertCircle, Award, BookOpen, FileCheck, Eye } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import { Label } from '@/shared/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import { mockDegrees, type Degree } from '../../../mock/degree';
import DegreeFormModal from '../../degree/components/DegreeFormModal';
import DegreeDetailModal from '../../degree/components/DegreeDetailModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface DegreeTabProps {
  userData: any;
  employeeId: number | string;
}

export default function DegreeTab({ userData, employeeId }: DegreeTabProps) {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDegreeId, setSelectedDegreeId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [degreeToDelete, setDegreeToDelete] = useState<Degree | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = user?.roles?.includes('ADMIN');

  useEffect(() => {
    fetchDegrees();
  }, [employeeId, searchTerm, typeFilter, refreshKey]);

  const fetchDegrees = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter degrees for this specific employee
    let filtered = mockDegrees.filter(d => d.employeeId === employeeId.toString());
    
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(d => d.type === typeFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.major?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by issue date (newest first)
    filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    
    setDegrees(filtered);
    setIsLoading(false);
  };

  const handleOpenFormModal = (degree?: Degree) => {
    setSelectedDegree(degree || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedDegree(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedDegreeId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDegreeId(null);
  };

  const handleDeleteClick = (degree: Degree) => {
    setDegreeToDelete(degree);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!degreeToDelete) return;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockDegrees.findIndex(d => d.id === degreeToDelete.id);
    if (index > -1) {
      mockDegrees.splice(index, 1);
    }
    
    setIsDeleteDialogOpen(false);
    setDegreeToDelete(null);
    setRefreshKey(prev => prev + 1);
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'EDUCATION': { label: 'Học vấn', className: 'bg-blue-100 text-blue-800', icon: BookOpen },
      'CERTIFICATION': { label: 'Chứng chỉ', className: 'bg-purple-100 text-purple-800', icon: Award },
      'LICENSE': { label: 'Giấy phép', className: 'bg-orange-100 text-orange-800', icon: FileCheck },
    };

    const config = typeConfig[type];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
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
    
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      return (
        <div className="flex items-center gap-1 text-orange-600 text-xs mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>Còn {daysUntilExpiry} ngày</span>
        </div>
      );
    }
    
    return null;
  };

  // Calculate statistics
  const stats = {
    total: degrees.length,
    education: degrees.filter(d => d.type === 'EDUCATION').length,
    certification: degrees.filter(d => d.type === 'CERTIFICATION').length,
    license: degrees.filter(d => d.type === 'LICENSE').length,
    expiringSoon: degrees.filter(d => {
      if (!d.expiryDate) return false;
      const daysUntilExpiry = Math.floor((new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length,
    expired: degrees.filter(d => {
      if (!d.expiryDate) return false;
      return new Date(d.expiryDate) < new Date();
    }).length,
  };

  return (
    <div className="space-y-4">

      {/* Summary Info */}
      {stats.total > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Tóm tắt bằng cấp</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <Label className="text-blue-600">Tổng số</Label>
                  <p className="font-semibold text-blue-900">{stats.total}</p>
                </div>
                <div>
                  <Label className="text-blue-600">Học vấn</Label>
                  <p className="font-semibold text-blue-700">{stats.education}</p>
                </div>
                <div>
                  <Label className="text-blue-600">Chứng chỉ</Label>
                  <p className="font-semibold text-purple-600">{stats.certification}</p>
                </div>
                <div>
                  <Label className="text-blue-600">Giấy phép</Label>
                  <p className="font-semibold text-orange-600">{stats.license}</p>
                </div>
                <div>
                  <Label className="text-blue-600">Sắp hết hạn</Label>
                  <p className="font-semibold text-red-600">{stats.expiringSoon}</p>
                </div>
              </div>
            </div>
            <Award className="h-12 w-12 text-blue-400" />
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên bằng cấp, tổ chức hoặc chuyên ngành"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="EDUCATION">Học vấn</SelectItem>
              <SelectItem value="CERTIFICATION">Chứng chỉ</SelectItem>
              <SelectItem value="LICENSE">Giấy phép</SelectItem>
            </SelectContent>
          </Select>

          {isAdmin && (
            <Button onClick={() => handleOpenFormModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm bằng cấp
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
                      <p>Nhân viên này chưa có bằng cấp nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                degrees.map((degree) => (
                  <TableRow key={degree.id} className="hover:bg-muted/50">
                    <TableCell>
                      {getTypeBadge(degree.type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{degree.name}</p>
                        {degree.major && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Chuyên ngành: {degree.major}
                          </p>
                        )}
                        {degree.level && (
                          <p className="text-xs text-muted-foreground">
                            Trình độ: {degree.level}
                          </p>
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
                      <span className="text-sm font-medium">
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
                          <Badge variant="outline" className="text-xs">
                            Vô thời hạn
                          </Badge>
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
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenFormModal(degree)}
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(degree)}
                              title="Xóa"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
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

      {/* Form Modal */}
      <DegreeFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        degree={selectedDegree}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bằng cấp "{degreeToDelete?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
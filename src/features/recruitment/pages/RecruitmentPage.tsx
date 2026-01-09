// pages/hr/recruitment/RecruitmentPage.tsx

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
import { Search, Eye, ChevronLeft, ChevronRight, Briefcase, Plus, Edit, Trash2, Users, FileText, EyeClosed } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { 
  mockJobPostings, 
  type JobPosting,
  calculateRecruitmentStatistics,
  jobStatusLabels,
  employmentTypeLabels,
  levelLabels,
} from '../../../mock/recruitment';
import JobDetailModal from '../components/JobDetailModal';
import JobFormModal from '../components/JobFormModal';

export default function RecruitmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [page, pageSize, searchTerm, statusFilter, departmentFilter, levelFilter, refreshKey]);

  const fetchJobs = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockJobPostings];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(j => j.status === statusFilter);
    }

    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter(j => j.department === departmentFilter);
    }

    if (levelFilter !== 'ALL') {
      filtered = filtered.filter(j => j.level === levelFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(j =>
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by posted date (newest first)
    filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

    setTotalItems(filtered.length);

    const start = page * pageSize;
    const end = start + pageSize;
    setJobs(filtered.slice(start, end));

    setIsLoading(false);
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedJobId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedJobId(null);
  };

  const handleOpenFormModal = (job?: JobPosting) => {
    setSelectedJob(job || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedJob(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleDeleteClick = (job: JobPosting) => {
    // setJobToDelete(job);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockJobPostings.findIndex(j => j.id === jobToDelete.id);
    if (index > -1) {
      mockJobPostings.splice(index, 1);
    }
    
    setIsDeleteDialogOpen(false);
    setJobToDelete(null);
    setRefreshKey(prev => prev + 1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: jobStatusLabels.DRAFT, className: 'bg-gray-100 text-gray-800' },
      'ACTIVE': { label: jobStatusLabels.ACTIVE, className: 'bg-green-100 text-green-800' },
      'CLOSED': { label: jobStatusLabels.CLOSED, className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    if (!config) return null;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getEmploymentTypeBadge = (type: string) => {
    const typeConfig = {
      'FULL_TIME': { className: 'bg-blue-100 text-blue-800' },
      'PART_TIME': { className: 'bg-purple-100 text-purple-800' },
      'CONTRACT': { className: 'bg-orange-100 text-orange-800' },
      'INTERNSHIP': { className: 'bg-yellow-100 text-yellow-800' },
    };

    const config = typeConfig[type];
    if (!config) return null;

    return (
      <Badge className={config.className} variant="outline">
        {employmentTypeLabels[type]}
      </Badge>
    );
  };

  // Calculate statistics
  const stats = calculateRecruitmentStatistics(mockJobPostings);

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  const departments = Array.from(new Set(mockJobPostings.map(j => j.department)));
  const levels = ['INTERN', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'MANAGER'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tuyển dụng</h1>
          <p className="text-muted-foreground">
            Quản lý tin tuyển dụng và hồ sơ ứng viên
          </p>
        </div>
        <Button onClick={() => handleOpenFormModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo tin tuyển dụng
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo vị trí, phòng ban hoặc địa điểm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="DRAFT">Nháp</SelectItem>
              <SelectItem value="ACTIVE">Đang tuyển</SelectItem>
              <SelectItem value="CLOSED">Đã đóng</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Cấp bậc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả cấp bậc</SelectItem>
              {levels.map(level => (
                <SelectItem key={level} value={level}>{levelLabels[level]}</SelectItem>
              ))}
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
                <TableHead>Vị trí tuyển dụng</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Loại hình</TableHead>
                <TableHead>Lương</TableHead>
                <TableHead>Hạn nộp</TableHead>
                <TableHead>Ứng viên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-8 w-8" />
                      <p>Không tìm thấy tin tuyển dụng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {levelLabels[job.level]} • {job.location}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{job.department}</span>
                    </TableCell>
                    <TableCell>
                      {getEmploymentTypeBadge(job.employmentType)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{job.salaryRange}</span>
                    </TableCell>
                    <TableCell>
                      {job.deadline ? (
                        <div className="text-sm">
                          <div>{new Date(job.deadline).toLocaleDateString('vi-VN')}</div>
                          {(() => {
                            const daysLeft = Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (daysLeft < 0) {
                              return <span className="text-xs text-red-600">Đã hết hạn</span>;
                            } else if (daysLeft <= 7) {
                              return <span className="text-xs text-orange-600">Còn {daysLeft} ngày</span>;
                            }
                            return <span className="text-xs text-muted-foreground">Còn {daysLeft} ngày</span>;
                          })()}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Không giới hạn</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{job.applicants.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(job.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(job.id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenFormModal(job)}
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(job)}
                          title="Xóa"
                          className="text-red-600 hover:text-red-700"
                        >
                          <EyeClosed className="h-4 w-4" />
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
        {!isLoading && jobs.length > 0 && (
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

      {/* Detail Modal */}
      <JobDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        jobId={selectedJobId}
        onRefresh={() => setRefreshKey(prev => prev + 1)}
      />

      {/* Form Modal */}
      <JobFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        job={selectedJob}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đóng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đóng tin tuyển dụng "{jobToDelete?.title}"? 
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
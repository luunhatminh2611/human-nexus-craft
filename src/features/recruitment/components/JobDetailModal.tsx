// components/JobDetailModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users,
  FileText,
  Download,
  X,
  Check,
  Clock,
} from 'lucide-react';
import { 
  mockJobPostings, 
  type JobPosting,
  type Applicant,
  jobStatusLabels,
  employmentTypeLabels,
  levelLabels,
  applicationStatusLabels,
} from '../../../mock/recruitment';

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  onRefresh?: () => void;
}

export default function JobDetailModal({ isOpen, onClose, jobId, onRefresh }: JobDetailModalProps) {
  const [job, setJob] = useState<JobPosting | null>(null);
  const [editingApplicant, setEditingApplicant] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<string>('');
  const [tempNotes, setTempNotes] = useState<string>('');

  useEffect(() => {
    if (jobId) {
      const foundJob = mockJobPostings.find(j => j.id === jobId);
      setJob(foundJob || null);
    }
  }, [jobId]);

  if (!job) return null;

  const handleStatusChange = (applicantId: string) => {
    const applicant = job.applicants.find(a => a.id === applicantId);
    if (applicant) {
      applicant.status = tempStatus as any;
      if (tempNotes.trim()) {
        applicant.notes = tempNotes;
      }
      setEditingApplicant(null);
      setTempStatus('');
      setTempNotes('');
      onRefresh?.();
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      NEW: 'bg-blue-100 text-blue-800',
      REVIEWING: 'bg-yellow-100 text-yellow-800',
      INTERVIEW: 'bg-purple-100 text-purple-800',
      OFFERED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      ACCEPTED: 'bg-emerald-100 text-emerald-800',
    };
    return <Badge className={configs[status]}>{applicationStatusLabels[status]}</Badge>;
  };

  const getJobStatusBadge = (status: string) => {
    const configs = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      CLOSED: 'bg-red-100 text-red-800',
    };
    return <Badge className={configs[status]}>{jobStatusLabels[status]}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{job.title}</span>
            {getJobStatusBadge(job.status)}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin công việc</TabsTrigger>
            <TabsTrigger value="applicants">
              Ứng viên ({job.applicants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phòng ban:</span>
                <span className="font-medium">{job.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Địa điểm:</span>
                <span className="font-medium">{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cấp bậc:</span>
                <span className="font-medium">{levelLabels[job.level]}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Loại hình:</span>
                <span className="font-medium">{employmentTypeLabels[job.employmentType]}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Mức lương:</span>
                <span className="font-medium">{job.salaryRange}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Hạn nộp:</span>
                <span className="font-medium">
                  {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Mô tả công việc</h3>
              <p className="text-sm text-muted-foreground">{job.description}</p>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="font-semibold mb-2">Yêu cầu</h3>
              <ul className="list-disc list-inside space-y-1">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">{req}</li>
                ))}
              </ul>
            </div>

            {/* Responsibilities */}
            <div>
              <h3 className="font-semibold mb-2">Trách nhiệm</h3>
              <ul className="list-disc list-inside space-y-1">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">{resp}</li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="font-semibold mb-2">Quyền lợi</h3>
              <ul className="list-disc list-inside space-y-1">
                {job.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">{benefit}</li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="applicants" className="space-y-4">
            {job.applicants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có ứng viên nào nộp hồ sơ</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ứng viên</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>Ngày nộp</TableHead>
                      <TableHead>CV</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {job.applicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell>
                          <div className="font-medium">{applicant.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-muted-foreground">{applicant.email}</div>
                            <div className="text-muted-foreground">{applicant.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(applicant.appliedDate).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            <span className="text-xs">{applicant.cvFileName}</span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          {editingApplicant === applicant.id ? (
                            <div className="flex gap-2">
                              <Select
                                value={tempStatus}
                                onValueChange={setTempStatus}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NEW">Mới</SelectItem>
                                  <SelectItem value="REVIEWING">Đang xem xét</SelectItem>
                                  <SelectItem value="INTERVIEW">Phỏng vấn</SelectItem>
                                  <SelectItem value="OFFERED">Đã offer</SelectItem>
                                  <SelectItem value="REJECTED">Từ chối</SelectItem>
                                  <SelectItem value="ACCEPTED">Đã nhận việc</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(applicant.id)}
                                disabled={!tempStatus}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingApplicant(null);
                                  setTempStatus('');
                                  setTempNotes('');
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingApplicant(applicant.id);
                                setTempStatus(applicant.status);
                                setTempNotes(applicant.notes || '');
                              }}
                              className="hover:opacity-70"
                            >
                              {getStatusBadge(applicant.status)}
                            </button>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingApplicant === applicant.id ? (
                            <Textarea
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              placeholder="Ghi chú..."
                              className="min-h-[60px]"
                            />
                          ) : (
                            <div className="text-sm text-muted-foreground max-w-[200px]">
                              {applicant.notes || '-'}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
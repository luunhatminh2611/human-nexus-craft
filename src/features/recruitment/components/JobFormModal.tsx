// components/JobFormModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Plus, X, Upload, Briefcase, Users } from 'lucide-react';
import { 
  mockJobPostings, 
  type JobPosting,
  type Applicant,
  employmentTypeLabels,
  levelLabels,
  applicationStatusLabels,
} from '../../../mock/recruitment';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: JobPosting | null;
  onSuccess: () => void;
}

export default function JobFormModal({ isOpen, onClose, job, onSuccess }: JobFormModalProps) {
  const [activeTab, setActiveTab] = useState('job-info');
  
  // Job form data
  const [jobFormData, setJobFormData] = useState<{
    title: string;
    department: string;
    location: string;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
    level: 'INTERN' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD' | 'MANAGER';
    salaryRange: string;
    description: string;
    deadline: string;
    status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  }>({
    title: '',
    department: '',
    location: '',
    employmentType: 'FULL_TIME',
    level: 'MIDDLE',
    salaryRange: '',
    description: '',
    deadline: '',
    status: 'DRAFT',
  });

  const [requirements, setRequirements] = useState<string[]>(['']);
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [benefits, setBenefits] = useState<string[]>(['']);

  // Applicant form data
  const [applicantFormData, setApplicantFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cvFileName: '',
    status: 'NEW' as Applicant['status'],
    notes: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (job) {
      setJobFormData({
        title: job.title,
        department: job.department,
        location: job.location,
        employmentType: job.employmentType,
        level: job.level,
        salaryRange: job.salaryRange,
        description: job.description,
        deadline: job.deadline || '',
        status: job.status,
      });
      setRequirements(job.requirements.length > 0 ? job.requirements : ['']);
      setResponsibilities(job.responsibilities.length > 0 ? job.responsibilities : ['']);
      setBenefits(job.benefits.length > 0 ? job.benefits : ['']);
    } else {
      resetJobForm();
    }
    resetApplicantForm();
    setActiveTab('job-info');
  }, [job, isOpen]);

  const resetJobForm = () => {
    setJobFormData({
      title: '',
      department: '',
      location: '',
      employmentType: 'FULL_TIME' as const,
      level: 'MIDDLE' as const,
      salaryRange: '',
      description: '',
      deadline: '',
      status: 'DRAFT' as const,
    });
    setRequirements(['']);
    setResponsibilities(['']);
    setBenefits(['']);
  };

  const resetApplicantForm = () => {
    setApplicantFormData({
      name: '',
      email: '',
      phone: '',
      cvFileName: '',
      status: 'NEW',
      notes: '',
    });
    setSelectedFile(null);
  };

  const handleJobInputChange = (field: string, value: string) => {
    setJobFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplicantInputChange = (field: string, value: string) => {
    setApplicantFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (type: 'requirements' | 'responsibilities' | 'benefits') => {
    if (type === 'requirements') {
      setRequirements(prev => [...prev, '']);
    } else if (type === 'responsibilities') {
      setResponsibilities(prev => [...prev, '']);
    } else {
      setBenefits(prev => [...prev, '']);
    }
  };

  const handleArrayChange = (
    type: 'requirements' | 'responsibilities' | 'benefits',
    index: number,
    value: string
  ) => {
    if (type === 'requirements') {
      setRequirements(prev => prev.map((item, i) => i === index ? value : item));
    } else if (type === 'responsibilities') {
      setResponsibilities(prev => prev.map((item, i) => i === index ? value : item));
    } else {
      setBenefits(prev => prev.map((item, i) => i === index ? value : item));
    }
  };

  const handleArrayRemove = (
    type: 'requirements' | 'responsibilities' | 'benefits',
    index: number
  ) => {
    if (type === 'requirements') {
      setRequirements(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'responsibilities') {
      setResponsibilities(prev => prev.filter((_, i) => i !== index));
    } else {
      setBenefits(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setApplicantFormData(prev => ({ ...prev, cvFileName: file.name }));
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const filteredRequirements = requirements.filter(r => r.trim());
    const filteredResponsibilities = responsibilities.filter(r => r.trim());
    const filteredBenefits = benefits.filter(b => b.trim());

    if (job) {
      const index = mockJobPostings.findIndex(j => j.id === job.id);
      if (index > -1) {
        mockJobPostings[index] = {
          ...mockJobPostings[index],
          ...jobFormData,
          requirements: filteredRequirements,
          responsibilities: filteredResponsibilities,
          benefits: filteredBenefits,
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      const newJob: JobPosting = {
        id: `job-${Date.now()}`,
        ...jobFormData,
        requirements: filteredRequirements,
        responsibilities: filteredResponsibilities,
        benefits: filteredBenefits,
        postedDate: new Date().toISOString(),
        applicants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockJobPostings.unshift(newJob);
    }

    setIsSubmitting(false);
    onSuccess();
  };

  const handleApplicantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job) {
      alert('Vui lòng lưu thông tin tin tuyển dụng trước khi thêm ứng viên');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newApplicant: Applicant = {
      id: `app-${Date.now()}`,
      name: applicantFormData.name,
      email: applicantFormData.email,
      phone: applicantFormData.phone,
      cvFileName: applicantFormData.cvFileName || 'CV_' + applicantFormData.name.replace(/\s+/g, '_') + '.pdf',
      cvFileKey: `cvs/${job.id}/${applicantFormData.cvFileName || 'CV_' + applicantFormData.name.replace(/\s+/g, '_') + '.pdf'}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: applicantFormData.status,
      notes: applicantFormData.notes || undefined,
    };

    const jobIndex = mockJobPostings.findIndex(j => j.id === job.id);
    if (jobIndex > -1) {
      mockJobPostings[jobIndex].applicants.push(newApplicant);
    }

    setIsSubmitting(false);
    resetApplicantForm();
    onSuccess();
  };

  const departments = Array.from(new Set(mockJobPostings.map(j => j.department)));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {job ? `Chỉnh sửa: ${job.title}` : 'Tạo tin tuyển dụng mới'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="job-info" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Thông tin tin tuyển dụng
            </TabsTrigger>
            <TabsTrigger value="applicants" disabled={!job} className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Thêm ứng viên {!job && '(Lưu tin trước)'}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Job Information */}
          <TabsContent value="job-info">
            <form onSubmit={handleJobSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Vị trí tuyển dụng *</Label>
                  <Input
                    id="title"
                    value={jobFormData.title}
                    onChange={(e) => handleJobInputChange('title', e.target.value)}
                    placeholder="VD: Frontend Developer (ReactJS)"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="department">Phòng ban *</Label>
                  <Input
                    id="department"
                    value={jobFormData.department}
                    onChange={(e) => handleJobInputChange('department', e.target.value)}
                    placeholder="VD: Phòng IT"
                    list="departments"
                    required
                  />
                  <datalist id="departments">
                    {departments.map(dept => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <Label htmlFor="location">Địa điểm *</Label>
                  <Input
                    id="location"
                    value={jobFormData.location}
                    onChange={(e) => handleJobInputChange('location', e.target.value)}
                    placeholder="VD: Hà Nội"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="employmentType">Loại hình *</Label>
                  <Select
                    value={jobFormData.employmentType}
                    onValueChange={(value) => handleJobInputChange('employmentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">{employmentTypeLabels.FULL_TIME}</SelectItem>
                      <SelectItem value="PART_TIME">{employmentTypeLabels.PART_TIME}</SelectItem>
                      <SelectItem value="CONTRACT">{employmentTypeLabels.CONTRACT}</SelectItem>
                      <SelectItem value="INTERNSHIP">{employmentTypeLabels.INTERNSHIP}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Cấp bậc *</Label>
                  <Select
                    value={jobFormData.level}
                    onValueChange={(value) => handleJobInputChange('level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERN">{levelLabels.INTERN}</SelectItem>
                      <SelectItem value="JUNIOR">{levelLabels.JUNIOR}</SelectItem>
                      <SelectItem value="MIDDLE">{levelLabels.MIDDLE}</SelectItem>
                      <SelectItem value="SENIOR">{levelLabels.SENIOR}</SelectItem>
                      <SelectItem value="LEAD">{levelLabels.LEAD}</SelectItem>
                      <SelectItem value="MANAGER">{levelLabels.MANAGER}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="salaryRange">Mức lương *</Label>
                  <Input
                    id="salaryRange"
                    value={jobFormData.salaryRange}
                    onChange={(e) => handleJobInputChange('salaryRange', e.target.value)}
                    placeholder="VD: 15-25 triệu"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Hạn nộp hồ sơ</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={jobFormData.deadline}
                    onChange={(e) => handleJobInputChange('deadline', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Trạng thái *</Label>
                  <Select
                    value={jobFormData.status}
                    onValueChange={(value) => handleJobInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Nháp</SelectItem>
                      <SelectItem value="ACTIVE">Đang tuyển</SelectItem>
                      <SelectItem value="CLOSED">Đã đóng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả công việc *</Label>
                <Textarea
                  id="description"
                  value={jobFormData.description}
                  onChange={(e) => handleJobInputChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết về vị trí tuyển dụng..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Yêu cầu công việc</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleArrayAdd('requirements')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-2">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={req}
                        onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                        placeholder={`Yêu cầu ${index + 1}`}
                      />
                      {requirements.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArrayRemove('requirements', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Trách nhiệm công việc</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleArrayAdd('responsibilities')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-2">
                  {responsibilities.map((resp, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={resp}
                        onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                        placeholder={`Trách nhiệm ${index + 1}`}
                      />
                      {responsibilities.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArrayRemove('responsibilities', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Quyền lợi</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleArrayAdd('benefits')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                        placeholder={`Quyền lợi ${index + 1}`}
                      />
                      {benefits.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArrayRemove('benefits', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : (job ? 'Cập nhật' : 'Tạo mới')}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Tab 2: Add Applicants */}
          <TabsContent value="applicants">
            <form onSubmit={handleApplicantSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Thông tin ứng viên</h3>
                
                <div>
                  <Label htmlFor="applicant-name">Họ và tên *</Label>
                  <Input
                    id="applicant-name"
                    value={applicantFormData.name}
                    onChange={(e) => handleApplicantInputChange('name', e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="applicant-email">Email *</Label>
                    <Input
                      id="applicant-email"
                      type="email"
                      value={applicantFormData.email}
                      onChange={(e) => handleApplicantInputChange('email', e.target.value)}
                      placeholder="example@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="applicant-phone">Số điện thoại *</Label>
                    <Input
                      id="applicant-phone"
                      type="tel"
                      value={applicantFormData.phone}
                      onChange={(e) => handleApplicantInputChange('phone', e.target.value)}
                      placeholder="0912345678"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">CV / Hồ sơ</h3>
                
                <div>
                  <Label htmlFor="cv-upload">Upload CV (PDF, DOC, DOCX)</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="cv-upload"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        {selectedFile ? (
                          <div>
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Click để chọn file hoặc kéo thả file vào đây
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF, DOC, DOCX (tối đa 10MB)
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        id="cv-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  
                  <div className="mt-3">
                    <Label htmlFor="applicant-cvFileName" className="text-xs text-muted-foreground">
                      Hoặc nhập tên file CV thủ công
                    </Label>
                    <Input
                      id="applicant-cvFileName"
                      value={applicantFormData.cvFileName}
                      onChange={(e) => handleApplicantInputChange('cvFileName', e.target.value)}
                      placeholder="VD: CV_NguyenVanA.pdf"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Trạng thái & Ghi chú</h3>
                
                <div>
                  <Label htmlFor="applicant-status">Trạng thái *</Label>
                  <Select
                    value={applicantFormData.status}
                    onValueChange={(value) => handleApplicantInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">{applicationStatusLabels.NEW}</SelectItem>
                      <SelectItem value="REVIEWING">{applicationStatusLabels.REVIEWING}</SelectItem>
                      <SelectItem value="INTERVIEW">{applicationStatusLabels.INTERVIEW}</SelectItem>
                      <SelectItem value="OFFERED">{applicationStatusLabels.OFFERED}</SelectItem>
                      <SelectItem value="REJECTED">{applicationStatusLabels.REJECTED}</SelectItem>
                      <SelectItem value="ACCEPTED">{applicationStatusLabels.ACCEPTED}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="applicant-notes">Ghi chú</Label>
                  <Textarea
                    id="applicant-notes"
                    value={applicantFormData.notes}
                    onChange={(e) => handleApplicantInputChange('notes', e.target.value)}
                    placeholder="Ghi chú về ứng viên, kết quả phỏng vấn, đánh giá..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Thông tin này chỉ dành cho nội bộ
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={resetApplicantForm}>
                  Reset form
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang thêm...' : 'Thêm ứng viên'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
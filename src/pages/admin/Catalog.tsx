import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Briefcase, TrendingUp } from 'lucide-react';
import mockData, { JobTitle, Grade } from '@/mock/data';
import { useToast } from '@/hooks/use-toast';

export default function Catalog() {
  const { toast } = useToast();
  const [jobTitles, setJobTitles] = useState<JobTitle[]>(mockData.jobTitles);
  const [grades, setGrades] = useState<Grade[]>(mockData.grades);
  
  // Job Title Dialog States
  const [jobTitleDialog, setJobTitleDialog] = useState(false);
  const [editingJobTitle, setEditingJobTitle] = useState<JobTitle | null>(null);
  const [jobTitleForm, setJobTitleForm] = useState({ name: '', description: '', departmentId: '' });
  
  // Grade Dialog States
  const [gradeDialog, setGradeDialog] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [gradeForm, setGradeForm] = useState({
    jobTitleId: '',
    name: '',
    description: '',
    competencies: '',
    requiredSkills: '',
    requiredTrainings: '',
    order: '',
  });

  // === Job Title Functions ===
  const openAddJobTitle = () => {
    setEditingJobTitle(null);
    setJobTitleForm({ name: '', description: '', departmentId: '' });
    setJobTitleDialog(true);
  };

  const openEditJobTitle = (jt: JobTitle) => {
    setEditingJobTitle(jt);
    setJobTitleForm({
      name: jt.name,
      description: jt.description,
      departmentId: jt.departmentId || '',
    });
    setJobTitleDialog(true);
  };

  const saveJobTitle = () => {
    if (!jobTitleForm.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên chức danh', variant: 'destructive' });
      return;
    }

    if (editingJobTitle) {
      setJobTitles(prev => prev.map(jt => 
        jt.id === editingJobTitle.id 
          ? { ...jt, ...jobTitleForm }
          : jt
      ));
      toast({ title: 'Thành công', description: 'Đã cập nhật chức danh' });
    } else {
      const newJobTitle: JobTitle = {
        id: `jt${Date.now()}`,
        ...jobTitleForm,
      };
      setJobTitles(prev => [...prev, newJobTitle]);
      toast({ title: 'Thành công', description: 'Đã thêm chức danh mới' });
    }
    setJobTitleDialog(false);
  };

  const deleteJobTitle = (id: string) => {
    const hasGrades = grades.some(g => g.jobTitleId === id);
    if (hasGrades) {
      toast({ 
        title: 'Không thể xóa', 
        description: 'Chức danh này có các bậc liên quan. Vui lòng xóa các bậc trước.',
        variant: 'destructive'
      });
      return;
    }
    setJobTitles(prev => prev.filter(jt => jt.id !== id));
    toast({ title: 'Đã xóa', description: 'Xóa chức danh thành công' });
  };

  // === Grade Functions ===
  const openAddGrade = () => {
    setEditingGrade(null);
    setGradeForm({
      jobTitleId: '',
      name: '',
      description: '',
      competencies: '',
      requiredSkills: '',
      requiredTrainings: '',
      order: '',
    });
    setGradeDialog(true);
  };

  const openEditGrade = (g: Grade) => {
    setEditingGrade(g);
    setGradeForm({
      jobTitleId: g.jobTitleId,
      name: g.name,
      description: g.description,
      competencies: g.competencies.join(', '),
      requiredSkills: g.requiredSkills.join(', '),
      requiredTrainings: g.requiredTrainings.join(', '),
      order: g.order.toString(),
    });
    setGradeDialog(true);
  };

  const saveGrade = () => {
    if (!gradeForm.jobTitleId || !gradeForm.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    const gradeData = {
      jobTitleId: gradeForm.jobTitleId,
      name: gradeForm.name,
      description: gradeForm.description,
      competencies: gradeForm.competencies.split(',').map(c => c.trim()).filter(Boolean),
      requiredSkills: gradeForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      requiredTrainings: gradeForm.requiredTrainings.split(',').map(t => t.trim()).filter(Boolean),
      order: parseInt(gradeForm.order) || 1,
    };

    if (editingGrade) {
      setGrades(prev => prev.map(g => 
        g.id === editingGrade.id 
          ? { ...g, ...gradeData }
          : g
      ));
      toast({ title: 'Thành công', description: 'Đã cập nhật bậc' });
    } else {
      const newGrade: Grade = {
        id: `g${Date.now()}`,
        ...gradeData,
      };
      setGrades(prev => [...prev, newGrade]);
      toast({ title: 'Thành công', description: 'Đã thêm bậc mới' });
    }
    setGradeDialog(false);
  };

  const deleteGrade = (id: string) => {
    setGrades(prev => prev.filter(g => g.id !== id));
    toast({ title: 'Đã xóa', description: 'Xóa bậc thành công' });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Danh mục hệ thống</h1>
          <p className="text-muted-foreground">Quản lý chức danh và bậc trong công ty</p>
        </div>

        <Tabs defaultValue="job-titles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="job-titles" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Chức danh
            </TabsTrigger>
            <TabsTrigger value="grades" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Bậc
            </TabsTrigger>
          </TabsList>

          {/* Job Titles Tab */}
          <TabsContent value="job-titles" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddJobTitle}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm chức danh
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobTitles.map(jt => {
                const dept = mockData.departments.find(d => d.id === jt.departmentId);
                const gradeCount = grades.filter(g => g.jobTitleId === jt.id).length;
                
                return (
                  <Card key={jt.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{jt.name}</CardTitle>
                          {dept && (
                            <Badge variant="outline" className="mt-2">
                              {dept.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditJobTitle(jt)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteJobTitle(jt.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{jt.description}</p>
                      <Badge variant="secondary">{gradeCount} bậc</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Grades Tab */}
          <TabsContent value="grades" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddGrade}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm bậc
              </Button>
            </div>

            {jobTitles.map(jt => {
              const jobGrades = grades
                .filter(g => g.jobTitleId === jt.id)
                .sort((a, b) => a.order - b.order);
              
              if (jobGrades.length === 0) return null;

              return (
                <div key={jt.id} className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    {jt.name}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobGrades.map(g => (
                      <Card key={g.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{g.name}</CardTitle>
                            </div>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => openEditGrade(g)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => deleteGrade(g.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">{g.description}</p>
                          
                          <div>
                            <p className="text-xs font-semibold mb-1">Năng lực:</p>
                            <div className="flex flex-wrap gap-1">
                              {g.competencies.slice(0, 2).map((c, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {c}
                                </Badge>
                              ))}
                              {g.competencies.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{g.competencies.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-semibold mb-1">Kỹ năng:</p>
                            <div className="flex flex-wrap gap-1">
                              {g.requiredSkills.slice(0, 2).map((s, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {s}
                                </Badge>
                              ))}
                              {g.requiredSkills.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{g.requiredSkills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>

        {/* Job Title Dialog */}
        <Dialog open={jobTitleDialog} onOpenChange={setJobTitleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingJobTitle ? 'Chỉnh sửa' : 'Thêm'} chức danh</DialogTitle>
              <DialogDescription>
                Nhập thông tin chức danh trong công ty
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tên chức danh *</Label>
                <Input
                  value={jobTitleForm.name}
                  onChange={e => setJobTitleForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Kỹ sư phần mềm"
                />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={jobTitleForm.description}
                  onChange={e => setJobTitleForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả về chức danh này"
                  rows={3}
                />
              </div>
              <div>
                <Label>Phòng ban</Label>
                <Select
                  value={jobTitleForm.departmentId}
                  onValueChange={v => setJobTitleForm(f => ({ ...f, departmentId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setJobTitleDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={saveJobTitle}>Lưu</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Grade Dialog */}
        <Dialog open={gradeDialog} onOpenChange={setGradeDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGrade ? 'Chỉnh sửa' : 'Thêm'} bậc</DialogTitle>
              <DialogDescription>
                Nhập thông tin bậc trong chức danh
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Chức danh *</Label>
                <Select
                  value={gradeForm.jobTitleId}
                  onValueChange={v => setGradeForm(f => ({ ...f, jobTitleId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chức danh" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTitles.map(jt => (
                      <SelectItem key={jt.id} value={jt.id}>
                        {jt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tên bậc *</Label>
                <Input
                  value={gradeForm.name}
                  onChange={e => setGradeForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="VD: G1 - Junior"
                />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={gradeForm.description}
                  onChange={e => setGradeForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả về bậc này"
                  rows={2}
                />
              </div>
              <div>
                <Label>Năng lực (phân cách bởi dấu phẩy)</Label>
                <Textarea
                  value={gradeForm.competencies}
                  onChange={e => setGradeForm(f => ({ ...f, competencies: e.target.value }))}
                  placeholder="VD: Hiểu biết cơ bản, Làm việc nhóm, Ham học hỏi"
                  rows={3}
                />
              </div>
              <div>
                <Label>Kỹ năng yêu cầu (phân cách bởi dấu phẩy)</Label>
                <Textarea
                  value={gradeForm.requiredSkills}
                  onChange={e => setGradeForm(f => ({ ...f, requiredSkills: e.target.value }))}
                  placeholder="VD: JavaScript, React, Git"
                  rows={2}
                />
              </div>
              <div>
                <Label>Mã các khóa đào tạo yêu cầu (phân cách bởi dấu phẩy)</Label>
                <Input
                  value={gradeForm.requiredTrainings}
                  onChange={e => setGradeForm(f => ({ ...f, requiredTrainings: e.target.value }))}
                  placeholder="VD: tr001, tr004"
                />
              </div>
              <div>
                <Label>Thứ tự hiển thị</Label>
                <Input
                  type="number"
                  value={gradeForm.order}
                  onChange={e => setGradeForm(f => ({ ...f, order: e.target.value }))}
                  placeholder="1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setGradeDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={saveGrade}>Lưu</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

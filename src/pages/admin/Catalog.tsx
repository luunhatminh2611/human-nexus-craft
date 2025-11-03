import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import mockData, { JobTitle } from '@/mock/data';
import { useToast } from '@/hooks/use-toast';

export default function Catalog() {
  const { toast } = useToast();

  // --- MOCK DATA ---
  const [jobTitles, setJobTitles] = useState<JobTitle[]>(mockData.jobTitles);
  const [majors, setMajors] = useState([
    { id: 'm1', name: 'Công nghệ thông tin', description: 'Ngành về lập trình và hệ thống' },
    { id: 'm2', name: 'Kinh tế', description: 'Ngành về tài chính và quản trị' },
  ]);
  const [degrees, setDegrees] = useState([
    { id: 'd1', name: 'Tiến sĩ', description: 'Trình độ học vấn cao nhất' },
    { id: 'd2', name: 'Thạc sĩ', description: 'Trình độ sau đại học' },
    { id: 'd3', name: 'Đại học', description: 'Trình độ phổ biến cho nhân viên' },
    { id: 'd4', name: 'Cao đẳng', description: 'Trình độ trung cấp cao hơn trung học' },
  ]);

  // --- COMMON STATE ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', departmentId: '' });
  const [activeTab, setActiveTab] = useState('jobTitles');

  // --- HANDLERS ---
  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', departmentId: '' });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || '',
      departmentId: item.departmentId || '',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên', variant: 'destructive' });
      return;
    }

    let setData, dataName;
    if (activeTab === 'jobTitles') {
      setData = setJobTitles;
      dataName = 'Chức danh';
    } else if (activeTab === 'majors') {
      setData = setMajors;
      dataName = 'Ngành nghề';
    } else {
      setData = setDegrees;
      dataName = 'Bậc học';
    }

    setData((prev) => {
      if (editing) {
        return prev.map((p) => (p.id === editing.id ? { ...p, ...form } : p));
      }
      return [...prev, { id: `${Date.now()}`, ...form }];
    });

    toast({
      title: 'Thành công',
      description: `${editing ? 'Cập nhật' : 'Thêm mới'} ${dataName} thành công`,
    });
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    if (activeTab === 'jobTitles') {
      setJobTitles((prev) => prev.filter((p) => p.id !== id));
    } else if (activeTab === 'majors') {
      setMajors((prev) => prev.filter((p) => p.id !== id));
    } else {
      setDegrees((prev) => prev.filter((p) => p.id !== id));
    }
    toast({ title: 'Đã xóa', description: 'Xóa thành công' });
  };

  const currentData =
    activeTab === 'jobTitles' ? jobTitles : activeTab === 'majors' ? majors : degrees;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Danh mục đào tạo & chức danh</h1>
          <p className="text-muted-foreground">Quản lý các danh mục trong hệ thống</p>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="jobTitles">Chức danh</TabsTrigger>
                <TabsTrigger value="majors">Ngành nghề</TabsTrigger>
                <TabsTrigger value="degrees">Bậc học</TabsTrigger>
              </TabsList>

              <TabsContent value="jobTitles">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={openAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm chức danh
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên chức danh</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Phòng ban</TableHead>
                        <TableHead className="w-[120px] text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobTitles.map((jt) => {
                        const dept = mockData.departments.find((d) => d.id === jt.departmentId);
                        return (
                          <TableRow key={jt.id}>
                            <TableCell className="font-medium">{jt.name}</TableCell>
                            <TableCell>{jt.description}</TableCell>
                            <TableCell>{dept ? dept.name : '-'}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(jt)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(jt.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </TabsContent>

              <TabsContent value="majors">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={openAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm ngành nghề
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên ngành nghề</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {majors.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell>{m.description}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </TabsContent>

              <TabsContent value="degrees">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={openAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm bậc học
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên bậc học</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {degrees.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">{d.name}</TableCell>
                          <TableCell>{d.description}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(d)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* DIALOG */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Chỉnh sửa' : 'Thêm mới'}{' '}
                {activeTab === 'jobTitles'
                  ? 'chức danh'
                  : activeTab === 'majors'
                  ? 'ngành nghề'
                  : 'bậc học'}
              </DialogTitle>
              <DialogDescription>Điền thông tin chi tiết bên dưới</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Tên *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nhập tên"
                />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Nhập mô tả"
                />
              </div>

              {activeTab === 'jobTitles' && (
                <div>
                  <Label>Phòng ban</Label>
                  <Select
                    value={form.departmentId}
                    onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockData.departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSave}>Lưu</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

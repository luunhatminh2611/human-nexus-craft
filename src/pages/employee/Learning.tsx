import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import mockData from '@/mock/data';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Award, Eye, PlayCircle, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeLearning() {
  const { employeeId } = useAuthStore();
  const navigate = useNavigate();
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const myEnrollments = mockData.trainingEnrollments.filter((e) => e.employeeId === employeeId);
  const completedCount = myEnrollments.filter(e => e.status === 'Completed').length;
  const inProgressCount = myEnrollments.filter(e => e.status === 'In Progress').length;
  const assignedCount = myEnrollments.filter(e => e.status === 'Assigned').length;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive', label: string }> = {
      Assigned: { variant: 'outline', label: 'Đã giao' },
      'In Progress': { variant: 'secondary', label: 'Đang học' },
      Completed: { variant: 'default', label: 'Hoàn thành' },
      Failed: { variant: 'destructive', label: 'Trượt' },
    };
    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleStartLearning = (enrollmentId: string) => {
    // Update enrollment status to In Progress
    const enrollment = mockData.trainingEnrollments.find(e => e.id === enrollmentId);
    if (enrollment) {
      enrollment.status = 'In Progress';
      enrollment.progress = 10;
      toast.success('Đã bắt đầu học khóa học');
    }
  };

  const handleTakeTest = (enrollmentId: string) => {
    setSelectedEnrollment(enrollmentId);
    setAnswers({});
    setTestDialogOpen(true);
  };

  const handleSubmitTest = () => {
    const enrollment = mockData.trainingEnrollments.find(e => e.id === selectedEnrollment);
    if (!enrollment) return;

    const training = mockData.trainings.find(t => t.id === enrollment.trainingId);
    if (!training?.questions) return;

    // Calculate score
    let correctCount = 0;
    training.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / training.questions.length) * 10);
    enrollment.testScore = score;
    enrollment.testAttempts = (enrollment.testAttempts || 0) + 1;

    if (score >= 8) {
      enrollment.status = 'Completed';
      enrollment.progress = 100;
      enrollment.completionDate = new Date().toISOString();
      toast.success(`Chúc mừng! Bạn đã hoàn thành khóa học với điểm ${score}/10`);
    } else {
      enrollment.status = 'Failed';
      toast.error(`Bạn chưa đạt (${score}/10). Bạn có thể kiểm tra lại.`);
    }

    setTestDialogOpen(false);
    setSelectedEnrollment(null);
    setAnswers({});
  };

  const currentTest = selectedEnrollment 
    ? mockData.trainingEnrollments.find(e => e.id === selectedEnrollment)
    : null;
  const currentTraining = currentTest
    ? mockData.trainings.find(t => t.id === currentTest.trainingId)
    : null;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Đào tạo & Phát triển</h1>
          <p className="text-muted-foreground">Quản lý các khóa học được giao</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{myEnrollments.length}</p>
                  <p className="text-sm text-muted-foreground">Tổng khóa học</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <PlayCircle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{assignedCount}</p>
                  <p className="text-sm text-muted-foreground">Đã giao</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgressCount}</p>
                  <p className="text-sm text-muted-foreground">Đang học</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Award className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Hoàn thành</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle>Khóa học của tôi</CardTitle>
          </CardHeader>
          <CardContent>
            {myEnrollments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khóa học</TableHead>
                    <TableHead>Thời lượng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Điểm</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myEnrollments.map((enrollment) => {
                    const training = mockData.trainings.find((t) => t.id === enrollment.trainingId);
                    if (!training) return null;

                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{training.title}</p>
                              <p className="text-sm text-muted-foreground">{training.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{training.durationDays} ngày</TableCell>
                        <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                        <TableCell>
                          {enrollment.testScore ? (
                            <span className={enrollment.testScore >= 8 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
                              {enrollment.testScore}/10
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/training/${training.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {enrollment.status === 'Assigned' && (
                              <Button
                                size="sm"
                                onClick={() => handleStartLearning(enrollment.id)}
                              >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Bắt đầu học
                              </Button>
                            )}
                            {(enrollment.status === 'In Progress' || enrollment.status === 'Failed') && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleTakeTest(enrollment.id)}
                              >
                                <FileCheck className="h-4 w-4 mr-2" />
                                {enrollment.status === 'Failed' ? 'Kiểm tra lại' : 'Làm kiểm tra'}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Bạn chưa có khóa học nào được giao
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kiểm tra: {currentTraining?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {currentTraining?.questions?.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <p className="font-semibold">
                  Câu {index + 1}: {question.question}
                </p>
                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={(value) => setAnswers({ ...answers, [question.id]: parseInt(value) })}
                >
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={optIndex.toString()} id={`${question.id}-${optIndex}`} />
                      <Label htmlFor={`${question.id}-${optIndex}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmitTest}
              disabled={Object.keys(answers).length !== (currentTraining?.questions?.length || 0)}
            >
              Nộp bài
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import { BookOpen, Award, Eye, PlayCircle, FileCheck, Clock, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function ManagerTraining() {
  const { employeeId } = useAuthStore();
  const navigate = useNavigate();
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      Completed: 'default',
      Ongoing: 'secondary',
      Upcoming: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status === 'Completed'
          ? 'Hoàn thành'
          : status === 'Ongoing'
          ? 'Đang diễn ra'
          : 'Sắp tới'}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý đào tạo</h1>
            <p className="text-muted-foreground">Chương trình đào tạo và phát triển team</p>
          </div>
        </div>

        {/* Training Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng khóa học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.trainings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đang diễn ra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {mockData.trainings.filter((t) => t.status === 'Ongoing').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {mockData.trainings.filter((t) => t.status === 'Completed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sắp tới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {mockData.trainings.filter((t) => t.status === 'Upcoming').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training List */}
        <div className="grid gap-4 md:grid-cols-2">
          {mockData.trainings.map((training) => {
            const enrollments = mockData.trainingEnrollments.filter(
              (e) => e.trainingId === training.id
            );

            return (
              <Card key={training.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{training.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {training.description}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(training.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{training.durationDays} ngày</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span>Bậc: {training.requiredForGrades.join(', ')}</span>
                    </div>
                    {training.instructor && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{training.instructor}</span>
                      </div>
                    )}
                  </div>

                  {training.completionRate !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Hoàn thành</span>
                        <span className="font-semibold">{training.completionRate}%</span>
                      </div>
                      <Progress value={training.completionRate} />
                    </div>
                  )}

                  {training.deadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Hạn chót: {new Date(training.deadline).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/training/${training.id}`)}
                  >
                    Chi tiết
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

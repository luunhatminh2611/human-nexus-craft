import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import mockData from '@/mock/data';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Star, Calendar, Award, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeLearning() {
  const { employeeId } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');

  const employee = mockData.employees.find((e) => e.id === employeeId);
  const myEnrollments = mockData.trainingEnrollments.filter((e) => e.employeeId === employeeId);
  const completedTrainings = mockData.trainings.filter((t) =>
    employee?.trainingsCompleted.includes(t.id)
  );
  const availableTrainings = mockData.trainings.filter(
    (t) => !myEnrollments.find((e) => e.trainingId === t.id)
  );

  const handleEnroll = (trainingId: string) => {
    toast({
      title: 'Đăng ký thành công',
      description: 'Bạn đã đăng ký khóa học thành công',
    });
  };

  const handleSubmitFeedback = () => {
    toast({
      title: 'Đánh giá thành công',
      description: 'Cảm ơn bạn đã đánh giá khóa học',
    });
    setFeedbackOpen(false);
    setSelectedTraining(null);
    setComments('');
    setRating(5);
  };

  const getEnrollmentStatus = (enrollment: any) => {
    if (enrollment.completedDate) return 'completed';
    if (enrollment.progress >= 100) return 'completed';
    return 'in-progress';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Đào tạo & Phát triển</h1>
          <p className="text-muted-foreground">Quản lý các khóa học và chứng chỉ của bạn</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{myEnrollments.length}</p>
                  <p className="text-sm text-muted-foreground">Khóa học đang theo học</p>
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
                  <p className="text-2xl font-bold">{completedTrainings.length}</p>
                  <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-accent">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{availableTrainings.length}</p>
                  <p className="text-sm text-muted-foreground">Khóa học khả dụng</p>
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
              <div className="space-y-4">
                {myEnrollments.map((enrollment) => {
                  const training = mockData.trainings.find((t) => t.id === enrollment.trainingId);
                  if (!training) return null;
                  const status = getEnrollmentStatus(enrollment);
                  const isCompleted = status === 'completed';

                  return (
                    <div key={enrollment.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{training.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {training.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {training.durationDays} ngày
                            </span>
                            {enrollment.enrolledDate && (
                              <span>
                                Đăng ký: {new Date(enrollment.enrolledDate).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={isCompleted ? 'default' : 'secondary'}>
                          {isCompleted ? 'Hoàn thành' : 'Đang học'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tiến độ</span>
                          <span className="font-medium">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/training/${training.id}`)}
                        >
                          Chi tiết
                        </Button>
                        {isCompleted && (
                          <Dialog open={feedbackOpen && selectedTraining === training.id}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTraining(training.id);
                                  setFeedbackOpen(true);
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Đánh giá
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Đánh giá khóa học</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Đánh giá chung</Label>
                                  <div className="flex gap-2 mt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none"
                                      >
                                        <Star
                                          className={`h-6 w-6 ${
                                            star <= rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label>Nhận xét</Label>
                                  <Textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
                                    rows={4}
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setFeedbackOpen(false);
                                      setSelectedTraining(null);
                                    }}
                                  >
                                    Hủy
                                  </Button>
                                  <Button onClick={handleSubmitFeedback}>Gửi đánh giá</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Bạn chưa đăng ký khóa học nào
              </p>
            )}
          </CardContent>
        </Card>

        {/* Available Trainings */}
        <Card>
          <CardHeader>
            <CardTitle>Khóa học khả dụng</CardTitle>
          </CardHeader>
          <CardContent>
            {availableTrainings.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {availableTrainings.map((training) => (
                  <div key={training.id} className="p-4 border rounded-lg space-y-3">
                    <div>
                      <h3 className="font-semibold">{training.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {training.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {training.durationDays} ngày
                      </span>
                      {training.instructor && <span>GV: {training.instructor}</span>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/training/${training.id}`)}
                      >
                        Chi tiết
                      </Button>
                      <Button size="sm" onClick={() => handleEnroll(training.id)}>
                        Đăng ký
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Không có khóa học khả dụng
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

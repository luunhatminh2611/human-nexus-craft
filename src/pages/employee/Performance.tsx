import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import mockData from '@/mock/data';
import { useAuthStore } from '@/store/authStore';
import { Target, Star, TrendingUp, Calendar, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmployeePerformance() {
  const { employeeId } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selfAssessment, setSelfAssessment] = useState<any>({});

  const myReviews = mockData.performanceReviews.filter((r) => r.employeeId === employeeId);
  const myGoals = mockData.goals.filter((g) => g.employeeId === employeeId);
  
  const currentReview = myReviews.find((r) => r.status === 'Draft' || r.status === 'Submitted');
  const completedReviews = myReviews.filter((r) => r.status === 'Completed');

  const handleStartAssessment = () => {
    if (currentReview) {
      setSelfAssessment(currentReview.selfAssessment || {
        goals: [],
        strengths: '',
        improvements: '',
        comments: '',
      });
      setIsEditing(true);
    }
  };

  const handleSaveAssessment = () => {
    toast({
      title: 'Lưu thành công',
      description: 'Bản tự đánh giá đã được lưu',
    });
    setIsEditing(false);
  };

  const handleSubmitAssessment = () => {
    toast({
      title: 'Gửi thành công',
      description: 'Bản tự đánh giá đã được gửi cho quản lý',
    });
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Not Started':
        return <Badge variant="secondary">Chưa bắt đầu</Badge>;
      case 'In Progress':
        return <Badge variant="default">Đang thực hiện</Badge>;
      case 'Completed':
        return <Badge className="bg-success">Hoàn thành</Badge>;
      case 'Delayed':
        return <Badge variant="destructive">Trễ hạn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Đánh giá hiệu suất</h1>
          <p className="text-muted-foreground">Theo dõi mục tiêu và đánh giá hiệu suất của bạn</p>
        </div>

        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Mục tiêu cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myGoals.length > 0 ? (
              <div className="space-y-4">
                {myGoals.map((goal) => (
                  <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Hạn: {new Date(goal.targetDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(goal.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tiến độ</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Chưa có mục tiêu nào được giao
              </p>
            )}
          </CardContent>
        </Card>

        {/* Current Review */}
        {currentReview && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Tự đánh giá - {currentReview.period} {currentReview.year}
              </CardTitle>
              <Badge variant={currentReview.status === 'Draft' ? 'secondary' : 'default'}>
                {currentReview.status === 'Draft' ? 'Bản nháp' : 'Đã gửi'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing ? (
                <>
                  {currentReview.selfAssessment ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Mục tiêu đã đạt được</h3>
                        <div className="space-y-2">
                          {currentReview.selfAssessment.goals.map((goal, idx) => (
                            <div key={idx} className="p-3 border rounded">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-medium text-sm">{goal.goal}</p>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < goal.score
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{goal.achievement}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Điểm mạnh</h3>
                        <p className="text-sm">{currentReview.selfAssessment.strengths}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Cần cải thiện</h3>
                        <p className="text-sm">{currentReview.selfAssessment.improvements}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Bạn chưa hoàn thành bản tự đánh giá
                    </p>
                  )}
                  <Button onClick={handleStartAssessment}>
                    {currentReview.selfAssessment ? 'Chỉnh sửa' : 'Bắt đầu đánh giá'}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Điểm mạnh của bạn</Label>
                    <Textarea
                      value={selfAssessment.strengths}
                      onChange={(e) =>
                        setSelfAssessment({ ...selfAssessment, strengths: e.target.value })
                      }
                      placeholder="Mô tả những điểm mạnh của bạn..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Điểm cần cải thiện</Label>
                    <Textarea
                      value={selfAssessment.improvements}
                      onChange={(e) =>
                        setSelfAssessment({ ...selfAssessment, improvements: e.target.value })
                      }
                      placeholder="Những điểm bạn muốn cải thiện..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Nhận xét chung</Label>
                    <Textarea
                      value={selfAssessment.comments}
                      onChange={(e) =>
                        setSelfAssessment({ ...selfAssessment, comments: e.target.value })
                      }
                      placeholder="Nhận xét của bạn về kỳ đánh giá này..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setSelfAssessment({});
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                    <Button variant="outline" onClick={handleSaveAssessment}>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu nháp
                    </Button>
                    <Button onClick={handleSubmitAssessment}>Gửi đánh giá</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manager Reviews */}
        {currentReview?.managerAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Đánh giá của quản lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Đánh giá tổng thể</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {currentReview.managerAssessment.overallRating}
                    </span>
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Đánh giá mục tiêu</h3>
                <div className="space-y-2">
                  {currentReview.managerAssessment.goals.map((goal, idx) => (
                    <div key={idx} className="p-3 border rounded">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-sm">{goal.goal}</p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < goal.score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{goal.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Điểm mạnh</h3>
                <p className="text-sm">{currentReview.managerAssessment.strengths}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Cần cải thiện</h3>
                <p className="text-sm">{currentReview.managerAssessment.improvements}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Nhận xét</h3>
                <p className="text-sm">{currentReview.managerAssessment.comments}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review History */}
        {completedReviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedReviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">
                          {review.period} {review.year}
                        </h3>
                        {review.reviewedDate && (
                          <p className="text-sm text-muted-foreground">
                            Đánh giá: {new Date(review.reviewedDate).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                      {review.managerAssessment && (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-lg">
                            {review.managerAssessment.overallRating}
                          </span>
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

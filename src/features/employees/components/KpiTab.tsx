// src/features/employees/components/KpiTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Button from '@/shared/components/ui/button/Button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import {
  Target,
  TrendingUp,
  Calendar,
  Award,
  FileText,
  BarChart3,
  Star,
  MessageSquare,
} from 'lucide-react';

export default function KpiTab({ userData }) {
  // Tính điểm KPI trung bình
  const kpiRecords = userData.kpiRecords || [];
  const averageScore =
    kpiRecords.length > 0
      ? kpiRecords.reduce((sum: number, record: any) => sum + (record.totalScore || 0), 0) /
        kpiRecords.length
      : 0;

  // Lấy KPI gần nhất
  const latestKpi = kpiRecords.length > 0 ? kpiRecords[0] : null;

  // Xếp hạng dựa trên điểm
  const getRating = (score: number) => {
    if (score >= 90) return { label: 'Xuất sắc', variant: 'default' as const, color: 'text-green-600' };
    if (score >= 80) return { label: 'Tốt', variant: 'default' as const, color: 'text-blue-600' };
    if (score >= 70) return { label: 'Khá', variant: 'secondary' as const, color: 'text-yellow-600' };
    if (score >= 60) return { label: 'Trung bình', variant: 'secondary' as const, color: 'text-orange-600' };
    return { label: 'Cần cải thiện', variant: 'destructive' as const, color: 'text-red-600' };
  };

  return (
    <div className="space-y-4">
      {/* Tổng quan KPI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Tổng quan KPI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Điểm trung bình */}
            <div className="p-4 border rounded-lg text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold">{averageScore.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Điểm trung bình</p>
            </div>

            {/* Số lần đánh giá */}
            <div className="p-4 border rounded-lg text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold">{kpiRecords.length}</p>
              <p className="text-sm text-muted-foreground">Lần đánh giá</p>
            </div>

            {/* Xếp hạng */}
            <div className="p-4 border rounded-lg text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <p className={`text-2xl font-bold ${getRating(averageScore).color}`}>
                {getRating(averageScore).label}
              </p>
              <p className="text-sm text-muted-foreground">Xếp hạng chung</p>
            </div>
          </div>

          {/* Progress bar */}
          {averageScore > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Hiệu suất tổng thể</span>
                <span className="text-sm font-semibold">{averageScore.toFixed(1)}/100</span>
              </div>
              <Progress value={averageScore} className="h-3" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI gần nhất */}
      {latestKpi && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Đánh giá gần nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">
                    {latestKpi.period || 'Kỳ đánh giá'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {latestKpi.evaluationDate
                      ? new Date(latestKpi.evaluationDate).toLocaleDateString('vi-VN')
                      : 'Chưa rõ ngày'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">
                    {latestKpi.totalScore || 0}
                  </div>
                  <Badge variant={getRating(latestKpi.totalScore || 0).variant}>
                    {getRating(latestKpi.totalScore || 0).label}
                  </Badge>
                </div>
              </div>

              {/* Chi tiết điểm theo tiêu chí */}
              {latestKpi.criteria && latestKpi.criteria.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <p className="font-semibold">Chi tiết theo tiêu chí</p>
                  {latestKpi.criteria.map((criterion: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{criterion.name}</span>
                        <span className="text-sm font-semibold">
                          {criterion.score}/{criterion.maxScore}
                        </span>
                      </div>
                      <Progress
                        value={(criterion.score / criterion.maxScore) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Nhận xét */}
              {latestKpi.feedback && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <p className="font-semibold">Nhận xét</p>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {latestKpi.feedback}
                  </p>
                </div>
              )}

              {/* Người đánh giá */}
              {latestKpi.evaluator && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Người đánh giá: <span className="font-medium">{latestKpi.evaluator}</span>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lịch sử KPI */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Lịch sử đánh giá KPI
          </CardTitle>
          <Button variant="outline" size="sm">
            Thêm đánh giá
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {kpiRecords.length > 0 ? (
              kpiRecords.map((record: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">{record.period || `Kỳ ${index + 1}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.evaluationDate
                          ? new Date(record.evaluationDate).toLocaleDateString('vi-VN')
                          : 'Chưa rõ ngày'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-1">{record.totalScore || 0}</div>
                      <Badge variant={getRating(record.totalScore || 0).variant}>
                        {getRating(record.totalScore || 0).label}
                      </Badge>
                    </div>
                  </div>

                  {/* Điểm nổi bật */}
                  {record.highlights && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {record.highlights.map((highlight: string, i: number) => (
                        <Badge key={i} variant="outline">
                          <Star className="h-3 w-3 mr-1" />
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  {record.summary && (
                    <p className="text-sm text-muted-foreground mt-2">{record.summary}</p>
                  )}

                  {/* Người đánh giá */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-sm">
                    <span className="text-muted-foreground">
                      Đánh giá bởi: <span className="font-medium">{record.evaluator || 'N/A'}</span>
                    </span>
                    <Button variant="ghost" size="sm">
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Chưa có đánh giá KPI nào</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Tạo đánh giá đầu tiên
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mục tiêu */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Mục tiêu cá nhân
          </CardTitle>
          <Button variant="outline" size="sm">
            Thêm mục tiêu
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userData.goals && userData.goals.length > 0 ? (
              userData.goals.map((goal: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{goal.title || 'Mục tiêu'}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {goal.description || 'Không có mô tả'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        goal.status === 'Completed'
                          ? 'default'
                          : goal.status === 'InProgress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {goal.status === 'Completed'
                        ? 'Hoàn thành'
                        : goal.status === 'InProgress'
                        ? 'Đang thực hiện'
                        : 'Chưa bắt đầu'}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Tiến độ</span>
                      <span className="text-sm font-semibold">{goal.progress || 0}%</span>
                    </div>
                    <Progress value={goal.progress || 0} />
                  </div>

                  {/* Deadline */}
                  {goal.deadline && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Hạn chót: {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Chưa có mục tiêu cá nhân nào
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
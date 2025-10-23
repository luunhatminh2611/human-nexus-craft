import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, TrendingUp, Award, BookOpen, Target } from 'lucide-react';
import mockData from '@/mock/data';
import { useAuthStore } from '@/store/authStore';

export default function CareerPath() {
  const { employeeId } = useAuthStore();
  
  // Lấy thông tin nhân viên hiện tại
  const currentEmployee = mockData.employees.find(e => e.id === employeeId) || mockData.employees[4];
  
  // Tìm chức danh dựa trên position của nhân viên
  const jobTitle = mockData.jobTitles.find(jt => 
    currentEmployee.position.toLowerCase().includes(jt.name.toLowerCase())
  ) || mockData.jobTitles[0];
  
  // Lấy tất cả các bậc của chức danh này
  const allGrades = mockData.grades
    .filter(g => g.jobTitleId === jobTitle.id)
    .sort((a, b) => a.order - b.order);
  
  // Tìm bậc hiện tại
  const currentGrade = allGrades.find(g => 
    g.name.includes(currentEmployee.grade)
  ) || allGrades[0];
  
  const currentIndex = allGrades.findIndex(g => g.id === currentGrade.id);
  const nextGrade = currentIndex < allGrades.length - 1 ? allGrades[currentIndex + 1] : null;
  
  // Tính toán progress (giả lập dựa trên trainings đã hoàn thành)
  const progress = currentEmployee.trainingsCompleted.length / (currentGrade.requiredTrainings.length || 1) * 100;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Lộ trình thăng tiến của tôi</h1>
          <p className="text-muted-foreground">
            Xem vị trí hiện tại và các bậc tiếp theo trong sự nghiệp
          </p>
        </div>

        {/* Current Info */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {currentEmployee.firstName} {currentEmployee.lastName}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {currentEmployee.position} - {currentEmployee.grade}
                </CardDescription>
              </div>
              <Badge variant="default" className="text-sm">
                Bậc hiện tại
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Tiến độ phát triển</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Năng lực hiện tại:
                </p>
                <div className="space-y-1">
                  {currentGrade.competencies.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Đào tạo đã hoàn thành:
                </p>
                <div className="space-y-1">
                  {currentEmployee.trainingsCompleted.map(tId => {
                    const training = mockData.trainings.find(t => t.id === tId);
                    return training ? (
                      <div key={tId} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {training.title}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Career Path Timeline */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lộ trình thăng tiến trong chức danh: {jobTitle.name}
          </h2>
          
          <div className="space-y-4">
            {allGrades.map((grade, idx) => {
              const isCurrent = grade.id === currentGrade.id;
              const isPast = idx < currentIndex;
              const isFuture = idx > currentIndex;
              
              return (
                <Card 
                  key={grade.id}
                  className={`${
                    isCurrent ? 'border-primary bg-primary/5' : 
                    isPast ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 
                    'border-muted'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {isPast && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                          {isCurrent && <Circle className="h-6 w-6 text-primary fill-primary" />}
                          {isFuture && <Circle className="h-6 w-6 text-muted-foreground" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{grade.name}</CardTitle>
                        </div>
                      </div>
                      {isCurrent && (
                        <Badge variant="default">Bậc hiện tại</Badge>
                      )}
                      {idx === currentIndex + 1 && (
                        <Badge variant="outline">Bậc tiếp theo</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{grade.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Năng lực yêu cầu:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {grade.competencies.map((c, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          Kỹ năng cần có:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {grade.requiredSkills.map((s, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {grade.requiredTrainings.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-2">Đào tạo yêu cầu:</p>
                        <div className="space-y-1">
                          {grade.requiredTrainings.map(tId => {
                            const training = mockData.trainings.find(t => t.id === tId);
                            const completed = currentEmployee.trainingsCompleted.includes(tId);
                            return training ? (
                              <div key={tId} className="flex items-center gap-2 text-sm">
                                {completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Circle className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className={completed ? 'text-green-700 dark:text-green-400' : ''}>
                                  {training.title}
                                </span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        {nextGrade && (
          <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Bước tiếp theo để thăng tiến
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                Để đạt được bậc <strong>{nextGrade.name}</strong>, bạn cần:
              </p>
              <ul className="space-y-2 text-sm ml-4">
                {nextGrade.requiredTrainings
                  .filter(tId => !currentEmployee.trainingsCompleted.includes(tId))
                  .map(tId => {
                    const training = mockData.trainings.find(t => t.id === tId);
                    return training ? (
                      <li key={tId} className="flex items-start gap-2">
                        <Circle className="h-4 w-4 mt-0.5 text-blue-600" />
                        <span>Hoàn thành khóa đào tạo: <strong>{training.title}</strong></span>
                      </li>
                    ) : null;
                  })}
                <li className="flex items-start gap-2">
                  <Circle className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>Phát triển các năng lực: <strong>{nextGrade.competencies.join(', ')}</strong></span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

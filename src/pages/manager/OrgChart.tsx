import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import mockData from '@/mock/data';
import { Building2, Users, User, UserCog } from 'lucide-react';

export default function ManagerOrgChart() {
  const countEmployees = (deptId: string) =>
    mockData.employees.filter(
      (e) => e.departmentId === deptId && e.status !== 'Resigned'
    ).length;

  // Get root department (no parent)
  const rootDept = mockData.departments.find((d) => !d.parentId);
  const childDepts = mockData.departments.filter((d) => d.parentId === rootDept?.id);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sơ đồ tổ chức</h1>
          <p className="text-muted-foreground">Cơ cấu tổ chức của công ty</p>
        </div>

        {/* Organizational Chart */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-8">
              {/* Root Department */}
              {rootDept && (
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary rounded-lg p-6 min-w-[280px] shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="h-6 w-6 text-primary" />
                      <h3 className="font-bold text-lg">{rootDept.name}</h3>
                    </div>
                    {mockData.employees.find((e) => e.id === rootDept.managerId) && (
                      <div className="space-y-1 mb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            Giám đốc: {mockData.employees.find((e) => e.id === rootDept.managerId)?.firstName}{' '}
                            {mockData.employees.find((e) => e.id === rootDept.managerId)?.lastName}
                          </span>
                        </div>
                        {rootDept.deputyDirectorId && mockData.employees.find((e) => e.id === rootDept.deputyDirectorId) && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UserCog className="h-4 w-4" />
                            <span>
                              Phó giám đốc: {mockData.employees.find((e) => e.id === rootDept.deputyDirectorId)?.firstName}{' '}
                              {mockData.employees.find((e) => e.id === rootDept.deputyDirectorId)?.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{countEmployees(rootDept.id)} nhân viên</span>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {childDepts.length > 0 && (
                    <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-primary/50"></div>
                  )}
                </div>
              )}

              {/* Child Departments */}
              {childDepts.length > 0 && (
                <div className="relative">
                  {/* Horizontal Line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/30" style={{ top: '-24px' }}></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                    {childDepts.map((dept) => {
                      const manager = mockData.employees.find((e) => e.id === dept.managerId);
                      const deputyManager = dept.deputyManagerId
                        ? mockData.employees.find((e) => e.id === dept.deputyManagerId)
                        : null;
                      const empCount = countEmployees(dept.id);

                      return (
                        <div key={dept.id} className="flex flex-col items-center">
                          {/* Vertical connector */}
                          <div className="w-0.5 h-6 bg-primary/30 mb-2"></div>

                          <div className="bg-card border-2 border-border hover:border-primary/50 rounded-lg p-5 min-w-[240px] shadow-md transition-all hover:shadow-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <Building2 className="h-5 w-5 text-primary" />
                              <h4 className="font-semibold text-base">{dept.name}</h4>
                            </div>
                            {manager && (
                              <div className="space-y-1 mb-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-muted-foreground">
                                    TP: {manager.firstName} {manager.lastName}
                                  </span>
                                </div>
                                {deputyManager && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <UserCog className="h-3 w-3" />
                                    <span>
                                      Phó: {deputyManager.firstName} {deputyManager.lastName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              <span>{empCount} nhân viên</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Department Details */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockData.departments.map((dept) => {
            const employees = mockData.employees.filter(
              (e) => e.departmentId === dept.id && e.status !== 'Resigned'
            );
            const manager = dept.managerId
              ? mockData.employees.find((e) => e.id === dept.managerId)
              : null;
            const deputyManager = dept.deputyManagerId
              ? mockData.employees.find((e) => e.id === dept.deputyManagerId)
              : null;
            const deputy = dept.deputyDirectorId
              ? mockData.employees.find((e) => e.id === dept.deputyDirectorId)
              : null;

            return (
              <Card key={dept.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {dept.name}
                  </CardTitle>
                  <div className="space-y-1">
                    {manager && (
                      <p className="text-sm text-muted-foreground">
                        Trưởng phòng: {manager.firstName} {manager.lastName}
                      </p>
                    )}
                    {deputy && (
                      <p className="text-xs text-muted-foreground">
                        Phó giám đốc: {deputy.firstName} {deputy.lastName}
                      </p>
                    )}
                    {deputyManager && (
                      <p className="text-xs text-muted-foreground">
                        Phó phòng: {deputyManager.firstName} {deputyManager.lastName}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{employees.length} nhân viên</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {employees.slice(0, 5).map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center gap-2 p-2 bg-accent rounded-lg"
                      >
                        <img
                          src={emp.avatar}
                          alt={`${emp.firstName} ${emp.lastName}`}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-xs">
                          {emp.firstName} {emp.lastName}
                        </span>
                      </div>
                    ))}
                    {employees.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{employees.length - 5} khác
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

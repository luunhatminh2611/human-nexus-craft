import { Layout } from '@/shared/components/layouts/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import mockData from '@/mock/data';
import { useMemo } from 'react';
import { ReactFlow, Node, Edge, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Building2, Users } from 'lucide-react';

export default function ManagerOrgChart() {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Get root department (no parent)
    const rootDept = mockData.departments.find((d) => !d.parentId);

    if (rootDept) {
      const rootEmployees = mockData.employees.filter(
        (e) => e.departmentId === rootDept.id && e.status !== 'Resigned'
      );
      const manager = rootDept.managerId
        ? mockData.employees.find((e) => e.id === rootDept.managerId)
        : null;

      nodes.push({
        id: rootDept.id,
        type: 'default',
        position: { x: 250, y: 0 },
        data: {
          label: (
            <div className="p-4 bg-card border rounded-lg shadow-sm min-w-48">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-bold">{rootDept.name}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{rootEmployees.length} nhân viên</span>
              </div>
              {manager && (
                <p className="text-xs text-muted-foreground mt-1">
                  Trưởng: {manager.firstName} {manager.lastName}
                </p>
              )}
            </div>
          ),
        },
      });

      // Child departments
      const childDepts = mockData.departments.filter((d) => d.parentId === rootDept.id);
      childDepts.forEach((dept, index) => {
        const deptEmployees = mockData.employees.filter(
          (e) => e.departmentId === dept.id && e.status !== 'Resigned'
        );
        const deptManager = dept.managerId
          ? mockData.employees.find((e) => e.id === dept.managerId)
          : null;

        nodes.push({
          id: dept.id,
          type: 'default',
          position: { x: index * 200, y: 150 },
          data: {
            label: (
              <div className="p-4 bg-card border rounded-lg shadow-sm min-w-48">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">{dept.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{deptEmployees.length} nhân viên</span>
                </div>
                {deptManager && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Trưởng: {deptManager.firstName} {deptManager.lastName}
                  </p>
                )}
              </div>
            ),
          },
        });

        edges.push({
          id: `e-${rootDept.id}-${dept.id}`,
          source: rootDept.id,
          target: dept.id,
          type: 'smoothstep',
        });
      });
    }

    return { nodes, edges };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sơ đồ tổ chức</h1>
        <p className="text-muted-foreground">Cơ cấu tổ chức của công ty</p>
      </div>

      <Card className="h-[600px]">
        <CardContent className="p-0 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
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

          return (
            <Card key={dept.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {dept.name}
                </CardTitle>
                {manager && (
                  <p className="text-sm text-muted-foreground">
                    Trưởng phòng: {manager.firstName} {manager.lastName}
                  </p>
                )}
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
  );
}

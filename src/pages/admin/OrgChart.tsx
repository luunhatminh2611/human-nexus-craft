import { useCallback, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import mockData from '@/mock/data';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Users, User } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function OrgChart() {
  // Build hierarchical structure
  const orgStructure = useMemo(() => {
    const rootDept = mockData.departments.find((d) => !d.parentId);
    const childDepts = mockData.departments.filter((d) => d.parentId);

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (rootDept) {
      const empCount = mockData.employees.filter(
        (e) => e.departmentId === rootDept.id && e.status !== 'Resigned'
      ).length;

      nodes.push({
        id: rootDept.id,
        type: 'default',
        data: {
          label: (
            <div className="p-4 bg-card rounded-lg border-2 border-primary shadow-lg min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base">{rootDept.name}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{empCount} nhân viên</span>
              </div>
            </div>
          ),
        },
        position: { x: 250, y: 0 },
        style: { background: 'transparent', border: 'none' },
      });

      childDepts.forEach((dept, index) => {
        const empCount = mockData.employees.filter(
          (e) => e.departmentId === dept.id && e.status !== 'Resigned'
        ).length;
        const manager = mockData.employees.find((e) => e.id === dept.managerId);

        nodes.push({
          id: dept.id,
          type: 'default',
          data: {
            label: (
              <div className="p-4 bg-card rounded-lg border border-border shadow-md min-w-[180px]">
                <h4 className="font-semibold text-sm mb-1">{dept.name}</h4>
                {manager && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Trưởng: {manager.firstName} {manager.lastName}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{empCount} người</span>
                </div>
              </div>
            ),
          },
          position: { x: index * 250, y: 200 },
          style: { background: 'transparent', border: 'none' },
        });

        edges.push({
          id: `${rootDept.id}-${dept.id}`,
          source: rootDept.id,
          target: dept.id,
          type: 'smoothstep',
          animated: true,
        });
      });
    }

    return { nodes, edges };
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(orgStructure.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(orgStructure.edges);
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sơ đồ tổ chức</h1>
            <p className="text-muted-foreground">Cơ cấu phòng ban và nhân sự</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/departments")}>
            <Users className="h-4 w-4 mr-2 text-primary" />
            Xem danh sách phòng ban
          </Button>
        </div>

        <Card className="h-[600px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            className="bg-background"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </Card>

        {/* Department Details */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockData.departments.map((dept) => {
            const employees = mockData.employees.filter(
              (e) => e.departmentId === dept.id && e.status !== 'Resigned'
            );
            const manager = mockData.employees.find((e) => e.id === dept.managerId);

            return (
              <Card key={dept.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    {dept.name}
                    <Badge variant="secondary">{employees.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {manager && (
                    <div>
                      <p className="text-xs text-muted-foreground">Trưởng phòng</p>
                      <p className="text-sm font-medium">
                        {manager.firstName} {manager.lastName}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Nhân viên</p>
                    <div className="flex flex-wrap gap-1">
                      {employees.slice(0, 3).map((emp) => (
                        <img
                          key={emp.id}
                          src={emp.avatar}
                          alt={`${emp.firstName} ${emp.lastName}`}
                          className="w-6 h-6 rounded-full border"
                          title={`${emp.firstName} ${emp.lastName}`}
                        />
                      ))}
                      {employees.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          +{employees.length - 3}
                        </div>
                      )}
                    </div>
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

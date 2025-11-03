import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import mockData from "@/mock/data";

interface KPITabProps {
  employeeId: string;
}

export function KPITab({ employeeId }: KPITabProps) {
  // Chỉ hiển thị KPI đã được giao cho nhân viên
  const employeeKPIs = mockData.kpis?.filter(kpi => kpi.employeeId === employeeId) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Đã giao': 'outline',
      'Đang thực hiện': 'secondary',
      'Hoàn thành': 'default',
      'Chưa đạt': 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI của nhân viên</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Danh sách các KPI đã được giao
        </p>
      </CardHeader>
      <CardContent>
        {employeeKPIs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Chưa có KPI nào được giao
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên KPI</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Mục tiêu</TableHead>
                <TableHead>Thực tế</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Người giao</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeKPIs.map((kpi) => (
                <TableRow key={kpi.id}>
                  <TableCell className="font-medium">{kpi.kpiName}</TableCell>
                  <TableCell className="max-w-xs truncate">{kpi.description}</TableCell>
                  <TableCell>
                    {kpi.target} {kpi.unit}
                  </TableCell>
                  <TableCell>
                    {kpi.actual !== undefined ? `${kpi.actual} ${kpi.unit}` : '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(kpi.startDate).toLocaleDateString('vi-VN')} <br />
                    - {new Date(kpi.endDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>{kpi.assignedByName}</TableCell>
                  <TableCell>{getStatusBadge(kpi.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import mockData from "@/mock/data";

export function FamilyList({ employeeId }) {
  const family = mockData.familyMembers.filter(f => f.employeeId === employeeId);

  if (family.length === 0)
    return <p className="text-center text-muted-foreground py-8">Chưa có thông tin thân nhân.</p>;

  return (
    <div>
      <h3 className="font-semibold mb-3">Danh sách thân nhân</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Họ tên</TableHead>
            <TableHead>Mối quan hệ</TableHead>
            <TableHead>Ngày sinh</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Nghề nghiệp</TableHead>
            <TableHead>Địa chỉ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {family.map(f => (
            <TableRow key={f.id}>
              <TableCell className="font-medium">{f.fullName}</TableCell>
              <TableCell><Badge variant="outline">{f.relation}</Badge></TableCell>
              <TableCell>{f.dateOfBirth ? new Date(f.dateOfBirth).toLocaleDateString("vi-VN") : "-"}</TableCell>
              <TableCell>{f.phone || "-"}</TableCell>
              <TableCell>{f.occupation || "-"}</TableCell>
              <TableCell>{f.address || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

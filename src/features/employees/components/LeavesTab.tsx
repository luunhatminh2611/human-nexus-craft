import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { FileText } from 'lucide-react';

export default function LeavesTab({ userData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-600" />
          Đơn xin nghỉ phép
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-center text-muted-foreground py-8">
          Nhân viên này chưa có đơn nghỉ phép nào.
        </p>
      </CardContent>
    </Card>
  );
}
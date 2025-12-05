import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Button from '@/shared/components/ui/button/Button';
import { FileText } from 'lucide-react';



export default function ContractsTab({ userData }) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log("Uploading contract:", file);
    // TODO: Implement actual file upload logic
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Hợp đồng lao động
        </CardTitle>

        <div>
          <input
            type="file"
            id="contractUpload"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={handleFileUpload}
          />
          <Button
            onClick={() =>
              document.getElementById("contractUpload")?.click()
            }
          >
            + Upload hợp đồng
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground italic">
          Chưa có hợp đồng nào
        </p>
      </CardContent>
    </Card>
  );
}
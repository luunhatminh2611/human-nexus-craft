import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import {
  Heart,
  Plus,
  Eye,
  Edit,
  Calendar,
  Gift,
  FileText,
} from 'lucide-react';
import FamilyVisitFormModal from '@/features/fanilyVisit/components/VisitFormModal';
import FamilyVisitDetailModal from '@/features/fanilyVisit/components/VisitDetailModal';
import mockFamilyVisits from '@/mock/familyVisitData';

interface EmployeeFamilyVisitTabProps {
  employeeId: number;
}

export default function EmployeeFamilyVisitTab({
  employeeId,
}: EmployeeFamilyVisitTabProps) {
  const [visits, setVisits] = useState(
    mockFamilyVisits.filter((v) => v.employee.id === employeeId)
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Thăm người thân
          </CardTitle>
          <Button onClick={() => setIsFormModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm lượt thăm
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {visits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Chưa có lượt thăm người thân nào</p>
            </div>
          ) : (
            visits.map((visit) => (
              <div
                key={visit.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{visit.visitType}</h4>
                      <p className="text-sm text-gray-600">
                        {visit.visitPerson} ({visit.relationShip})
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={visit.status === 'Đã thăm' ? 'default' : 'secondary'}
                  >
                    {visit.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(visit.visitDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Gift className="h-4 w-4" />
                    <span className="font-medium">
                      {formatCurrency(visit.giftAmount)}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5" />
                    <span>{visit.reason}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedVisit(visit);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Xem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedVisit(visit);
                      setIsFormModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Sửa
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <FamilyVisitFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedVisit(null);
        }}
        visit={selectedVisit}
        employeeId={employeeId}
        onSuccess={() => {
          setIsFormModalOpen(false);
          setSelectedVisit(null);
          // Refresh data
          setVisits(mockFamilyVisits.filter((v) => v.employee.id === employeeId));
        }}
      />

      <FamilyVisitDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedVisit(null);
        }}
        visit={selectedVisit}
      />
    </>
  );
}
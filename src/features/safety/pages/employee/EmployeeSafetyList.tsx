import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import {
  Shield,
  Package,
  CheckCircle,
  Clock,
  History,
  Calendar,
  User,
  AlertCircle,
} from 'lucide-react';
import { ppeApi } from '../../api/safetyApi';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

export default function EmployeePPEPage() {
  const [myDistributions, setMyDistributions] = useState<any[]>([]);
  const [myPPEItems, setMyPPEItems] = useState<any[]>([]);
  const [distributionHistory, setDistributionHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [distributions, items, history] = await Promise.all([
        ppeApi.getMyDistributions(),
        ppeApi.getMyPPEItems(),
        ppeApi.getDistributionHistory(),
      ]);

      setMyDistributions(distributions || []);
      setMyPPEItems(items || []);
      setDistributionHistory(history || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      toast.error('Không thể tải thông tin bảo hộ lao động');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReceipt = async (distributionItemId: number) => {
    if (!window.confirm('Bạn xác nhận đã nhận được vật phẩm bảo hộ này?')) {
      return;
    }

    try {
      setIsProcessing(true);
      await ppeApi.confirmReceipt(distributionItemId);
      toast.success('Xác nhận nhận bảo hộ thành công');
      fetchAllData();
    } catch (error) {
      console.error('Lỗi khi xác nhận:', error);
      toast.error('Không thể xác nhận nhận bảo hộ');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getItemStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      DELIVERED: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Đã xác nhận', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Thống kê
  const totalItems = myPPEItems.length;
  const confirmedItems = myPPEItems.filter((item) => item.status === 'CONFIRMED').length;
  const pendingItems = myPPEItems.filter((item) => item.status === 'DELIVERED').length;
  const totalDistributions = distributionHistory.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Bảo hộ lao động của tôi
        </h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và xác nhận các vật phẩm bảo hộ lao động được cấp phát
        </p>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng vật phẩm</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã xác nhận</p>
              <p className="text-2xl font-bold">{confirmedItems}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chờ xác nhận</p>
              <p className="text-2xl font-bold">{pendingItems}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <History className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lần nhận</p>
              <p className="text-2xl font-bold">{totalDistributions}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Chờ xác nhận ({pendingItems})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Đã xác nhận ({confirmedItems})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Lịch sử nhận ({totalDistributions})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Chờ xác nhận */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Vật phẩm chờ xác nhận
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myDistributions.length > 0 ? (
                <div className="space-y-4">
                  {myDistributions.map((distribution) => {
                    const pendingItemsInDist = distribution.items?.filter(
                      (item: any) => item.status === 'DELIVERED'
                    );

                    if (!pendingItemsInDist || pendingItemsInDist.length === 0) return null;

                    return (
                      <div
                        key={distribution.id}
                        className="border rounded-lg p-4 bg-yellow-50"
                      >
                        <div className="flex items-center justify-between mb-4 pb-3 border-b">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Mã phân phối
                              </p>
                              <p className="font-semibold">#{distribution.id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Ngày phát
                              </p>
                              <p className="text-sm font-medium">
                                {formatDate(distribution.distributionDate)}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {pendingItemsInDist.length} vật phẩm chờ xác nhận
                          </Badge>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>STT</TableHead>
                              <TableHead>Tên vật phẩm</TableHead>
                              <TableHead>Kích cỡ</TableHead>
                              <TableHead className="text-center">Số lượng</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingItemsInDist.map((item: any, index: number) => (
                              <TableRow key={item.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">
                                  {item.ppeItemName}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {item.ppeItemSize}
                                </TableCell>
                                <TableCell className="text-center font-semibold">
                                  {item.quantity}
                                </TableCell>
                                <TableCell>{getItemStatusBadge(item.status)}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    onClick={() => handleConfirmReceipt(item.id)}
                                    disabled={isProcessing}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Xác nhận đã nhận
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Không có vật phẩm nào chờ xác nhận</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Đã xác nhận */}
        <TabsContent value="confirmed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Vật phẩm bảo hộ hiện có
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myPPEItems.filter((item) => item.status === 'CONFIRMED').length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Tên vật phẩm</TableHead>
                      <TableHead>Kích cỡ</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày xác nhận</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myPPEItems
                      .filter((item) => item.status === 'CONFIRMED')
                      .map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {item.ppeItemName}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.ppeItemSize}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {item.quantity}
                          </TableCell>
                          <TableCell>{getItemStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              {formatDate(item.confirmedAt)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Chưa có vật phẩm bảo hộ nào được xác nhận</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Lịch sử */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-purple-600" />
                Lịch sử nhận bảo hộ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {distributionHistory.length > 0 ? (
                <div className="space-y-4">
                  {distributionHistory.map((distribution) => (
                    <div
                      key={distribution.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="grid grid-cols-3 gap-4 mb-4 pb-3 border-b">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Mã phân phối
                          </p>
                          <p className="font-semibold">#{distribution.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Ngày phát
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(distribution.distributionDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Số vật phẩm
                          </p>
                          <Badge variant="outline">
                            {distribution.items?.length || 0} vật phẩm
                          </Badge>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên vật phẩm</TableHead>
                            <TableHead>Kích cỡ</TableHead>
                            <TableHead className="text-center">Số lượng</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày xác nhận</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {distribution.items?.map((item: any, index: number) => (
                            <TableRow key={item.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell className="font-medium">
                                {item.ppeItemName}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.ppeItemSize}
                              </TableCell>
                              <TableCell className="text-center font-semibold">
                                {item.quantity}
                              </TableCell>
                              <TableCell>{getItemStatusBadge(item.status)}</TableCell>
                              <TableCell>
                                {item.confirmedAt ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    {formatDate(item.confirmedAt)}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    Chưa xác nhận
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Chưa có lịch sử nhận bảo hộ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
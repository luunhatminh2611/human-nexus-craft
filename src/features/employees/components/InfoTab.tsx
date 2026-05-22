import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Edit,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button/Button2";
import { Badge } from "@/shared/components/ui/badge";
import EmployeeModal, { STATUS_MAP } from "./modal/EmployeeModal";
import FamilyModal from "./modal/FamilyModal";
import { useAuthStore } from "../hooks/useAuth";
import { transferApi } from "@/features/transfer/api/transferApi";
import { familyApi } from "../api/family";

export default function InfoTab({ userData: initialUserData, employeeId }) {
  const [userData, setUserData] = useState(initialUserData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoadingFamily, setIsLoadingFamily] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [familyModalMode, setFamilyModalMode] = useState("create");
  const { user } = useAuthStore();

  const MAX_FAMILY_MEMBERS = 2;

  const isAdmin = user?.roles === "ADMIN";
  const isManager = user?.roles === "MANAGER";
  const isEmployee = user?.roles === "EMPLOYEE";
  const canManageFamily = isManager || isEmployee;

  useEffect(() => {
    if (employeeId) {
      fetchTransferHistory();
      fetchFamilyMembers();
    }
  }, [employeeId]);

  const fetchTransferHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await transferApi.getByEmployeeId(employeeId);
      const historyData = response?.content?.[0] || [];
      setTransferHistory(historyData);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử điều động:", error);
      setTransferHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      setIsLoadingFamily(true);
      const response = await familyApi.getByEmployeeId(employeeId);
      setFamilyMembers(response || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thân nhân:", error);
      setFamilyMembers([]);
    } finally {
      setIsLoadingFamily(false);
    }
  };

  const handleOpenEditModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddFamily = () => {
    if (familyMembers.length >= MAX_FAMILY_MEMBERS) {
      alert("Chỉ được phép thêm tối đa 2 thân nhân");
      return;
    }
    setFamilyModalMode("create");
    setSelectedFamily(null);
    setIsFamilyModalOpen(true);
  };

  const handleEditFamily = (familyMember) => {
    setFamilyModalMode("edit");
    setSelectedFamily(familyMember);
    setIsFamilyModalOpen(true);
  };

  const handleCloseFamilyModal = () => {
    setIsFamilyModalOpen(false);
    setSelectedFamily(null);
  };

  const handleFamilySuccess = () => {
    fetchFamilyMembers();
  };

  const handleDeleteFamily = async (familyId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thông tin thân nhân này không?")) {
      return;
    }

    try {
      await familyApi.delete(familyId);
      alert("Xóa thân nhân thành công");
      fetchFamilyMembers();
    } catch (error) {
      console.error("Lỗi khi xóa thân nhân:", error);
      alert("Lỗi khi xóa thân nhân");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DA_TAO: { label: "Đã tạo", className: "bg-yellow-100 text-yellow-800" },
      TRUONG_PHONG_CHO_KY: {
        label: "Chờ trưởng phòng ký",
        className: "bg-yellow-100 text-yellow-800",
      },
      GIAM_DOC_CHO_KY: {
        label: "Chờ giám đốc ký",
        className: "bg-blue-100 text-blue-800",
      },
      CHO_TIEP_NHAN: {
        label: "Chờ tiếp nhận",
        className: "bg-purple-100 text-purple-800",
      },
      REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-800" },
      SUCCEEDED: {
        label: "Hoàn thành",
        className: "bg-green-100 text-green-800",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getRelationshipBadge = (relationship) => {
    const relationshipColors = {
      Cha: "bg-blue-100 text-blue-800",
      Mẹ: "bg-pink-100 text-pink-800",
      Vợ: "bg-purple-100 text-purple-800",
      Chồng: "bg-purple-100 text-purple-800",
      Con: "bg-green-100 text-green-800",
      Anh: "bg-orange-100 text-orange-800",
      Chị: "bg-orange-100 text-orange-800",
      Em: "bg-orange-100 text-orange-800",
    };

    const className =
      relationshipColors[relationship] || "bg-gray-100 text-gray-800";

    return <Badge className={className}>{relationship}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Thông tin nhân sự */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Thông tin nhân sự</CardTitle>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={handleOpenEditModal}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-lg mb-4 text-blue-600 uppercase">
            Thông tin chung
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Tập đoàn/Công ty
              </Label>
              <Input
                value={userData.companyName || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Phòng ban quản lý
              </Label>
              <Input
                value={userData.departmentName || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Phòng chuyên môn
              </Label>
              <Input
                value={""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Số hiệu cán bộ
              </Label>
              <Input
                value={userData.code || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Họ và tên
              </Label>
              <Input
                value={userData.name || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Giới tính
              </Label>
              <Input
                value={userData.gender || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Tên gọi khác
              </Label>
              <Input
                value={userData.otherName || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Ngày sinh
              </Label>
              <Input
                type="date"
                value={userData.birthday || ""}
                disabled
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Nơi sinh
              </Label>
              <Input
                value={userData.birthPlace || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Trạng thái hồ sơ
              </Label>
              <Input
                value={
                  STATUS_MAP[userData.status]
                    ? STATUS_MAP[userData.status]
                    : userData.status
                }
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Mã danh bạ
              </Label>
              <Input
                value={""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Cấp ủy hiện tại
              </Label>
              <Input
                value={userData.partyCommitteeName || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Cấp ủy kiêm
              </Label>
              <Input
                value={userData.subPartyCommitteeName || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Chức vụ
              </Label>
              <Input
                value={userData.positionName || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Phụ cấp chức vụ
              </Label>
              <Input
                value={userData.positionAllowance || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Mã số thuế
              </Label>
              <Input
                value={userData.taxCode || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Chức vụ kiêm nhiệm
              </Label>
              <Input
                value={userData.subPositionName || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Chức danh
              </Label>
              <Input
                value={""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">
                Nơi ở hiện nay
              </Label>
              <Input
                value={userData.contactAddress || ""}
                disabled
                placeholder="Chưa cập nhật"
                className="mt-2"
              />
            </div>
          </div>

          {/* Thường trú */}
          <div className="mt-6">
            <h3 className="font-bold text-sm mb-4">Thường trú</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Tỉnh/Thành phố
                </Label>
                <Input
                  value={userData.nativePlace || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Xã/Phường
                </Label>
                <Input
                  value={userData.wardName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Nơi đăng ký thường trú
                </Label>
                <Input
                  value={userData.permanentAddress || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Quê quán */}
          <div className="mt-6">
            <h3 className="font-bold text-sm mb-4">Quê quán</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Tỉnh/Thành phố
                </Label>
                <Input
                  value={userData.nativePlace || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Xã/Phường
                </Label>
                <Input
                  value={userData.wardName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Nơi ở hiện nay
                </Label>
                <Input
                  value={userData.contactAddress || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Thông tin khác */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4 text-blue-600 uppercase">Thông tin khác</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Dân tộc
                </Label>
                <Input
                  value={userData.ethnicity || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Tôn giáo
                </Label>
                <Input
                  value={userData.religion || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Quốc tịch
                </Label>
                <Input
                  value={userData.nationalityName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Thành phần gia đình xuất thân
                </Label>
                <Input
                  value={""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Số điện thoại
                </Label>
                <Input
                  value={userData.phone || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Email
                </Label>
                <Input
                  value={userData.email || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Ngày tham gia cách mạng
                </Label>
                <Input
                  type="date"
                  value={userData.youthUnionJoinDate || ""}
                  disabled
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Ngày vào Đảng cộng sản
                </Label>
                <Input
                  type="date"
                  value={userData.partyJoinDate || ""}
                  disabled
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Ngày chính thức kết nạp Đảng
                </Label>
                <Input
                  type="date"
                  value={userData.partyOfficialDate || ""}
                  disabled
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Ngày nhập ngũ
                </Label>
                <Input
                  type="date"
                  value={userData.militaryJoinDate || ""}
                  disabled
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Ngày xuất ngũ
                </Label>
                <Input
                  type="date"
                  value={userData.militaryEndDate || ""}
                  disabled
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Quân hàm, chức vụ cao nhất
                </Label>
                <Input
                  value={userData.militaryRankName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Danh hiệu được phong
                </Label>
                <Input
                  value={userData.title || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Thương binh hạng
                </Label>
                <Input
                  value={userData.injuryRank || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Gia đình liệt sĩ
                </Label>
                <Input
                  value={userData.isWoundedSoldier ? "Có" : "Không"}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Tình trạng sức khỏe
                </Label>
                <Input
                  value={userData.healthStatus || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Chiều cao (cm)
                </Label>
                <Input
                  value={userData.height || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Cân nặng (kg)
                </Label>
                <Input
                  value={userData.weight || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Nhóm máu
                </Label>
                <Input
                  value={userData.bloodType || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  CCCD/CC
                </Label>
                <Input
                  value={userData.cccdNumber || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Ngày cấp
                </Label>
                <Input
                  type="date"
                  value={userData.cccdDate || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Nơi cấp
                </Label>
                <Input
                  value={userData.cccdPlace || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Nguồn thu nhập */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4 text-blue-600 uppercase">Nguồn thu nhập</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Nguồn thu nhập chính của gia đình hằng năm (vnd)
                </Label>
                <Input
                  value={userData?.familyIncome || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Các nguồn thu nhập khác
                </Label>
                <Input
                  value={userData?.otherIncome || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Được cấp, được thuê, loại nhà
                </Label>
                <Input
                  value={userData?.housingType || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Tổng diện tích sử dụng (m2)
                </Label>
                <Input
                  value={userData?.housingArea || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Nhà tự mua, tự xây, loại nhà
                </Label>
                <Input
                  value={userData?.selfHousingType || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Tổng diện tích sử dụng (m2)
                </Label>
                <Input
                  value={userData?.usableArea || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Đất được cấp (m2)
                </Label>
                <Input
                  value={userData?.grantedLandArea || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Đất tự mua (m2)
                </Label>
                <Input
                  value={userData?.purchasedLandArea || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Các loại đất khác
                </Label>
                <Input
                  value={userData?.otherLand || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4 text-blue-600 uppercase">Thông tin ngân hàng</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Số tài khoản
                </Label>
                <Input
                  value={userData?.bankAccountNumber || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Tên ngân hàng
                </Label>
                <Input
                  value={userData?.bankName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Chủ tài khoản
                </Label>
                <Input
                  value={userData?.bankAccountHolder || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Chi nhánh
                </Label>
                <Input
                  value={userData?.bankBranch || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4 text-blue-600 uppercase">Tuyển dụng</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Nghề nghiệp trước khi tuyển dụng
                </Label>
                <Input
                  value={userData?.previousJob || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Ngày tuyển dụng
                </Label>
                <Input
                  type="date"
                  value={userData?.recruitmentDate || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Ngày vào cơ quan
                </Label>
                <Input
                  type="date"
                  value={userData?.startDate || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Cơ quan tuyển dụng
                </Label>
                <Input
                  value={userData?.organizationId || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Địa chỉ cơ quan
                </Label>
                <Input
                  value={userData?.organizationAddress || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Loại hợp đồng lao động
                </Label>
                <Input
                  value={userData?.laborContractTypeName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
          {/* VII. Thông tin Đảng, Đoàn, Quân đội */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4 text-blue-600 uppercase">Tổ chức chính trị xã hội</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Ngày tham gia
                </Label>
                <Input
                  value={""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Tổ chức chính trị xã hội
                </Label>
                <Input
                  value={""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4 text-blue-600 uppercase">Trình độ chuyên môn</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Trình độ giáo dục phổ thông
                </Label>
                <Input
                  value={userData?.culturalLevelName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Học hàm học vị cao nhất
                </Label>
                <Input
                  value={""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Lý luận chính trị
                </Label>
                <Input
                  value={userData?.politicalTheoryName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Ngoại ngữ
                </Label>
                <Input
                  value={userData.foreignLanguageName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Trình độ ngoại ngữ
                </Label>
                <Input
                  value={userData.languageLevelName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Chuyên môn chính
                </Label>
                {/* Chưa có */}
                <Input
                  value={""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Trình độ chuyên môn
                </Label>
                <Input
                  value={userData.professionalLevelName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Công việc chính đang làm
                </Label>
                <Input
                  value={userData.currentJobDetail || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Sở trường công tác
                </Label>
                <Input
                  value={userData.workStrength || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Công việc làm lâu nhất
                </Label>
                <Input
                  value={userData.longestJob || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4 text-blue-600 uppercase">
              Thông tin lương
            </h3>
            <h3 className="font-bold text-sm mb-4">
              Thông tin lương tại đơn vị
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Bảng lương
                </Label>
                <Input
                  value={userData.payrollName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Bậc lương
                </Label>
                <Input
                  value={userData.salaryScaleName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Thang bảng lương
                </Label>
                {/* Chưa có */}
                <Input
                  value={""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Hệ số lương
                </Label>
                <Input
                  value={userData.salaryCoefficient || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Mức lương
                </Label>
                <Input
                  value={userData.salaryAmount || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Thời gian áp dụng
                </Label>
                <Input
                  type="date"
                  value={userData.effectiveDate || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
            <h3 className="font-bold text-sm mb-4 mt-4">
              Thông tin lương đóng bảo hiểm xã hội
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Bảng lương
                </Label>
                <Input
                  value={userData.payrollName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Bậc lương
                </Label>
                <Input
                  value={userData.salaryScaleName || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Thang bảng lương
                </Label>
                {/* Chưa có */}
                <Input
                  value={""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Hệ số lương
                </Label>
                <Input
                  value={userData.salaryCoefficient || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Mức lương đóng BHXH
                </Label>
                <Input
                  value={userData.insuranceSalaryBase || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Nơi đóng BHXH
                </Label>
                <Input
                  value={userData.insurancePlace || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Mã số BHXH
                </Label>
                <Input
                  value={userData.insuranceBookNumber || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Lương NS tài chín công đoàn
                </Label>
                <Input
                  value={userData.insuranceUnionSalary || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Chức danh đóng BHXH
                </Label>
                <Input
                  value={userData.insurancePositionId || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
          {/* Đặc điểm lịch sử bản thân */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4 text-blue-600 uppercase">
              Đăc điểm lịch sử bản thân
            </h3>
            <div className="grid md:grid-cols gap-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Khai rõ: Bị bắt, bị tù, đã khai báo cho ai, những vấn đề gì? 
                </Label>
                <Input
                  value={userData.legalHistory || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Bản thân có làm việc trong chế độ cũ?
                </Label>
                <Input
                  value={userData.workedInOldRegime || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Tham gia hoặc có quan hệ với các tổ chức chính trị, kinh tế, xã hội nào ở nước ngoài (làm gì, tổ chức nào, đặt trụ sở ở đâu,...?)
                </Label>
                <Input
                  value={userData.foreignOrganizationRelation || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Có thân nhân ở nước ngoài (làm gì, địa chỉ)?
                </Label>
                <Input
                  value={userData.relativesAbroad || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1">
                  Ngày vào đoàn
                </Label>
                <Input
                  type="date"
                  value={userData.youthUnionJoinDate || ""}
                  disabled
                  placeholder="Chưa cập nhật"
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="mt-4">
                <Label className="text-sm text-muted-foreground mb-1">
                  Ghi chú
                </Label>
                <Textarea
                  value={userData.note || ""}
                  disabled
                  rows={4}
                  className="resize-none"
                />
              </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <EmployeeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          employeeId={employeeId}
          mode="edit"
        />
      )}

      {/* Family Modal */}
      <FamilyModal
        isOpen={isFamilyModalOpen}
        onClose={handleCloseFamilyModal}
        employeeId={employeeId}
        familyData={selectedFamily}
        mode={familyModalMode}
        onSuccess={handleFamilySuccess}
      />
    </div>
  );
}

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AddFamilyForm({ employeeId }) {
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    occupation: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.relationship) {
      alert("Vui lòng nhập đủ họ tên và mối quan hệ!");
      return;
    }
    const newMember = { id: crypto.randomUUID(), employeeId, ...formData };
    // Trong thực tế bạn sẽ gọi API POST, ở đây ta chỉ console để demo
    console.log("Thêm thân nhân:", newMember);
    alert(`Đã thêm thân nhân: ${formData.name}`);
    setFormData({
      name: "",
      relationship: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      occupation: "",
    });
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold text-lg">Thêm thân nhân mới</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Họ tên</Label>
          <Input name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div>
          <Label>Mối quan hệ</Label>
          <Input name="relationship" value={formData.relationship} onChange={handleChange} />
        </div>
        <div>
          <Label>Số điện thoại</Label>
          <Input name="phone" value={formData.phone} onChange={handleChange} />
        </div>
        <div>
          <Label>Ngày sinh</Label>
          <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <Label>Địa chỉ</Label>
          <Input name="address" value={formData.address} onChange={handleChange} />
        </div>
        <div>
          <Label>Nghề nghiệp</Label>
          <Input name="occupation" value={formData.occupation} onChange={handleChange} />
        </div>
      </div>
      <Button onClick={handleAdd}>Thêm thân nhân</Button>
    </div>
  );
}

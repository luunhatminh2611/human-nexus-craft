import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, X, PackagePlus, Share2 } from "lucide-react";
import mockData from "@/mock/data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";

function SafetyItemModal({ isOpen, onClose, onSave, editingItem }) {
    const [formData, setFormData] = useState(
        editingItem || {
            id: "",
            name: "",
            replacementCycleDays: "",
            defaultExpireDays: "",
            description: "",
            quantity: 0,
        }
    );

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.replacementCycleDays || !formData.defaultExpireDays) {
            alert("Vui lòng nhập đầy đủ thông tin.");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-lg p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-semibold mb-4">
                    {editingItem ? "Chỉnh sửa vật tư" : "Thêm vật tư mới"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Tên vật tư</label>
                        <Input
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Nhập tên vật tư..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium">Chu kỳ thay mới (ngày)</label>
                            <Input
                                type="number"
                                value={formData.replacementCycleDays}
                                onChange={(e) =>
                                    setFormData({ ...formData, replacementCycleDays: e.target.value })
                                }
                                placeholder="VD: 180"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium">Hạn sử dụng mặc định (ngày)</label>
                            <Input
                                type="number"
                                value={formData.defaultExpireDays}
                                onChange={(e) =>
                                    setFormData({ ...formData, defaultExpireDays: e.target.value })
                                }
                                placeholder="VD: 365"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Số lượng hiện có</label>
                        <Input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) =>
                                setFormData({ ...formData, quantity: Number(e.target.value) })
                            }
                            placeholder="VD: 100"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Mô tả</label>
                        <Input
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Mô tả chi tiết..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="submit">{editingItem ? "Lưu thay đổi" : "Thêm mới"}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Modal nhập kho
function AddQuantityModal({ isOpen, onClose, onConfirm }) {
    const [amount, setAmount] = useState(0);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-sm p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold mb-3">Nhập thêm số lượng</h2>
                <Input
                    type="number"
                    placeholder="Nhập số lượng cần thêm..."
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button onClick={() => { onConfirm(amount); onClose(); }}>Xác nhận</Button>
                </div>
            </div>
        </div>
    );
}

// Modal phân phát vật tư
function DistributeModal({ isOpen, onClose, onConfirm, departments }) {
    const [deptId, setDeptId] = useState("");
    const [quantity, setQuantity] = useState(0);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-sm p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold mb-3">Phân phát vật tư</h2>

                <Select value={deptId} onValueChange={setDeptId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                        {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Input
                    className="mt-3"
                    type="number"
                    placeholder="Nhập số lượng phân phát..."
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button
                        onClick={() => {
                            onConfirm({ deptId, quantity });
                            onClose();
                        }}
                        disabled={!deptId || quantity <= 0}
                    >
                        Xác nhận
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function SafetyItems() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [items, setItems] = useState(mockData.safetyItems || []);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [addQtyModal, setAddQtyModal] = useState({ open: false, item: null });
    const [distModal, setDistModal] = useState({ open: false, item: null });

    const departments = mockData.departments || [];

    const filteredItems = useMemo(() => {
        return items.filter(
            (item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    const handleAdd = () => {
        setEditingItem(null);
        setModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setModalOpen(true);
    };

    const handleSave = (data) => {
        if (editingItem) {
            setItems((prev) =>
                prev.map((i) => (i.id === editingItem.id ? { ...i, ...data } : i))
            );
        } else {
            const newItem = {
                ...data,
                id: `s${Math.random().toString(36).slice(2, 7)}`,
                quantity: data.quantity || 0,
            };
            setItems((prev) => [...prev, newItem]);
        }
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm("Bạn có chắc muốn xóa vật tư này không?")) {
            setItems((prev) => prev.filter((i) => i.id !== id));
        }
    };

    const handleAddQuantity = (item, amount) => {
        setItems((prev) =>
            prev.map((i) =>
                i.id === item.id ? { ...i, quantity: (i.quantityInStock || 0) + amount } : i
            )
        );
    };

    const handleDistribute = (item, { deptId, quantity }) => {
        setItems((prev) =>
            prev.map((i) =>
                i.id === item.id
                    ? { ...i, quantity: Math.max((i.quantityInStock || 0) - quantity, 0) }
                    : i
            )
        );
        const deptName = departments.find((d) => d.id === deptId)?.name;
        alert(`Đã phân phát ${quantity} ${item.name} cho phòng ${deptName}`);
    };

    return (
        <Layout>
            <div className="space-y-6">
                <Tabs defaultValue="items" className="w-full">
                    <TabsList className="flex gap-2 bg-muted p-2 rounded-lg">
                        <TabsTrigger
                            value="dashboard"
                            className="flex-1"
                            onClick={() => navigate("/admin/safety-dashboard")}
                        >
                            Thống kê cấp phát
                        </TabsTrigger>
                        <TabsTrigger value="items" className="flex-1">
                            Kho BHLĐ
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Danh sách đồ bảo hộ</h1>
                        <p className="text-muted-foreground">
                            Quản lý danh mục vật tư bảo hộ lao động
                        </p>
                    </div>
                    <Button className="gap-2" onClick={handleAdd}>
                        <Plus className="h-4 w-4" />
                        Thêm vật tư
                    </Button>
                </div>

                {/* Tìm kiếm */}
                <Card className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </Card>

                {/* Bảng danh sách */}
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên vật tư</TableHead>
                                <TableHead>Chu kỳ thay mới</TableHead>
                                <TableHead>Hạn sử dụng</TableHead>
                                <TableHead>Số lượng tồn</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredItems.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.replacementCycleDays}</TableCell>
                                    <TableCell>{item.defaultExpireDays}</TableCell>
                                    <TableCell>{item.quantityInStock || 0}</TableCell>
                                    <TableCell className="max-w-sm truncate">
                                        {item.description || "-"}
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="sm" onClick={() => setAddQtyModal({ open: true, item })}>
                                            <PackagePlus className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setDistModal({ open: true, item })}>
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {filteredItems.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                        Không tìm thấy vật tư phù hợp.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>

                <div className="text-sm text-muted-foreground">
                    Hiển thị {filteredItems.length} / {items.length} vật tư
                </div>
            </div>

            {/* Các modal */}
            <SafetyItemModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editingItem={editingItem}
            />

            <AddQuantityModal
                isOpen={addQtyModal.open}
                onClose={() => setAddQtyModal({ open: false, item: null })}
                onConfirm={(amount) => handleAddQuantity(addQtyModal.item, amount)}
            />

            <DistributeModal
                isOpen={distModal.open}
                onClose={() => setDistModal({ open: false, item: null })}
                onConfirm={(info) => handleDistribute(distModal.item, info)}
                departments={departments}
            />
        </Layout>
    );
}

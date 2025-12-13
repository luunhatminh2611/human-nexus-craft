import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import authService from '@/features/auth/api/authApi';
import { userApi } from '@/features/employees/api/userApi';

interface UserAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number | null;
    mode: 'create' | 'edit';
}

export default function UserAccountModal({
    isOpen,
    onClose,
    userId,
    mode,
}: UserAccountModalProps) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        employeeCode: '',
    });

    useEffect(() => {
        const loadUserData = async () => {
            if (isOpen && mode === 'edit' && userId) {
                try {
                    setLoading(true);
                    const userData = await userApi.getById(userId);
                    setFormData({
                        username: userData.username || '',
                        password: '',
                        fullName: userData.fullName || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        employeeCode: userData.employeeCode || '',
                    });
                } catch (err) {
                    console.error('Error loading user:', err);
                    setError('Không thể tải thông tin tài khoản');
                } finally {
                    setLoading(false);
                }
            } else if (isOpen && mode === 'create') {
                // Reset form cho chế độ tạo mới
                setFormData({
                    username: '',
                    password: '',
                    fullName: '',
                    email: '',
                    phone: '',
                    employeeCode: '',
                });
            }
            setError('');
            setSuccess('');
        };

        loadUserData();
    }, [isOpen, mode, userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const handleRoleChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            role: value,
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setError('Vui lòng nhập tên đăng nhập');
            return false;
        }
        if (mode === 'create' && !formData.password) {
            setError('Vui lòng nhập mật khẩu');
            return false;
        }
        if (mode === 'create' && formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }
        if (!formData.fullName.trim()) {
            setError('Vui lòng nhập họ tên');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Vui lòng nhập email');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Email không hợp lệ');
            return false;
        }
        if (!formData.phone.trim()) {
            setError('Vui lòng nhập số điện thoại');
            return false;
        }
        if (!formData.employeeCode.trim()) {
            setError('Vui lòng nhập mã nhân viên');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (mode === 'create') {
                // Gọi API tạo tài khoản
                await authService.register({
                    username: formData.username,
                    password: formData.password,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    employeeCode: formData.employeeCode,
                });
                setSuccess('Tạo tài khoản thành công!');
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 1500);
            } else {
                // // Gọi API cập nhật tài khoản
                // await userApi.update(userId, {
                //   fullName: formData.fullName,
                //   email: formData.email,
                //   phone: formData.phone,
                //   role: formData.role,
                //   ...(formData.password && { password: formData.password }),
                // });
                setSuccess('Cập nhật tài khoản thành công!');
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 1500);
            }
        } catch (err: any) {
            console.error('Error:', err);
            const errorMessage = err.response?.data?.message ||
                err.message ||
                'Có lỗi xảy ra. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Tạo tài khoản mới' : 'Cập nhật tài khoản'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Tạo tài khoản đăng nhập mới cho hệ thống'
                            : 'Chỉnh sửa thông tin tài khoản người dùng'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="bg-green-50 text-green-900 border-green-200">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    {/* Row 1: Username & Password */}
                    <div className={mode === 'create' ? 'grid grid-cols-2 gap-4' : ''}>
                        <div className="space-y-2">
                            <Label htmlFor="username">
                                Tên đăng nhập <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Nhập tên đăng nhập"
                                disabled={mode === 'edit' || loading}
                            />
                        </div>

                        {mode === 'create' && (
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Nhập mật khẩu (≥6 ký tự)"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Row 2: Full Name (spans 2 columns) */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName">
                            Họ và tên <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên"
                            disabled={loading}
                        />
                    </div>

                    {/* Row 3: Email & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Nhập email"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                Số điện thoại <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Row 4: Employee Code & Role */}
                    {mode === 'create' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="employeeCode">
                                    Mã nhân viên <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="employeeCode"
                                    name="employeeCode"
                                    value={formData.employeeCode}
                                    onChange={handleChange}
                                    placeholder="Nhập mã nhân viên"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Tạo tài khoản' : 'Cập nhật'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
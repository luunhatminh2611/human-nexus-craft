import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, UserCog } from 'lucide-react';
import mockData from '@/mock/data';

export default function Login() {
  const navigate = useNavigate();
  const { setRole } = useAuthStore();

  const roles: { value: UserRole; label: string; icon: typeof Shield; description: string; empId?: string }[] = [
    {
      value: 'Admin',
      label: 'Quản trị viên',
      icon: Shield,
      description: 'Toàn quyền quản lý hệ thống',
      empId: 'emp001',
    },
    {
      value: 'Manager',
      label: 'Quản lý',
      icon: UserCog,
      description: 'Quản lý team và phòng ban',
      empId: 'emp002',
    },
    {
      value: 'Employee',
      label: 'Nhân viên',
      icon: Users,
      description: 'Xem và chỉnh sửa hồ sơ cá nhân',
      empId: 'emp005',
    },
  ];

  const handleRoleSelect = (role: UserRole, empId?: string) => {
    setRole(role, empId);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Hệ thống quản lý nhân sự</h1>
          <p className="text-muted-foreground">Chọn vai trò để đăng nhập (Chế độ Demo)</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.value}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 hover:border-primary"
                onClick={() => handleRoleSelect(role.value, role.empId)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{role.label}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="default">
                    Đăng nhập
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Đây là môi trường demo - không yêu cầu mật khẩu</p>
        </div>
      </div>
    </div>
  );
}

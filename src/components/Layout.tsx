import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  FileText,
  LogOut,
  User,
  Network,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    if (role === 'Employee') {
      return [
        { label: 'Hồ sơ', icon: User, path: '/employee/profile' },
        { label: 'Lương & Phúc lợi', icon: DollarSign, path: '/employee/payroll' },
        { label: 'Đào tạo', icon: BookOpen, path: '/employee/learning' },
        { label: 'Đánh giá', icon: FileText, path: '/employee/performance' },
      ];
    } else if (role === 'Manager') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/manager/dashboard' },
        { label: 'Team', icon: Users, path: '/manager/employees' },
        { label: 'Sơ đồ tổ chức', icon: Network, path: '/manager/org-chart' },
        { label: 'Đào tạo', icon: BookOpen, path: '/manager/training' },
        { label: 'Hồ sơ', icon: User, path: '/manager/profile' },
      ];
    }
    
    return [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { label: 'Nhân viên', icon: Users, path: '/admin/employees' },
      { label: 'Sơ đồ tổ chức', icon: Network, path: '/admin/org-chart' },
      { label: 'Đào tạo', icon: BookOpen, path: '/admin/training' },
      { label: 'Lương', icon: DollarSign, path: '/admin/salary' },
      { label: 'Hồ sơ', icon: User, path: '/admin/profile' },
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-primary">HRM System</h1>
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-semibold text-primary">{role}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  if (role === 'Employee') navigate('/employee/profile');
                  else if (role === 'Manager') navigate('/manager/profile');
                  else navigate('/admin/profile');
                }}>
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">{children}</main>
    </div>
  );
}

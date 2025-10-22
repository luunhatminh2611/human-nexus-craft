import { ReactNode, useState } from 'react';
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
  Menu,
  PanelLeftClose,
  Box,
  BoxIcon
} from 'lucide-react';
import clsx from 'clsx';
import logo from '@/assets/download.jpg';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { role, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        { label: 'BHLĐ được cấp', icon: BoxIcon, path: '/employee/safety' },
      ];
    } else if (role === 'Manager') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/manager/dashboard' },
        { label: 'Team', icon: Users, path: '/manager/employees' },
        { label: 'Sơ đồ tổ chức', icon: Network, path: '/manager/org-chart' },
        { label: 'Đào tạo', icon: BookOpen, path: '/manager/training' },
        { label: 'Hồ sơ', icon: User, path: '/manager/profile' },
        { label: 'Phân phát BHLĐ', icon: BoxIcon, path: '/manager/safety-items' },

      ];
    }
    return [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { label: 'Nhân viên', icon: Users, path: '/admin/employees' },
      { label: 'Sơ đồ tổ chức', icon: Network, path: '/admin/org-chart' },
      { label: 'Đào tạo', icon: BookOpen, path: '/admin/training' },
      { label: 'Lương', icon: DollarSign, path: '/admin/salary' },
      { label: 'Hồ sơ', icon: User, path: '/admin/profile' },
      { label: 'Quản lý BHLĐ', icon: BoxIcon, path: '/admin/safety-dashboard' },
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={clsx(
          'bg-card border-r transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center h-16 px-3 border-b">
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
          />
          {sidebarOpen && (
            <span className="ml-3 text-lg font-bold text-primary whitespace-nowrap">
              HRM System
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={clsx(
                  'w-full justify-start gap-3 text-left px-3',
                  !sidebarOpen && 'justify-center px-0'
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-card/80 backdrop-blur flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <PanelLeftClose /> : <Menu />}
          </Button>

          <h1 className="text-2xl font-bold text-primary">
            CÔNG TY CỔ PHẦN CÔNG NGHỆ A
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Xin chào, <span className="font-medium text-primary">{role}</span>
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (role === 'Employee') navigate('/employee/profile');
                    else if (role === 'Manager') navigate('/manager/profile');
                    else navigate('/admin/profile');
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

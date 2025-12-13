import { memo, useEffect, useState } from 'react';
import {
  LogOut,
  User,
  Menu,
  PanelLeftClose,
  Phone,
  Mail,
} from 'lucide-react';
import type { HeaderProps } from './types';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import authService from '@/features/auth/api/authApi';
import logoHeader from '@/assets/icons/log_ct_001.png';
import { Button } from '../ui/button/Button2';

export const Header = memo(({ sidebarOpen, role, onToggleSidebar, onNavigate, onLogout }: HeaderProps) => {

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [usersDetail, setUsersDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuthStore();
  const handleLogout = async () => {
    const result = await logout();
    window.location.href = "/";
  };

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const data = await authService.getUserDetail();

      setUsersDetail(data);

    } catch (error) {
      ({
        title: "Lỗi tải người dùng",
        description: "Không thể tải người dùng.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, []);

  return (
    <header className="h-auto border-b bg-[#1a8649] backdrop-blur flex items-center justify-between px-6">
      <Button
        variant="ghost"
        onClick={onToggleSidebar}
        className='text-white'
      >
        {sidebarOpen ? <PanelLeftClose /> : <Menu />}
      </Button>

      <div className="flex items-center gap-3 text-primary-foreground py-4">
        <img src={logoHeader} alt="Logo" className="w-14 h-14 sm:w-20 sm:h-20" />
        <span className="flex flex-col gap-1 text-white">
          <div className="text-base sm:text-2xl font-bold text-center">
            PHẦN MỀM QUẢN LÝ NHÂN SỰ
          </div>
          <div className="text-base sm:text-xs font-bold text-center">
            CÔNG TY THAN UÔNG BÍ - TKV
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end sm:justify-center gap-2 sm:gap-4 text-white text-sm sm:text-xs sm:text-center font-medium">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-white" />
              <span>Hotline: 02033.854491</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-white" />
              <span>Email: ctythanub@gmail.com</span>
            </div>
          </div>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-white">
          Xin chào, <span className="font-medium text-white">{usersDetail?.fullName}</span>
        </span>

        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setIsAccountOpen((v) => !v)}
            className="dropdown-toggle text-white"
          >
            <User className="h-7 w-7" />
          </Button>

          <Dropdown isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} className="w-48">
            <div className="px-3 py-2 text-sm font-bold text-muted-foreground">Tài khoản</div>
            <div className="border-t border-gray-200 dark:border-gray-800" />
            <DropdownItem
              onClick={() => {
                setIsAccountOpen(false);
                if (role === 'EMPLOYEE') onNavigate(`/employee/profile`);
                else if (role === 'MANAGER') onNavigate(`/employee/profile`);
                else onNavigate(`/admin/profile/${user?.userId}`);
              }}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <User className="mr-2 h-4 w-4" />
              Hồ sơ cá nhân
            </DropdownItem>
            <DropdownItem
              onClick={handleLogout}
              className="text-destructive flex items-center gap-2"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

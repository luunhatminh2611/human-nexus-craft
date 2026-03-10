import { memo, useEffect, useState, useRef } from 'react';
import {
  LogOut,
  User,
  ChevronDown,
  Phone,
  Mail,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import type { HeaderProps } from './types';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import authService from '@/features/auth/api/authApi';
import logoHeader from '@/assets/icons/log_ct_001.png';
import { Button } from '../ui/button/Button2';

interface HeaderWithNavProps extends HeaderProps {
  navigationItems: any[];
}

export const Header = memo(({
  role,
  navigationItems = [],
  onNavigate,
  onLogout
}: HeaderWithNavProps) => {
  const location = useLocation();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [usersDetail, setUsersDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuthStore();

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      console.error("Lỗi tải người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, []);

  // Hàm check active cho main menu item
  const isMainItemActive = (item: any) => {
    // Nếu có submenu, check xem có submenu nào active không
    if (item.submenu && item.submenu.length > 0) {
      return item.submenu.some((subItem: any) =>
        subItem.path && location.pathname === subItem.path
      );
    }
    // Nếu không có submenu, check path trực tiếp
    if (item.path === '/') return location.pathname === '/';
    return item.path && location.pathname === item.path;
  };

  // Hàm check active cho submenu item
  const isSubmenuActive = (path: string) => {
    return location.pathname === path;
  };

  const handleMainItemClick = (item: any) => {
    if (item.submenu && item.submenu.length > 0) {
      setOpenDropdown(openDropdown === item.label ? null : item.label);
    } else if (item.path) {
      onNavigate(item.path);
      setOpenDropdown(null);
    }
  };

  const handleSubmenuClick = (submenuItem: any) => {
    if (submenuItem.path) {
      onNavigate(submenuItem.path);
    }
    setOpenDropdown(null);
  };

  return (
    <header className="bg-[#1a8649] border-b">
      {/* Top bar with logo and contact info */}
      <div className="flex items-center justify-center px-6 py-3 border-b border-green-600">
        {/* Logo and company name */}
        <div className="flex items-center gap-3 text-white">
          <img src={logoHeader} alt="Logo" className="w-14 h-14" />
          <div className="flex flex-col justify-center items-center gap-1">
            <span className="text-2xl font-bold">PHẦN MỀM QUẢN LÝ NHÂN SỰ</span>
            <span className="text-base font-bold">CÔNG TY THAN UÔNG BÍ - TKV</span>
            <div className="flex items-center gap-6 text-white text-base font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Hotline: 02033.854491</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Email: ctythanub@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav ref={navRef} className="flex items-center px-6 py-2 gap-1">
        {navigationItems.map((item) => {
          const active = isMainItemActive(item);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isDropdownOpen = openDropdown === item.label;

          return (
            <div key={item.label} className="relative">
              <button
                onClick={() => handleMainItemClick(item)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium',
                  active
                    ? 'bg-white text-green-600'
                    : 'text-white hover:bg-green-600'
                )}
              >
                <span>{item.label}</span>
                {hasSubmenu && (
                  <ChevronDown
                    className={clsx(
                      'h-4 w-4 transition-transform',
                      isDropdownOpen && 'rotate-180'
                    )}
                  />
                )}
              </button>

              {/* Submenu dropdown */}
              {hasSubmenu && isDropdownOpen && (
                <div className="absolute left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 min-w-[200px] z-50">
                  {item.submenu.map((subItem: any) => {
                    const SubIcon = subItem.icon;
                    const subActive = isSubmenuActive(subItem.path);

                    return (
                      <button
                        key={subItem.label}
                        onClick={() => handleSubmenuClick(subItem)}
                        className={clsx(
                          'w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors text-left',
                          subActive
                            ? 'bg-green-100 text-green-600 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                      >
                        <SubIcon className="h-4 w-4" />
                        <span>{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <div className="ml-auto flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setIsAccountOpen((v) => !v)}
            className="text-white"
          >
            <User className="h-6 w-6" />
          </Button>

          <Dropdown
            isOpen={isAccountOpen}
            onClose={() => setIsAccountOpen(false)}
            className="w-48"
          >
            <div className="px-3 py-2 text-sm font-bold text-muted-foreground">
              Tài khoản
            </div>
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
      </nav>
    </header>
  );
});

Header.displayName = 'Header';
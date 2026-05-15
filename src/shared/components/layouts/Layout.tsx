import { useNavigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { getNavigationItems } from './navigation';
import React from 'react';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

export function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = React.useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleNavigate = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleToggleSidebar = React.useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const navigationItems = getNavigationItems(user?.roles);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      {/* <Sidebar
        sidebarOpen={sidebarOpen}
        navigationItems={navigationItems}
        onNavigate={handleNavigate}
      /> */}
      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Header */}
        <Header
          role={user?.roles}
          navigationItems={navigationItems}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { memo } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import logo from '@/assets/images/download.png';
import type { SidebarProps } from './types';
import { Button } from '@/shared/components/ui/button/Button2';

export const Sidebar = memo(({ sidebarOpen, navigationItems, onNavigate }: SidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    // Exact match for root paths
    if (path === '/') {
      return location.pathname === '/';
    }

    // For other paths, check if current path starts with the item path
    // This handles nested routes like /admin/profile/123
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={clsx(
        'bg-card border-r-[2px] transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center h-auto py-9 px-3 border-b bg-[#1a8649]">
        <img
          src={logo}
          alt="Logo"
          className="h-10 w-10 rounded-full object-cover shrink-0"
        />
        {sidebarOpen && (
          <span className="ml-3 text-2xl font-bold text-white whitespace-nowrap">
            ECO-HRM
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className={clsx("flex-1 space-y-1", sidebarOpen ? "p-4" : "p-3")}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Button
              key={item.path}
              variant="ghost"
              className={clsx(
                'w-full gap-3 text-left transition-colors',
                sidebarOpen ? 'justify-start px-3 ' : 'justify-center px-2 py-2',
                active && 'bg-green-500 text-white',
                'hover:bg-green-500 hover:text-white'
              )}
              size={sidebarOpen ? "sm" : null}
              onClick={() => onNavigate(item.path)}
            >
              <Icon className="h-5 w-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

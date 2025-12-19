import { memo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronDown, ChevronRight } from 'lucide-react';
import logo from '@/assets/images/download.png';
import type { SidebarProps } from './types';
import { Button } from '@/shared/components/ui/button/Button2';

export const Sidebar = memo(({ sidebarOpen, navigationItems, onNavigate }: SidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleMainItemClick = (item: any) => {
    // Click vào text/icon sẽ navigate
    if (item.path) {
      onNavigate(item.path);
    }
  };

  const handleChevronClick = (item: any, e: React.MouseEvent) => {
    // Click vào chevron sẽ toggle submenu
    e.stopPropagation();
    if (!sidebarOpen) return;
    toggleExpand(item.label);
  };

  const handleSubmenuClick = (submenuItem: any) => {
    // Submenu chỉ điều hướng đến trang
    if (submenuItem.path) {
      onNavigate(submenuItem.path);
    }
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
          const active = item.path ? isActive(item.path) : false;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedItems.includes(item.label);

          return (
            <div key={item.label || item.path}>
              {/* Main navigation button */}
              <Button
                variant="ghost"
                className={clsx(
                  'w-full gap-3 text-left transition-colors',
                  sidebarOpen ? 'justify-between px-3' : 'justify-center px-2 py-2',
                  active && 'bg-green-500 text-white',
                  'hover:bg-green-500 hover:text-white'
                )}
                size={sidebarOpen ? "sm" : null}
                onClick={() => handleMainItemClick(item)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
                {sidebarOpen && hasSubmenu && (
                  <button
                    className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
                    onClick={(e) => handleChevronClick(item, e)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
              </Button>

              {/* Submenu items */}
              {sidebarOpen && hasSubmenu && isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.submenu.map((subItem: any) => {
                    const SubIcon = subItem.icon;
                    const subActive = subItem.path ? isActive(subItem.path) : false;
                    
                    return (
                      <Button
                        key={subItem.label}
                        variant="ghost"
                        className={clsx(
                          'w-full gap-3 text-left transition-colors justify-start px-3',
                          subActive && 'bg-green-400 text-white',
                          'hover:bg-green-400 hover:text-white text-sm'
                        )}
                        size="sm"
                        onClick={() => handleSubmenuClick(subItem)}
                      >
                        <SubIcon className="h-4 w-4 shrink-0" />
                        <span>{subItem.label}</span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
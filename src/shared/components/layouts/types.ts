import { ElementType } from "react";

export interface NavigationItem {
  label: string;
  icon: ElementType;
  path: string;
}

export interface SidebarProps {
  sidebarOpen: boolean;
  navigationItems: NavigationItem[];
  onNavigate: (path: string) => void;
}

export interface HeaderProps {
  sidebarOpen: boolean;
  role: string;
  onToggleSidebar: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

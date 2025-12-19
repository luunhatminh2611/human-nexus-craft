import { LucideIcon } from "lucide-react";
import { ElementType } from "react";

export interface NavigationItem {
  label: string;
  // icon: ElementType;
  path: string;
  submenu?: SubMenuItem[];
}

export interface SidebarProps {
  sidebarOpen: boolean;
  navigationItems: NavigationItem[];
  onNavigate: (path: string) => void;
}

export interface HeaderProps {
  role: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export interface SubMenuItem {
  label: string;
  icon: LucideIcon;
  path?: string;
}
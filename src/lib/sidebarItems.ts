import {
  LayoutDashboard,
  BriefcaseBusiness,
  Bot,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Job Board", href: "/jobs", icon: BriefcaseBusiness },
  { label: "My Agents", href: "/agents", icon: Bot },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
];

import { X, ChevronLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SidebarProps } from "@/types/sidebar";
import { NavLink } from "react-router-dom";

import { sidebarMenus, type SidebarMenu } from "@/constants/sidebar-menu";
import { useAuthUser } from "@/lib/auth";
import { useState } from "react";

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const { role } = useAuthUser();

  const NOC_ALLOWED = ["Dashboard", "Transactions", "Order", "Overview"];
  const DEV_ONLY_LABELS = ["Rate Limiter", "Users"];

  const filteredMenus = sidebarMenus
    .map((section) => ({
      ...section,
      menus: section.menus
        .filter((menu) => {
          if (role === "dev") return true;

          if (role === "noc" && !NOC_ALLOWED.includes(menu.label)) return false;

          if (DEV_ONLY_LABELS.includes(menu.label)) return false;

          return true;
        })
        .map((menu) => ({
          ...menu,
          children: menu.children?.filter((child) => {
            if (role === "dev") return true;
            if (role === "noc" && !NOC_ALLOWED.includes(child.label))
              return false;
            if (DEV_ONLY_LABELS.includes(child.label)) return false;
            return true;
          }),
        })),
    }))
    .filter((section) => section.menus.length > 0);
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 md:hidden",
          mobileOpen ? "block" : "hidden",
        )}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          "fixed z-50 md:static inset-y-0 left-0 bg-white border-r",
          "transition-all duration-300 flex flex-col",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "relative h-16 border-b flex items-center px-4",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed && (
            <span className="font-bold text-lg">
              Pakar<span className="text-primary">Gaming</span>
            </span>
          )}

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              "hidden md:flex cursor-pointer",
              collapsed && "absolute left-1/2 -translate-x-1/2",
            )}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180",
              )}
            />
          </Button>

          {/* Mobile Close */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onCloseMobile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto">
          {filteredMenus.map((section, idx) => (
            <div key={idx}>
              {!collapsed && section.title && (
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.menus.map((menu) => (
                  <NavItem
                    key={menu.label}
                    menu={menu}
                    collapsed={collapsed}
                    pathname={location.pathname}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

function NavItem({
  menu,
  collapsed,
  pathname,
}: {
  menu: SidebarMenu;
  collapsed: boolean;
  pathname: string;
}) {
  const hasChildren = !!menu.children?.length;
  const isChildActive = menu.children?.some((child) => child.path === pathname);
  const [isOpen, setIsOpen] = useState(isChildActive);

  if (hasChildren && !collapsed) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm transition hover:bg-gray-100 cursor-pointer",
            isChildActive ? "text-primary font-medium" : "text-foreground",
          )}
        >
          <div className="flex items-center gap-3">
            <menu.icon className="w-4 h-4 shrink-0" />
            <span>{menu.label}</span>
          </div>
          <ChevronDown
            className={cn(
              "w-3 h-3 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>
        {isOpen && (
          <div className="pl-10 space-y-1">
            {menu.children?.map((child) => (
              <NavLink
                key={child.label}
                to={child.path!}
                className={({ isActive }) =>
                  cn(
                    "flex items-center w-full rounded-md py-2 text-xs transition",
                    isActive
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-primary",
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={menu.path ?? "#"}
      className={({ isActive }) =>
        cn(
          "flex items-center w-full rounded-lg px-3 py-2 text-sm transition",
          collapsed ? "justify-center" : "gap-3",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-gray-100 ",
        )
      }
    >
      <menu.icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span>{menu.label}</span>}
    </NavLink>
  );
}

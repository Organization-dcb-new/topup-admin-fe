import { X, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { SidebarProps } from '@/types/sidebar'
import { NavLink } from 'react-router-dom'

import { sidebarMenus } from '@/constants/sidebar-menu'

export function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn('fixed inset-0 z-40 bg-black/40 md:hidden', mobileOpen ? 'block' : 'hidden')}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          'fixed z-50 md:static inset-y-0 left-0 bg-white border-r',
          'transition-all duration-300 flex flex-col',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'relative h-16 border-b flex items-center px-4',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!collapsed && (
            <span className="font-bold text-lg">
              Redi<span className="text-primary">Game</span>
            </span>
          )}

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn('hidden md:flex', collapsed && 'absolute left-1/2 -translate-x-1/2')}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            />
          </Button>

          {/* Mobile Close */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onCloseMobile}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-4 space-y-4">
          {sidebarMenus.map((section, idx) => (
            <div key={idx}>
              {!collapsed && section.title && (
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.menus.map((menu) => (
                  <NavLink
                    key={menu.label}
                    to={menu.path ?? '#'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center w-full rounded-lg px-3 py-2 text-sm transition',
                        collapsed ? 'justify-center' : 'gap-3',
                        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                      )
                    }
                  >
                    <menu.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{menu.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}

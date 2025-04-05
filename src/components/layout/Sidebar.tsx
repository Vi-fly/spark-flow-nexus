
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  CheckSquare, 
  BarChart2, 
  Mail, 
  Bot, 
  Database, 
  MessageSquare, 
  Clock,
  Menu,
  X,
  Settings as SettingsIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

type SidebarProps = {
  className?: string;
};

// Navigation item type definition
type NavItem = {
  title: string;
  icon: React.ElementType;
  path: string;
};

// Main navigation items
const navItems: NavItem[] = [
  { title: 'Home', icon: Home, path: '/' },
  { title: 'Contacts', icon: Users, path: '/contacts' },
  { title: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { title: 'Gantt Chart', icon: BarChart2, path: '/gantt' },
  { title: 'Email', icon: Mail, path: '/email' },
  { title: 'Resource Bot', icon: Bot, path: '/resources' },
  { title: 'Data View', icon: Database, path: '/data' },
  { title: 'Discussions', icon: MessageSquare, path: '/discussions' },
  { title: 'Attendance', icon: Clock, path: '/attendance' },
  { title: 'Settings', icon: SettingsIcon, path: '/settings' },
];

// Sidebar component for application navigation
export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  // Toggle sidebar between collapsed and expanded states
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div
      className={cn(
        'relative h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-4 h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-md z-10 hover:scale-110 transition-transform"
        onClick={toggleSidebar}
      >
        {collapsed ? <Menu size={14} /> : <X size={14} />}
      </Button>

      <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
        <h1 className={cn(
          "text-xl font-bold text-indigo-600 transition-all duration-300",
          collapsed ? "scale-0 w-0 overflow-hidden" : "scale-100 w-auto"
        )}>
          Task Manager
        </h1>
        {collapsed && (
          <div className="flex items-center justify-center w-16 h-16">
            <CheckSquare className="h-6 w-6 text-indigo-600" />
          </div>
        )}
      </div>

      <nav className="mt-6 px-2">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center p-2 rounded-md transition-all duration-200 group',
                    isActive
                      ? 'bg-sidebar-accent text-primary font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )
                }
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-all",
                  collapsed ? "mx-auto" : "mr-3"
                )} />
                <span className={cn(
                  "transition-all duration-300",
                  collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                )}>
                  {item.title}
                </span>
                {collapsed && (
                  <span className="absolute left-full ml-2 p-2 bg-sidebar-accent text-sidebar-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50 text-sm whitespace-nowrap">
                    {item.title}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center transition-all duration-300",
          collapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className={cn(
            "flex flex-col transition-all duration-300",
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>
            <span className="text-sm font-medium">{user?.email ? user.email.split('@')[0] : 'User'}</span>
            <span className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

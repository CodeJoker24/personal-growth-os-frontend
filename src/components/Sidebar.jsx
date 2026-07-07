import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Code2, BookOpen, PenLine, Wallet, User, Target, Shield,
  ChevronsLeft, ChevronsRight, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const baseItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/habits', label: 'Habits', icon: CheckSquare },
  { to: '/coding', label: 'Coding', icon: Code2 },
  { to: '/study', label: 'Study', icon: BookOpen },
  { to: '/journal', label: 'Journal', icon: PenLine },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/profile', label: 'Profile', icon: User },
];

// Desktop-only sidebar. Hidden below the md breakpoint, where BottomNav takes over.
export default function Sidebar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('pgos_sidebar_collapsed') === 'true');

  const items = user?.role === 'admin'
    ? [...baseItems, { to: '/admin', label: 'Admin', icon: Shield }]
    : baseItems;

  useEffect(() => {
    localStorage.setItem('pgos_sidebar_collapsed', String(collapsed));
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '76px' : '240px');
  }, [collapsed]);

  return (
    <aside
      className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 border-r border-panelBorder bg-panelRaised/60 py-6 transition-all duration-200 ${
        collapsed ? 'md:w-[76px] px-2' : 'md:w-60 px-4'
      }`}
    >
      <div className={`mb-8 flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-2'}`}>
        {!collapsed && (
          <div>
            <p className="font-mono text-copper text-[11px] tracking-[0.2em] uppercase">Growth OS</p>
            {user && <p className="text-sm text-textDim mt-1 truncate max-w-[140px]">{user.full_name || user.username}</p>}
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-textDim hover:text-copper hover:bg-panel transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 rounded-xl text-sm transition ${
                  collapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  isActive
                    ? 'bg-copper/10 text-copper border border-copper/30'
                    : 'text-textDim hover:text-textPrimary hover:bg-panel border border-transparent'
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={toggleTheme}
        className={`mt-auto flex items-center gap-3 py-2.5 rounded-xl text-sm text-textDim hover:text-textPrimary hover:bg-panel transition ${
          collapsed ? 'justify-center px-0' : 'px-3'
        }`}
        title={collapsed ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : undefined}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
      </button>
    </aside>
  );
}

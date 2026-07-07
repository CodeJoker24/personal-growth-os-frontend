import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Code2, BookOpen, PenLine, Wallet, Target, User } from 'lucide-react';

const items = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/habits', label: 'Habits', icon: CheckSquare },
  { to: '/coding', label: 'Code', icon: Code2 },
  { to: '/study', label: 'Study', icon: BookOpen },
  { to: '/journal', label: 'Journal', icon: PenLine },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-panelBorder bg-panel/95 backdrop-blur">
      <div className="max-w-md mx-auto grid grid-cols-8">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] ${
                  isActive ? 'text-copper' : 'text-textDim'
                }`
              }
            >
              <Icon size={16} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

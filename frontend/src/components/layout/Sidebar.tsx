import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, TrendingUp, FileText,
  BarChart3, UserCog, Settings, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students', icon: GraduationCap, label: 'Students' },
  { to: '/admissions', icon: Users, label: 'Admissions' },
  { to: '/cutoff', icon: TrendingUp, label: 'Cutoff Analysis' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/users', icon: UserCog, label: 'Users' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-surface-border shadow-sidebar z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-border flex-shrink-0">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-surface-border flex-shrink-0">
          <img src="/logo.png" alt="HKBKCE Logo" className="w-full h-full object-contain p-0.5" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-sm font-bold text-text-primary leading-tight">HKBKCE</h1>
              <p className="text-[10px] text-text-muted leading-tight">Admission Intelligence</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <NavLink key={item.to} to={item.to}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} className={`flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-surface-border flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-text-muted hover:bg-gray-50 hover:text-text-primary transition-colors"
          id="sidebar-toggle"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

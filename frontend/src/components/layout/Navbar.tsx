import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchDropdown from '../ui/SearchDropdown';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onSelectStudent: (id: string) => void;
}

export default function Navbar({ onSelectStudent }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = [
    { id: 1, text: 'New KCET allotment list uploaded', time: '2 min ago', unread: true },
    { id: 2, text: '5 students pending fee confirmation', time: '1 hour ago', unread: true },
    { id: 3, text: 'Cutoff analysis report ready', time: '3 hours ago', unread: false },
  ];

  const handleProfileAction = (label: string) => {
    setShowProfile(false);
    switch (label) {
      case 'My Profile':
        toast.success(`${user?.name}\nRole: ${user?.role} | ${user?.email}`, { duration: 4000 });
        break;
      case 'Settings':
        navigate('/settings');
        break;
      case 'Sign Out':
        logout();
        toast('Signed out successfully', { icon: '👋', duration: 2000 });
        navigate('/login');
        break;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-surface-border flex items-center justify-between px-6 sticky top-0 z-30">
      <SearchDropdown onSelectStudent={onSelectStudent} />

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            id="notifications-btn"
          >
            <Bell size={20} className="text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-surface-border z-50"
              >
                <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                  <span className="text-xs text-primary font-medium cursor-pointer hover:underline"
                    onClick={() => { toast.success('All notifications marked as read'); setShowNotif(false); }}>
                    Mark all read
                  </span>
                </div>
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${n.unread ? 'bg-primary-50/30' : ''}`}>
                    <p className="text-sm text-text-primary">{n.text}</p>
                    <p className="text-xs text-text-muted mt-1">{n.time}</p>
                  </div>
                ))}
                <div className="px-4 py-2.5 text-center">
                  <span className="text-xs text-primary font-medium cursor-pointer hover:underline"
                    onClick={() => { toast('No more notifications', { icon: '📬' }); setShowNotif(false); }}>
                    View all notifications
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors"
            id="profile-dropdown-btn"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user?.initials || 'U'}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-text-primary leading-tight">{user?.name?.split(' ').slice(0, 2).join(' ') || 'User'}</p>
              <p className="text-[10px] text-text-muted leading-tight">{user?.role || 'Unknown'}</p>
            </div>
            <ChevronDown size={14} className="text-text-muted" />
          </button>
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-dropdown border border-surface-border z-50 overflow-hidden"
              >
                {/* User info header */}
                <div className="px-4 py-3 bg-surface-bg border-b border-surface-border">
                  <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  {[
                    { icon: User, label: 'My Profile' },
                    { icon: Settings, label: 'Settings' },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => handleProfileAction(item.label)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors"
                    >
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-surface-border py-1">
                  <button
                    onClick={() => handleProfileAction('Sign Out')}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

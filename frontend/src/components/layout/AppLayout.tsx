import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleSelectStudent = (id: string) => {
    navigate(`/students/${id}`);
  };

  return (
    <div className="min-h-screen bg-surface-bg">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col min-h-screen"
      >
        <Navbar onSelectStudent={handleSelectStudent} />
        <main className="flex-1 p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}

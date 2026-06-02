import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Edit3, Shield, UserCheck, Eye, Trash2 } from 'lucide-react';
import { users } from '../data/mockData';
import toast from 'react-hot-toast';

const roleColors: Record<string, string> = {
  'Admin': 'bg-primary-50 text-primary border-primary-200',
  'Admission Staff': 'bg-blue-50 text-accent-blue border-blue-200',
  'Faculty': 'bg-green-50 text-accent-green border-green-200',
  'Viewer': 'bg-gray-100 text-text-secondary border-gray-200',
};

const roleIcons: Record<string, React.ReactNode> = {
  'Admin': <Shield size={14} />,
  'Admission Staff': <UserCheck size={14} />,
  'Faculty': <Edit3 size={14} />,
  'Viewer': <Eye size={14} />,
};

export default function Users() {
  const [userList, setUserList] = useState(users);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage user accounts and roles</p>
        </div>
        <button
          onClick={() => toast.success('Add user form coming soon!')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Admin', 'Admission Staff', 'Faculty', 'Viewer'].map((role, idx) => {
          const count = userList.filter(u => u.role === role).length;
          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-card border border-surface-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`p-1.5 rounded-lg border ${roleColors[role]}`}>{roleIcons[role]}</span>
                <span className="text-sm font-medium text-text-secondary">{role}</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{count}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-card border border-surface-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/50 border-b border-surface-border">
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">User</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Role</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Last Login</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user, idx) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                className="table-row-hover border-b border-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.avatar}</span>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{user.name}</p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${roleColors[user.role]}`}>
                    {roleIcons[user.role]}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-muted text-xs">{user.lastLogin}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-text-muted'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setUserList(prev => prev.filter(u => u.id !== user.id))}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
                    title="Remove User"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

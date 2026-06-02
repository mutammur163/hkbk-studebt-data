import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import OrbBackground from '../components/ui/OrbBackground';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center relative overflow-hidden">
      {/* Orb Background */}
      <div className="absolute inset-0">
        <OrbBackground />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-modal border border-white/50 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-surface-border mx-auto mb-4 shadow-lg"
            >
              <img src="/logo.png" alt="HKBKCE Logo" className="w-full h-full object-contain p-1" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-text-primary"
            >
              HKBKCE
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-text-secondary mt-1"
            >
              Admission Intelligence Platform
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
              >
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@hkbkce.edu.in"
                className="w-full px-4 py-3 border border-surface-border rounded-xl text-sm text-text-primary placeholder:text-text-muted bg-white focus:bg-white transition-colors"
                id="login-email"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 border border-surface-border rounded-xl text-sm text-text-primary placeholder:text-text-muted bg-white focus:bg-white transition-colors"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              id="login-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 bg-primary-50/50 rounded-xl border border-primary-100"
          >
            <p className="text-xs font-semibold text-primary mb-2">Demo Credentials</p>
            <div className="space-y-1.5 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span className="font-medium">Admin:</span>
                <span className="font-mono">admin@hkbkce.edu.in / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Staff:</span>
                <span className="font-mono">priya.s@hkbkce.edu.in / staff123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Faculty:</span>
                <span className="font-mono">mohan.r@hkbkce.edu.in / faculty123</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-4">
          © 2024 HKBK College of Engineering. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}

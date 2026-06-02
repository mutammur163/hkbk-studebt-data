import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Palette, Bell, Shield, Database, Save, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    collegeName: 'HKBK College of Engineering',
    academicYear: '2024-25',
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    twoFactor: false,
    sessionTimeout: '30',
    theme: 'light',
  });

  const handleSave = () => toast.success('Settings saved successfully!');

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">System preferences and configuration</p>
      </div>

      {/* General */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-card border border-surface-border">
        <div className="flex items-center gap-2 mb-5">
          <SettingsIcon size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">General</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">College Name</label>
            <input value={settings.collegeName} onChange={e => setSettings({...settings, collegeName: e.target.value})} className="w-full px-3 py-2.5 border border-surface-border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Academic Year</label>
            <input value={settings.academicYear} onChange={e => setSettings({...settings, academicYear: e.target.value})} className="w-full px-3 py-2.5 border border-surface-border rounded-xl text-sm" />
          </div>
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-card border border-surface-border">
        <div className="flex items-center gap-2 mb-5">
          <Palette size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Theme Preferences</h3>
        </div>
        <div className="flex gap-3">
          {['light', 'dark', 'system'].map(t => (
            <button
              key={t}
              onClick={() => setSettings({...settings, theme: t})}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                settings.theme === t ? 'bg-primary text-white shadow-sm' : 'bg-surface-bg text-text-secondary hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-card border border-surface-border">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email alerts for important events' },
            { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive SMS alerts for critical updates' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-surface-bg cursor-pointer">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings[item.key as keyof typeof settings] ? 'bg-primary' : 'bg-gray-300'}`}
                onClick={() => setSettings({...settings, [item.key]: !settings[item.key as keyof typeof settings]})}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[item.key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-card border border-surface-border">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Security</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-bg cursor-pointer">
            <div>
              <p className="text-sm font-medium text-text-primary">Two-Factor Authentication</p>
              <p className="text-xs text-text-muted">Add an extra layer of security</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.twoFactor ? 'bg-primary' : 'bg-gray-300'}`}
              onClick={() => setSettings({...settings, twoFactor: !settings.twoFactor})}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.twoFactor ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Session Timeout (minutes)</label>
            <input type="number" value={settings.sessionTimeout} onChange={e => setSettings({...settings, sessionTimeout: e.target.value})} className="w-32 px-3 py-2.5 border border-surface-border rounded-xl text-sm" />
          </div>
        </div>
      </motion.div>

      {/* Data Mapping */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl p-6 shadow-card border border-surface-border">
        <div className="flex items-center gap-2 mb-5">
          <Database size={18} className="text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-text-primary">CSV → Database Mapping</h3>
            <p className="text-xs text-text-muted mt-0.5">How Supabase CSV column values map to project quota names</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quota / Admission Type */}
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Quota / Admission Type</p>
            <div className="space-y-2">
              {[
                { csv: 'MGT',        project: 'MANAGEMENT', note: 'Management quota' },
                { csv: 'MGMT',       project: 'MANAGEMENT', note: 'Management quota (alt)' },
                { csv: 'CET',        project: 'KCET',       note: 'Karnataka CET' },
                { csv: 'KCET',       project: 'KCET',       note: 'Karnataka CET (passthrough)' },
                { csv: 'KRLMPCA',    project: 'KRLMPCA',    note: 'KRLMPCA quota' },
                { csv: 'DIPLOMA',    project: 'DIPLOMA',    note: 'Diploma lateral entry' },
                { csv: 'SNQ',        project: 'SNQ',        note: 'Special NRI quota' },
              ].map(row => (
                <div key={row.csv} className="flex items-center gap-2 px-3 py-2 bg-surface-bg rounded-xl text-xs">
                  <span className="font-mono font-semibold text-accent-blue w-20">{row.csv}</span>
                  <ArrowRight size={12} className="text-text-muted flex-shrink-0" />
                  <span className="font-mono font-semibold text-primary w-24">{row.project}</span>
                  <span className="text-text-muted truncate">{row.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expected student columns */}
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Student table columns</p>
            <div className="space-y-2">
              {[
                { col: 'sl_no', note: 'Serial number' },
                { col: 'usn', note: 'Unique key for upsert' },
                { col: 'name', note: 'Full name' },
                { col: 'gender', note: 'Male / Female / Other' },
                { col: 'category', note: 'Reservation category' },
                { col: 'quota', note: 'KCET, MANAGEMENT, …' },
                { col: 'branch', note: 'Program branch code' },
              ].map((row) => (
                <div key={row.col} className="flex items-center gap-2 px-3 py-2 bg-surface-bg rounded-xl text-xs">
                  <span className="font-mono font-semibold text-accent-blue w-24">{row.col}</span>
                  <span className="text-text-muted">{row.note}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-primary-50 rounded-xl border border-primary-200">
              <p className="text-xs text-primary font-medium mb-1">How it works</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                CSV uploads normalize quota aliases (for example MGT → MANAGEMENT, CET → KCET). Rows are matched on{' '}
                <span className="font-mono font-semibold">usn</span>.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm">
          <Save size={16} />
          Save Settings
        </button>
      </motion.div>
    </div>
  );
}

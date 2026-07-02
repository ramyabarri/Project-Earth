import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Activity, ChevronDown, X } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

export default function TopNav() {
  const [time, setTime] = useState(new Date());
  const [showNotifs, setShowNotifs] = useState(false);
  const notifCount = useAppStore(s => s.notifCount);
  const notifications = useAppStore(s => s.notifications);
  const clearNotifications = useAppStore(s => s.clearNotifications);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour12: false });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0 relative z-20"
      style={{
        background: 'rgba(5,11,26,0.95)',
        borderBottom: '1px solid rgba(16,185,129,0.12)',
      }}
    >
      {/* Project name */}
      <div className="flex items-center gap-3">
        <div
          className="w-px h-6"
          style={{ background: 'linear-gradient(to bottom, transparent, #10b981, transparent)' }}
        />
        <div>
          <div className="text-sm font-bold text-white tracking-wide">
            AI Sustainability Intelligence Platform
          </div>
          <div className="text-xs text-slate-500">Digital Twin Operations Center</div>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-4">
        {/* Time */}
        <div className="text-right">
          <div
            className="text-sm font-semibold"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#e2e8f0' }}
          >
            {timeStr}
          </div>
          <div className="text-xs text-slate-500">{dateStr}</div>
        </div>

        {/* System status */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <Activity size={12} className="text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Operational</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg transition-all"
            style={{
              background: showNotifs ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Bell size={16} className="text-slate-400" />
            {notifCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                style={{ background: '#10b981', color: 'white', fontSize: '9px' }}
              >
                {notifCount > 9 ? '9+' : notifCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 w-72 rounded-xl overflow-hidden z-50"
                style={{
                  background: 'rgba(8,15,35,0.98)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>
                  <span className="text-xs font-semibold text-slate-300">Notifications</span>
                  <button onClick={() => { clearNotifications(); setShowNotifs(false); }}
                    className="text-xs text-emerald-400 hover:text-emerald-300">
                    Clear all
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-600">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="px-4 py-2.5 border-b hover:bg-white/[0.02] transition-colors"
                        style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <div className="text-xs text-slate-300">{n.message}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{n.ts}</div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: 'white' }}
          >
            AI
          </div>
          <ChevronDown size={12} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
        </div>
      </div>
    </header>
  );
}

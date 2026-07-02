import { motion } from 'framer-motion';
import {
  LayoutDashboard, Leaf, UserCheck, BarChart3, Zap
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sustainability', label: 'Sustainability Metrics', icon: Leaf },
  { id: 'human-loop', label: 'Human-in-the-Loop', icon: UserCheck },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar() {
  const activeView = useAppStore(s => s.activeView);
  const setActiveView = useAppStore(s => s.setActiveView);

  return (
    <aside
      className="flex flex-col w-56 h-full flex-shrink-0"
      style={{
        background: 'rgba(5, 11, 26, 0.95)',
        borderRight: '1px solid rgba(16,185,129,0.12)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(16,185,129,0.12)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <Zap size={16} color="white" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 leading-tight">AI-SUST</div>
            <div className="text-xs text-slate-500 leading-tight">Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-600 px-2 mb-3 uppercase tracking-widest">
          Navigation
        </div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group relative"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(16,185,129,0.3)'
                  : '1px solid transparent',
                color: isActive ? '#10b981' : '#64748b',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                  style={{ background: '#10b981' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={16}
                style={{ color: isActive ? '#10b981' : '#4b5563' }}
                className="group-hover:text-emerald-500 transition-colors"
              />
              <span className="text-xs font-medium group-hover:text-slate-300 transition-colors">
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* System status */}
      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: 'rgba(16,185,129,0.1)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">System Online</span>
        </div>
        <div className="text-xs text-slate-600">All subsystems nominal</div>
        <div
          className="mt-2 text-xs px-2 py-1 rounded mono"
          style={{
            background: 'rgba(16,185,129,0.06)',
            color: '#10b981',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          v2.4.1-alpha
        </div>
      </div>
    </aside>
  );
}

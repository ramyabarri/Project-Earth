import { motion } from 'framer-motion';
import { Droplets, Wind, DollarSign, Zap, Shield, Activity } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const CARDS = [
  {
    key: 'waterSaved',
    label: 'Water Saved',
    icon: Droplets,
    unit: 'kL',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.08)',
    border: 'rgba(14,165,233,0.2)',
    format: v => v.toFixed(1),
  },
  {
    key: 'carbonReduced',
    label: 'Carbon Reduced',
    icon: Wind,
    unit: 'tCO₂',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    format: v => v.toFixed(1),
  },
  {
    key: 'coolingCost',
    label: 'Cooling Cost',
    icon: DollarSign,
    unit: '/hr',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
    format: v => `$${v.toLocaleString()}`,
    noUnit: true,
  },
  {
    key: 'powerConsumption',
    label: 'Power Usage',
    icon: Zap,
    unit: 'MW',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    format: v => v.toFixed(2),
  },
  {
    key: 'currentSLA',
    label: 'Current SLA',
    icon: Shield,
    unit: '%',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    format: v => v.toFixed(2),
  },
  {
    key: 'activeRequests',
    label: 'Active Requests',
    icon: Activity,
    unit: '',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    format: v => v.toString(),
  },
];

export default function KPICards() {
  const kpi = useAppStore(s => s.kpi);

  return (
    <div className="grid grid-cols-6 gap-3 px-4 py-3">
      {CARDS.map(({ key, label, icon: Icon, unit, color, bg, border, format, noUnit }, i) => {
        const value = kpi[key] ?? 0;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl px-4 py-3 flex flex-col gap-1.5 relative overflow-hidden"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            {/* Subtle gradient overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(ellipse at top left, ${color}20, transparent 70%)`,
              }}
            />

            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs text-slate-400 font-medium">{label}</span>
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: `${color}18` }}
              >
                <Icon size={12} style={{ color }} />
              </div>
            </div>

            <motion.div
              key={value}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="relative z-10"
            >
              <span
                className="text-lg font-bold"
                style={{ color, fontFamily: 'JetBrains Mono, monospace' }}
              >
                {format(value)}
              </span>
              {!noUnit && (
                <span className="text-xs text-slate-500 ml-1">{unit}</span>
              )}
            </motion.div>

            <div className="flex items-center gap-1 relative z-10">
              <div className="w-1 h-1 rounded-full" style={{ background: color }} />
              <span className="text-xs text-slate-600">Live</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

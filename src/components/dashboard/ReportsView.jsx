import { motion } from 'framer-motion';
import { BarChart3, TrendingDown, TrendingUp, Download, Calendar } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

function MiniBarChart({ data, color, label }) {
  const max = Math.max(...data);
  return (
    <div>
      <div className="text-xs text-slate-500 mb-2">{label}</div>
      <div className="flex items-end gap-1 h-16">
        {data.map((v, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.04 }}
            className="flex-1 rounded-sm origin-bottom"
            style={{
              height: `${(v / max) * 100}%`,
              background: `linear-gradient(to top, ${color}60, ${color})`,
              minHeight: 2,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-700">-7d</span>
        <span className="text-xs text-slate-700">now</span>
      </div>
    </div>
  );
}

const MOCK_TRENDS = {
  water: [18, 15, 22, 12, 19, 14, 11],
  carbon: [8, 6, 9, 5, 7, 6, 4],
  energy: [1.4, 1.3, 1.5, 1.2, 1.4, 1.3, 1.1],
  sla: [99.92, 99.94, 99.91, 99.97, 99.95, 99.96, 99.98],
};

export default function ReportsView() {
  const requests = useAppStore(s => s.requests);
  const kpi = useAppStore(s => s.kpi);

  const completed = requests.filter(r => r.status === 'completed').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const processing = requests.filter(r => r.status === 'processing').length;

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-base font-bold text-white">Reports & Analytics</h2>
          <p className="text-xs text-slate-500">7-day sustainability performance summary</p>
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: '#10b981',
          }}
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* KPI summary row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Requests', value: requests.length, unit: '', color: '#3b82f6', trend: '+12%' },
            { label: 'Completed', value: completed, unit: '', color: '#10b981', trend: '+8%' },
            { label: 'Processing', value: processing, unit: '', color: '#f59e0b', trend: '' },
            { label: 'SLA Uptime', value: `${kpi.currentSLA}`, unit: '%', color: '#10b981', trend: '↑' },
          ].map(({ label, value, unit, color, trend }) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{ background: `${color}08`, border: `1px solid ${color}20` }}
            >
              <div className="text-xs text-slate-500 mb-1">{label}</div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
                  {value}
                </span>
                <span className="text-xs text-slate-500 mb-0.5">{unit}</span>
              </div>
              {trend && <div className="text-xs mt-1" style={{ color }}>{trend} vs last week</div>}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'water', label: 'Water Consumption (kL/day)', color: '#0ea5e9' },
            { key: 'carbon', label: 'Carbon Emissions (tCO₂/day)', color: '#10b981' },
            { key: 'energy', label: 'Energy Usage (MW/day)', color: '#f59e0b' },
            { key: 'sla', label: 'SLA Performance (%)', color: '#8b5cf6' },
          ].map(({ key, label, color }) => (
            <div
              key={key}
              className="rounded-xl p-4"
              style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <MiniBarChart data={MOCK_TRENDS[key]} color={color} label={label} />
            </div>
          ))}
        </div>

        {/* Workload breakdown */}
        <div
          className="rounded-xl p-5"
          style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-sm font-semibold text-white mb-4">Workload Distribution by Policy</div>
          <div className="space-y-3">
            {[
              { label: 'Balanced', pct: 42, color: '#10b981' },
              { label: 'Carbon First', pct: 24, color: '#0ea5e9' },
              { label: 'Water First', pct: 18, color: '#8b5cf6' },
              { label: 'Energy First', pct: 10, color: '#f59e0b' },
              { label: 'Performance', pct: 6, color: '#3b82f6' },
            ].map(({ label, pct, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-28">{label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className="text-xs font-semibold w-8 text-right" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Droplets, Wind, Zap, Thermometer, Activity, TrendingDown } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { getStatusColor } from '../../utils/scheduler';

function GaugeBar({ label, value, max, color, icon: Icon, unit }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={13} style={{ color }} />
          <span className="text-xs text-slate-400">{label}</span>
        </div>
        <span className="text-xs font-semibold" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
          {typeof value === 'number' ? value.toFixed(1) : value}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function ServerCard({ server }) {
  const color = getStatusColor(server.status);
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(15,23,42,0.6)',
        border: `1px solid ${color}25`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-bold text-white">{server.name}</div>
          <div className="text-xs text-slate-500">{server.location}</div>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
        >
          {server.status}
        </span>
      </div>
      <div className="space-y-2">
        <GaugeBar label="Water" value={server.waterConsumption} max={60} color="#0ea5e9" icon={Droplets} unit=" L/h" />
        <GaugeBar label="Carbon" value={server.carbonScore} max={80} color="#10b981" icon={Wind} unit=" g" />
        <GaugeBar label="Energy" value={server.energyUsage} max={100} color="#f59e0b" icon={Zap} unit=" kW" />
        <GaugeBar label="Temp" value={server.temperature} max={65} color="#8b5cf6" icon={Thermometer} unit="°C" />
      </div>
    </div>
  );
}

export default function SustainabilityView() {
  const servers = useAppStore(s => s.servers);
  const kpi = useAppStore(s => s.kpi);

  const avgWater = servers.reduce((a, s) => a + s.waterConsumption, 0) / servers.length;
  const avgCarbon = servers.reduce((a, s) => a + s.carbonScore, 0) / servers.length;
  const avgEnergy = servers.reduce((a, s) => a + s.energyUsage, 0) / servers.length;

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 gap-4">
      <div className="flex-shrink-0">
        <h2 className="text-base font-bold text-white">Sustainability Metrics</h2>
        <p className="text-xs text-slate-500">Environmental impact across all data centers</p>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        {[
          { label: 'Avg Water Use', value: avgWater.toFixed(1), unit: 'L/hr', icon: Droplets, color: '#0ea5e9' },
          { label: 'Avg Carbon', value: avgCarbon.toFixed(1), unit: 'gCO₂/h', icon: Wind, color: '#10b981' },
          { label: 'Avg Energy', value: avgEnergy.toFixed(1), unit: 'kW', icon: Zap, color: '#f59e0b' },
        ].map(({ label, value, unit, icon: Icon, color }) => (
          <motion.div
            key={label}
            className="rounded-xl p-4"
            style={{ background: `${color}08`, border: `1px solid ${color}20` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
            <div>
              <span className="text-xl font-bold" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
                {value}
              </span>
              <span className="text-xs text-slate-500 ml-1">{unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary savings */}
      <div
        className="flex-shrink-0 rounded-xl p-4 flex items-center gap-6"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.05))',
          border: '1px solid rgba(16,185,129,0.2)',
        }}
      >
        <TrendingDown size={28} color="#10b981" />
        <div>
          <div className="text-sm font-bold text-white">Sustainability Savings Today</div>
          <div className="text-xs text-slate-400 mt-0.5">Compared to baseline non-optimized schedule</div>
        </div>
        <div className="ml-auto flex gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">{kpi.waterSaved} kL</div>
            <div className="text-xs text-slate-500">Water</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">{kpi.carbonReduced} t</div>
            <div className="text-xs text-slate-500">CO₂</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">${kpi.coolingCost.toLocaleString()}</div>
            <div className="text-xs text-slate-500">Cooling</div>
          </div>
        </div>
      </div>

      {/* Per-server cards */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {servers.map(s => <ServerCard key={s.id} server={s} />)}
        </div>
      </div>
    </div>
  );
}

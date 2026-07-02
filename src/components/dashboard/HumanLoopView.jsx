import { motion } from 'framer-motion';
import { UserCheck, Target, Shield, Droplets, Wind, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { computeSustainabilityScore, getStatusColor } from '../../utils/scheduler';

const POLICY_ICONS = {
  balanced: Target,
  performance: Shield,
  water: Droplets,
  carbon: Wind,
  energy: Zap,
};

const POLICY_DESCRIPTIONS = {
  balanced: 'Evenly distributes weight across all sustainability factors for a holistic approach.',
  performance: 'Prioritizes raw compute availability. Best for latency-critical workloads.',
  water: 'Minimizes freshwater consumption. Ideal in water-stressed regions.',
  carbon: 'Targets lowest carbon emissions. Best for green SLA commitments.',
  energy: 'Reduces total energy draw. Best for renewable energy budget optimization.',
};

function WeightBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-20">{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-8 text-right">{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

export default function HumanLoopView() {
  const selectedPolicy = useAppStore(s => s.selectedPolicy);
  const policies = useAppStore(s => s.policies);
  const setSelectedPolicy = useAppStore(s => s.setSelectedPolicy);
  const servers = useAppStore(s => s.servers);
  const recommendedRackId = useAppStore(s => s.recommendedRackId);

  const recServer = servers.find(s => s.id === recommendedRackId);

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 gap-4">
      <div className="flex-shrink-0">
        <h2 className="text-base font-bold text-white">Human-in-the-Loop Control</h2>
        <p className="text-xs text-slate-500">Override AI scheduling policy in real-time</p>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 content-start">
        {/* Policy selector */}
        <div
          className="rounded-xl p-5 col-span-1"
          style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(16,185,129,0.12)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <UserCheck size={16} color="#10b981" />
            <span className="text-sm font-semibold text-white">Scheduling Policy</span>
          </div>
          <div className="space-y-2">
            {policies.map(policy => {
              const isActive = selectedPolicy.id === policy.id;
              const Icon = POLICY_ICONS[policy.id] || Target;
              return (
                <motion.button
                  key={policy.id}
                  onClick={() => setSelectedPolicy(policy)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))'
                      : 'rgba(255,255,255,0.03)',
                    border: isActive
                      ? '1px solid rgba(16,185,129,0.35)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isActive ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Icon size={15} style={{ color: isActive ? '#10b981' : '#64748b' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold" style={{ color: isActive ? '#10b981' : '#94a3b8' }}>
                      {policy.label}
                    </div>
                    <div className="text-xs text-slate-600 truncate mt-0.5">
                      {POLICY_DESCRIPTIONS[policy.id]}
                    </div>
                  </div>
                  {isActive && <CheckCircle2 size={14} color="#10b981" className="flex-shrink-0" />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Weight visualization */}
        <div className="col-span-1 flex flex-col gap-4">
          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(16,185,129,0.12)' }}
          >
            <div className="text-sm font-semibold text-white mb-1">{selectedPolicy.label}</div>
            <div className="text-xs text-slate-500 mb-4">{POLICY_DESCRIPTIONS[selectedPolicy.id]}</div>
            <div className="space-y-3">
              <WeightBar label="CPU Load" value={selectedPolicy.weights.cpu} color="#3b82f6" />
              <WeightBar label="Water" value={selectedPolicy.weights.water} color="#0ea5e9" />
              <WeightBar label="Carbon" value={selectedPolicy.weights.carbon} color="#10b981" />
              <WeightBar label="Temperature" value={selectedPolicy.weights.temp} color="#8b5cf6" />
              <WeightBar label="Energy" value={selectedPolicy.weights.energy} color="#f59e0b" />
            </div>
          </div>

          {/* Effect preview */}
          {recServer && (
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(16,185,129,0.04)',
                border: '1px solid rgba(16,185,129,0.18)',
              }}
            >
              <div className="text-xs text-slate-400 mb-2">Current recommendation under this policy</div>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <Target size={15} color="#10b981" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{recServer.name}</div>
                  <div className="text-xs text-slate-500">
                    Score: {(computeSustainabilityScore(recServer, selectedPolicy.weights) * 100).toFixed(1)} pts
                  </div>
                </div>
                <div className="ml-auto">
                  <span
                    className="text-xs px-2 py-0.5 rounded font-semibold capitalize"
                    style={{ background: `${getStatusColor(recServer.status)}15`, color: getStatusColor(recServer.status) }}
                  >
                    {recServer.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Server scoring table */}
        <div
          className="col-span-2 rounded-xl p-5"
          style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(16,185,129,0.12)' }}
        >
          <div className="text-sm font-semibold text-white mb-4">Live Data Center Scoring</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Data Center', 'CPU', 'Water', 'Carbon', 'Temp', 'Energy', 'Score', 'Rank'].map(h => (
                    <th key={h} className="text-left pb-2 text-slate-500 font-medium pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...servers]
                  .map(s => ({
                    ...s,
                    score: computeSustainabilityScore(s, selectedPolicy.weights),
                  }))
                  .sort((a, b) => a.score - b.score)
                  .map((s, rank) => {
                    const isRec = s.id === recommendedRackId;
                    return (
                      <tr
                        key={s.id}
                        className="border-b"
                        style={{
                          borderColor: 'rgba(255,255,255,0.04)',
                          background: isRec ? 'rgba(16,185,129,0.04)' : 'transparent',
                        }}
                      >
                        <td className="py-2 pr-4 font-medium" style={{ color: isRec ? '#10b981' : '#94a3b8' }}>
                          {isRec ? '★ ' : ''}{s.name}
                        </td>
                        <td className="py-2 pr-4 text-slate-400">{s.cpu.toFixed(0)}%</td>
                        <td className="py-2 pr-4 text-slate-400">{s.waterConsumption.toFixed(0)}L</td>
                        <td className="py-2 pr-4 text-slate-400">{s.carbonScore.toFixed(0)}g</td>
                        <td className="py-2 pr-4 text-slate-400">{s.temperature.toFixed(0)}°C</td>
                        <td className="py-2 pr-4 text-slate-400">{s.energyUsage.toFixed(0)}kW</td>
                        <td className="py-2 pr-4 font-bold" style={{ color: isRec ? '#10b981' : '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                          {(s.score * 100).toFixed(1)}
                        </td>
                        <td className="py-2">
                          <span
                            className="px-1.5 py-0.5 rounded font-bold"
                            style={{
                              background: rank === 0 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                              color: rank === 0 ? '#10b981' : '#64748b',
                            }}
                          >
                            #{rank + 1}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

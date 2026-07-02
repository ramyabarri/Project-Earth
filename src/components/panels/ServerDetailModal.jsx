import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, Cpu, Zap, Thermometer, Droplets, Wind, Shield } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { getStatusColor } from '../../utils/scheduler';

function StatRow({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2">
        <Icon size={13} style={{ color }} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        {unit && <span className="text-xs text-slate-600">{unit}</span>}
      </div>
    </div>
  );
}

export default function ServerDetailModal() {
  const selectedServer = useAppStore(s => s.selectedServer);
  const setSelectedServer = useAppStore(s => s.setSelectedServer);
  const recommendedRackId = useAppStore(s => s.recommendedRackId);

  if (!selectedServer) return null;
  const statusColor = getStatusColor(selectedServer.status);
  const isRec = selectedServer.id === recommendedRackId;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-30 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={() => setSelectedServer(null)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="w-80 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(5,11,26,0.98)',
            border: `1px solid ${statusColor}40`,
            boxShadow: `0 25px 80px rgba(0,0,0,0.8), 0 0 40px ${statusColor}15`,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{
              background: `linear-gradient(135deg, ${statusColor}12, transparent)`,
              borderBottom: `1px solid ${statusColor}20`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${statusColor}18`, border: `1px solid ${statusColor}30` }}
              >
                <Server size={18} style={{ color: statusColor }} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{selectedServer.name}</div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                  <span className="text-xs capitalize" style={{ color: statusColor }}>
                    {selectedServer.status}
                  </span>
                  {isRec && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                    >
                      ★ Recommended
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedServer(null)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]"
            >
              <X size={14} color="#64748b" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-1">
            <div className="text-xs text-slate-600 uppercase tracking-widest mb-3">Hardware</div>
            <StatRow icon={Server} label="Model" value={selectedServer.model} color="#3b82f6" />
            <StatRow icon={Cpu} label="CPU Cores" value={selectedServer.cores} color="#6366f1" />
            <StatRow icon={Server} label="Memory" value={selectedServer.memory} color="#8b5cf6" />
            <StatRow icon={Shield} label="Uptime" value={selectedServer.uptime} unit="%" color="#10b981" />

            <div className="text-xs text-slate-600 uppercase tracking-widest mt-4 mb-3">Live Metrics</div>
            <StatRow icon={Cpu} label="CPU Load" value={selectedServer.cpu} unit="%" color="#3b82f6" />
            <StatRow icon={Cpu} label="GPU Load" value={selectedServer.gpu} unit="%" color="#6366f1" />
            <StatRow icon={Thermometer} label="Temperature" value={selectedServer.temperature} unit="°C" color="#8b5cf6" />
            <StatRow icon={Droplets} label="Water Use" value={selectedServer.waterConsumption} unit=" L/hr" color="#0ea5e9" />
            <StatRow icon={Wind} label="Carbon Score" value={selectedServer.carbonScore} unit=" gCO₂" color="#10b981" />
            <StatRow icon={Zap} label="Energy" value={selectedServer.energyUsage} unit=" kW" color="#f59e0b" />

            <div className="text-xs text-slate-500 mt-2">{selectedServer.location}</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

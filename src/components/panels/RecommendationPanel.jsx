import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Wind, Thermometer, CheckCircle2, AlertCircle,
  Cpu, Zap, Target, Clock, ChevronRight, Server
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { AGENTS } from '../../data/mockData';
import { computeSustainabilityScore, getStatusColor, getConfidenceScore } from '../../utils/scheduler';

function MetricBar({ label, value, color, icon: Icon }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={11} style={{ color, flexShrink: 0 }} />
      <span className="text-xs text-slate-500 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-8 text-right" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {Math.round(value)}%
      </span>
    </div>
  );
}

function ReasonBadge({ icon: Icon, label, color }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
    >
      <Icon size={11} />
      {label}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    Critical: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
    High: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
    Medium: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
    Low: { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)', text: '#64748b' },
  };
  const c = colors[priority] || colors.Medium;
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      {priority}
    </span>
  );
}

export default function RecommendationPanel() {
  const currentRequest = useAppStore(s => s.currentRequest);
  const servers = useAppStore(s => s.servers);
  const recommendedRackId = useAppStore(s => s.recommendedRackId);
  const selectedPolicy = useAppStore(s => s.selectedPolicy);

  const recommendedServer = servers.find(s => s.id === recommendedRackId);
  const confidence = recommendedServer
    ? getConfidenceScore(computeSustainabilityScore(recommendedServer, selectedPolicy.weights))
    : 0;

  const reasons = recommendedServer
    ? [
        recommendedServer.waterConsumption < 20 && { icon: Droplets, label: 'Low Water Use', color: '#0ea5e9' },
        recommendedServer.carbonScore < 25 && { icon: Wind, label: 'Low Carbon', color: '#10b981' },
        recommendedServer.temperature < 38 && { icon: Thermometer, label: 'Cool Temp', color: '#8b5cf6' },
        recommendedServer.cpu < 60 && { icon: Cpu, label: 'SLA Safe', color: '#f59e0b' },
      ].filter(Boolean)
    : [];

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{
        background: 'rgba(4,9,22,0.98)',
        borderLeft: '1px solid rgba(16,185,129,0.1)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <Target size={13} color="white" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">AI Scheduler</div>
            <div className="text-xs text-slate-500">Recommendation Engine</div>
          </div>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Incoming Request */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(16,185,129,0.12)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Incoming Request</span>
          </div>

          <AnimatePresence mode="wait">
            {currentRequest ? (
              <motion.div
                key={currentRequest.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Request ID</span>
                  <span
                    className="text-xs font-semibold text-blue-300"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {currentRequest.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">AI Model</span>
                  <span className="text-xs font-medium text-white">{currentRequest.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">GPU Required</span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {currentRequest.gpuRequired} vGPUs
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Priority</span>
                  <PriorityBadge priority={currentRequest.priority} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Timestamp</span>
                  <span className="text-xs text-slate-400">
                    {new Date(currentRequest.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{
                        background:
                          currentRequest.status === 'processing' ? '#f59e0b'
                          : currentRequest.status === 'completed' ? '#10b981'
                          : '#3b82f6',
                      }}
                    />
                    <span
                      className="text-xs font-medium capitalize"
                      style={{
                        color:
                          currentRequest.status === 'processing' ? '#f59e0b'
                          : currentRequest.status === 'completed' ? '#10b981'
                          : '#3b82f6',
                      }}
                    >
                      {currentRequest.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-600">
                Awaiting workload...
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Recommendation */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(16,185,129,0.04)',
            border: '1px solid rgba(16,185,129,0.18)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">AI Recommendation</span>
          </div>

          <AnimatePresence mode="wait">
            {recommendedServer ? (
              <motion.div
                key={recommendedServer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <div
                  className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.15)' }}
                  >
                    <Server size={16} color="#10b981" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{recommendedServer.name}</div>
                    <div className="text-xs text-slate-400">{recommendedServer.model}</div>
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Confidence Score</span>
                    <span className="text-xs font-bold text-emerald-400">{confidence}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #059669, #10b981, #34d399)',
                        boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                      }}
                      animate={{ width: `${confidence}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  <MetricBar label="CPU Load" value={recommendedServer.cpu} color="#3b82f6" icon={Cpu} />
                  <MetricBar label="Water Usage" value={(recommendedServer.waterConsumption / 60) * 100} color="#0ea5e9" icon={Droplets} />
                  <MetricBar label="Carbon Score" value={(recommendedServer.carbonScore / 80) * 100} color="#10b981" icon={Wind} />
                  <MetricBar label="Temperature" value={((recommendedServer.temperature - 20) / 45) * 100} color="#8b5cf6" icon={Thermometer} />
                  <MetricBar label="Energy" value={recommendedServer.energyUsage} color="#f59e0b" icon={Zap} />
                </div>

                {/* Reasons */}
                {reasons.length > 0 && (
                  <div>
                    <div className="text-xs text-slate-500 mb-2">Why this data center?</div>
                    <div className="flex flex-wrap gap-1.5">
                      {reasons.map((r, i) => (
                        <ReasonBadge key={i} {...r} />
                      ))}
                    </div>
                  </div>
                )}

                {/* SLA */}
                <div
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}
                >
                  <CheckCircle2 size={14} color="#10b981" />
                  <span className="text-xs text-emerald-300 font-medium">
                    SLA Maintained · Uptime {recommendedServer.uptime}%
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-600 flex flex-col items-center gap-2">
                <AlertCircle size={20} color="#374151" />
                No suitable rack available
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Policy badge */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-lg"
          style={{
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.15)',
          }}
        >
          <div className="flex items-center gap-2">
            <Target size={12} color="#3b82f6" />
            <span className="text-xs text-slate-400">Active Policy</span>
          </div>
          <span className="text-xs font-semibold text-blue-400">{selectedPolicy.label}</span>
        </div>

        {/* Multi-agent system */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(16,185,129,0.12)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full" style={{ background: '#a855f7' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a855f7' }}>
              Multi-Agent System
            </span>
          </div>
          <div className="space-y-2.5">
            {AGENTS.map(agent => (
              <div key={agent.id} className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                  style={{ background: agent.color, boxShadow: `0 0 6px ${agent.color}` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-300">{agent.name}</div>
                  <div className="text-xs text-slate-600 truncate">{agent.role}</div>
                </div>
                <span className="text-xs font-medium flex-shrink-0" style={{ color: agent.color }}>
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

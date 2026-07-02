import { motion } from 'framer-motion';
import DataCenterScene from '../3d/DataCenterScene';
import RecommendationPanel from '../panels/RecommendationPanel';
import ServerDetailModal from '../panels/ServerDetailModal';
import KPICards from '../panels/KPICards';
import useAppStore from '../../store/useAppStore';

export default function DashboardView() {
  const selectedServer = useAppStore(s => s.selectedServer);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Main content: 3D + Recommendation */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Twin */}
        <div className="flex-1 relative overflow-hidden">
          {/* Subtle gradient overlay at top */}
          <div
            className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(4,9,22,0.7), transparent)',
            }}
          />

          {/* Corner label */}
          <div
            className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(4,9,22,0.8)',
              border: '1px solid rgba(16,185,129,0.15)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Live Digital Twin</span>
          </div>

          {/* Hint */}
          <div
            className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(4,9,22,0.75)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-xs text-slate-600">Click a data center to inspect · Scroll to zoom · Drag to orbit</span>
          </div>

          <DataCenterScene />

          {selectedServer && <ServerDetailModal />}
        </div>

        {/* Recommendation panel */}
        <div className="w-72 flex-shrink-0">
          <RecommendationPanel />
        </div>
      </div>

      {/* KPI bar */}
      <div
        className="flex-shrink-0"
        style={{ borderTop: '1px solid rgba(16,185,129,0.1)' }}
      >
        <KPICards />
      </div>
    </div>
  );
}

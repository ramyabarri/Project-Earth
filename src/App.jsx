import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import DashboardView from './components/dashboard/DashboardView';
import SustainabilityView from './components/dashboard/SustainabilityView';
import HumanLoopView from './components/dashboard/HumanLoopView';
import ReportsView from './components/dashboard/ReportsView';
import useAppStore from './store/useAppStore';
import { useSimulation } from './hooks/useSimulation';

const VIEW_MAP = {
  dashboard: DashboardView,
  sustainability: SustainabilityView,
  'human-loop': HumanLoopView,
  reports: ReportsView,
};

export default function App() {
  useSimulation();
  const activeView = useAppStore(s => s.activeView);
  const ActiveView = VIEW_MAP[activeView] || DashboardView;

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020712 0%, #040d1c 50%, #03091a 100%)' }}
    >
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient glow blobs */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
          top: -100,
          left: -100,
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
          bottom: -100,
          right: -100,
        }}
      />

      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <TopNav />

        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <ActiveView />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

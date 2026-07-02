import { create } from 'zustand';
import { INITIAL_SERVERS, SCHEDULING_POLICIES, AI_MODELS, PRIORITIES, KPI_BASELINE } from '../data/mockData';
import {
  recommendServer, getRackStatus, generateRequestId,
  randomBetween, nudgeServer
} from '../utils/scheduler';

const MAX_REQUESTS = 50;

function buildRequest(servers, policy) {
  const weights = policy.weights;
  const { recommended } = recommendServer(servers, weights);
  const model = AI_MODELS[Math.floor(Math.random() * AI_MODELS.length)];
  const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
  return {
    id: generateRequestId(),
    model,
    gpuRequired: randomBetween(2, 64),
    priority,
    timestamp: new Date().toISOString(),
    status: 'pending',
    recommendedRack: recommended?.id ?? null,
  };
}

const useAppStore = create((set, get) => ({
  activeView: 'dashboard',
  servers: INITIAL_SERVERS.map(s => ({ ...s, status: getRackStatus(s) })),
  requests: [],
  currentRequest: null,
  selectedServer: null,
  selectedPolicy: SCHEDULING_POLICIES[0],
  policies: SCHEDULING_POLICIES,
  kpi: { ...KPI_BASELINE },
  notifications: [],
  notifCount: 0,

  setActiveView: (view) => set({ activeView: view }),

  setSelectedServer: (server) => set({ selectedServer: server }),

  setSelectedPolicy: (policy) => {
    set({ selectedPolicy: policy });
    const { servers } = get();
    get()._recomputeRecommendation(servers, policy);
  },

  tickServers: () => {
    const { servers, selectedPolicy, requests } = get();
    const updated = servers.map(nudgeServer).map(s => ({
      ...s,
      status: getRackStatus(s),
    }));

    const { recommended } = recommendServer(updated, selectedPolicy.weights);

    const kpiDelta = {
      waterSaved: +(get().kpi.waterSaved + (Math.random() - 0.3) * 0.5).toFixed(1),
      carbonReduced: +(get().kpi.carbonReduced + (Math.random() - 0.3) * 0.2).toFixed(1),
      coolingCost: Math.round(get().kpi.coolingCost + (Math.random() - 0.5) * 20),
      powerConsumption: +(get().kpi.powerConsumption + (Math.random() - 0.5) * 0.02).toFixed(2),
      currentSLA: Math.min(100, +(get().kpi.currentSLA + (Math.random() - 0.3) * 0.01).toFixed(2)),
      activeRequests: requests.filter(r => r.status === 'processing').length,
    };

    set({
      servers: updated,
      recommendedRackId: recommended?.id ?? null,
      kpi: kpiDelta,
    });
  },

  addRequest: () => {
    const { servers, selectedPolicy, requests } = get();
    const newReq = buildRequest(servers, selectedPolicy);
    const trimmed = [newReq, ...requests].slice(0, MAX_REQUESTS);

    const notif = {
      id: Date.now(),
      message: `New workload: ${newReq.model} [${newReq.priority}]`,
      type: 'info',
      ts: new Date().toLocaleTimeString(),
    };

    set(state => ({
      requests: trimmed,
      currentRequest: newReq,
      notifCount: state.notifCount + 1,
      notifications: [notif, ...state.notifications].slice(0, 20),
    }));

    setTimeout(() => {
      set(state => ({
        requests: state.requests.map(r =>
          r.id === newReq.id ? { ...r, status: 'processing' } : r
        ),
      }));
    }, 1200);

    setTimeout(() => {
      set(state => ({
        requests: state.requests.map(r =>
          r.id === newReq.id ? { ...r, status: 'completed' } : r
        ),
      }));
    }, randomBetween(8000, 20000));
  },

  approveRequest: (reqId) => {
    set(state => ({
      requests: state.requests.map(r =>
        r.id === reqId ? { ...r, status: 'approved' } : r
      ),
    }));
  },

  rejectRequest: (reqId) => {
    set(state => ({
      requests: state.requests.map(r =>
        r.id === reqId ? { ...r, status: 'rejected' } : r
      ),
    }));
  },

  clearNotifications: () => set({ notifCount: 0, notifications: [] }),

  recommendedRackId: null,

  _recomputeRecommendation: (servers, policy) => {
    const { recommended } = recommendServer(servers, policy.weights);
    set({ recommendedRackId: recommended?.id ?? null });
  },
}));

export default useAppStore;

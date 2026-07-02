import { useEffect } from 'react';
import useAppStore from '../store/useAppStore';

export function useSimulation() {
  const tickServers = useAppStore(s => s.tickServers);
  const addRequest = useAppStore(s => s.addRequest);
  const servers = useAppStore(s => s.servers);
  const selectedPolicy = useAppStore(s => s.selectedPolicy);
  const _recomputeRecommendation = useAppStore(s => s._recomputeRecommendation);

  useEffect(() => {
    _recomputeRecommendation(servers, selectedPolicy);
  }, []);

  useEffect(() => {
    const serverTick = setInterval(tickServers, 2000);
    return () => clearInterval(serverTick);
  }, [tickServers]);

  useEffect(() => {
    addRequest();
    const requestTick = setInterval(addRequest, 5000);
    return () => clearInterval(requestTick);
  }, [addRequest]);
}

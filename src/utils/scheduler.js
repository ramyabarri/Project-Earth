export function computeSustainabilityScore(server, weights) {
  const norm = (val, min, max) => (val - min) / (max - min);
  return (
    weights.cpu * norm(server.cpu, 0, 100) +
    weights.water * norm(server.waterConsumption, 0, 60) +
    weights.carbon * norm(server.carbonScore, 0, 80) +
    weights.temp * norm(server.temperature, 20, 65) +
    weights.energy * norm(server.energyUsage, 0, 100)
  );
}

export function recommendServer(servers, weights) {
  let best = null;
  let bestScore = Infinity;

  servers.forEach((server) => {
    if (server.cpu >= 95 || server.gpu >= 95) return;
    const score = computeSustainabilityScore(server, weights);
    if (score < bestScore) {
      bestScore = score;
      best = server;
    }
  });

  return { recommended: best, score: bestScore };
}

export function getRackStatus(server) {
  const score = (server.cpu + server.gpu + server.temperature) / 3;
  if (score < 50) return 'optimal';
  if (score < 75) return 'medium';
  return 'overloaded';
}

export function getStatusColor(status) {
  switch (status) {
    case 'optimal': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'overloaded': return '#ef4444';
    default: return '#6b7280';
  }
}

export function getConfidenceScore(score) {
  const conf = Math.max(0, Math.min(100, Math.round((1 - score) * 100)));
  return conf;
}

export function generateRequestId() {
  const prefix = 'REQ';
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

export function nudgeServer(server) {
  const delta = (v, range, min, max) =>
    Math.min(max, Math.max(min, v + (Math.random() - 0.5) * range));
  return {
    ...server,
    cpu: delta(server.cpu, 8, 5, 99),
    gpu: delta(server.gpu, 8, 5, 99),
    temperature: delta(server.temperature, 3, 20, 65),
    waterConsumption: delta(server.waterConsumption, 4, 5, 60),
    carbonScore: delta(server.carbonScore, 4, 5, 80),
    energyUsage: delta(server.energyUsage, 6, 10, 100),
  };
}

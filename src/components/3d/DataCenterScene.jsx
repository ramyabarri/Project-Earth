import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Lightformer } from '@react-three/drei';
import Terrain from './Terrain';
import DataHall from './DataHall';
import DataCenterBuilding from './DataCenterBuilding';
import Pipes from './Pipes';
import AgentMeetingRoom from './AgentMeetingRoom';
import useAppStore from '../../store/useAppStore';

// Data centers in two rows on the right side of the hall;
// the agent control room occupies the front-left corner.
const DC_POSITIONS = [
  [-1.8, 0, -3.0],
  [1.8, 0, -3.0],
  [5.4, 0, -3.0],
  [-1.8, 0, 3.0],
  [1.8, 0, 3.0],
  [5.4, 0, 3.0],
];

const MEETING_ROOM_POS = [-6.4, 0.12, 2.9];

export default function DataCenterScene() {
  const servers = useAppStore(s => s.servers);
  const recommendedRackId = useAppStore(s => s.recommendedRackId);

  return (
    <Canvas
      camera={{ position: [0, 8, 13.5], fov: 50 }}
      shadows
      gl={{ antialias: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <fog attach="fog" args={['#030b18', 20, 42]} />

        {/* Night-time lighting (fully local — no CDN environment maps) */}
        <hemisphereLight args={['#0e2440', '#04150c', 0.85]} />
        <directionalLight position={[6, 12, 5]} intensity={0.75} color="#b8d4f0" castShadow />
        <directionalLight position={[-8, 6, -6]} intensity={0.25} color="#4a6a8a" />
        <ambientLight intensity={0.12} color="#1a2f4a" />

        <Stars radius={90} depth={40} count={1200} factor={2.5} fade speed={0.5} />

        <Terrain />
        <DataHall />

        {servers.map((server, i) => (
          <DataCenterBuilding
            key={server.id}
            server={server}
            position={DC_POSITIONS[i]}
            isRecommended={server.id === recommendedRackId}
          />
        ))}

        <Pipes positions={DC_POSITIONS} />
        <AgentMeetingRoom position={MEETING_ROOM_POS} />

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={4}
          maxDistance={26}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2 - 0.05}
          target={[0, 0.8, 0]}
          makeDefault
        />

        {/* Procedural environment map (rendered locally — replaces the CDN preset) */}
        <Environment resolution={64} frames={1}>
          <Lightformer intensity={1.6} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} color="#b8d4f0" />
          <Lightformer intensity={0.8} position={[-6, 3, -6]} scale={[8, 4, 1]} color="#38bdf8" />
          <Lightformer intensity={0.8} position={[6, 3, 6]} scale={[8, 4, 1]} color="#34d399" />
          <Lightformer intensity={0.5} position={[8, 2, -4]} scale={[6, 3, 1]} color="#e2e8f0" />
        </Environment>
      </Suspense>
    </Canvas>
  );
}

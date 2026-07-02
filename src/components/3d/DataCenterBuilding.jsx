import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';
import useAppStore from '../../store/useAppStore';
import { getStatusColor } from '../../utils/scheduler';
import { asset, DRACO_PATH, TEXT_FONT } from '../../utils/assets';

const MODEL_URL = asset('models/servers.glb');
const MODEL_SCALE = 2.3; // raw model is ~0.86 x 0.72 x 0.45

export default function DataCenterBuilding({ server, position, isRecommended }) {
  const beaconRef = useRef();
  const lightRef = useRef();
  const ringRef = useRef();
  const setSelectedServer = useAppStore(s => s.setSelectedServer);
  const selectedServer = useAppStore(s => s.selectedServer);
  const [hovered, setHovered] = useState(false);
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH);

  const isSelected = selectedServer?.id === server.id;
  const statusColor = getStatusColor(server.status);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (beaconRef.current) {
      beaconRef.current.material.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.8;
    }
    if (lightRef.current) {
      lightRef.current.intensity = isRecommended
        ? 1.5 + Math.sin(t * 2) * 0.6
        : hovered || isSelected
        ? 0.9
        : 0.3;
    }
    if (ringRef.current && isRecommended) {
      ringRef.current.material.opacity = 0.4 + Math.sin(t * 2.5) * 0.2;
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); setSelectedServer(server); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Server cluster model */}
      <Clone object={scene} scale={MODEL_SCALE} position={[0, 0.12, 0]} />

      {/* Status floor ring */}
      <mesh ref={ringRef} position={[0, 0.135, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.28, 40]} />
        <meshBasicMaterial
          color={statusColor}
          transparent
          opacity={isRecommended ? 0.5 : hovered || isSelected ? 0.4 : 0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Status beacon */}
      <mesh position={[0.95, 1.05, 0.5]}>
        <cylinderGeometry args={[0.014, 0.014, 0.5, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh ref={beaconRef} position={[0.95, 1.34, 0.5]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={1.5} />
      </mesh>

      {/* Status glow light */}
      <pointLight ref={lightRef} position={[0, 1.5, 0]} color={statusColor} intensity={0.3} distance={3.5} />

      {/* Labels */}
      <Text font={TEXT_FONT} position={[0, 2.0, 0]} fontSize={0.14} color="#cbd5e1" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#020712">
        {server.name}
      </Text>
      {isRecommended && (
        <Text font={TEXT_FONT} position={[0, 2.22, 0]} fontSize={0.12} color="#10b981" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#020712">
          RECOMMENDED
        </Text>
      )}
    </group>
  );
}

useGLTF.preload(MODEL_URL, DRACO_PATH);

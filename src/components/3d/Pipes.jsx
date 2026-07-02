import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PIPE_Y = 2.0;      // overhead pipe level, straight runs only
const RISER_BASE = 1.45; // where the vertical risers meet the server clusters
const PIPE_R = 0.04;

function Pulse({ from, to, offset, speed, color }) {
  const ref = useRef();
  const a = useMemo(() => new THREE.Vector3(...from), [from]);
  const b = useMemo(() => new THREE.Vector3(...to), [to]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime * speed + offset) % 1;
    ref.current.position.lerpVectors(a, b, t);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.055, 10, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
    </mesh>
  );
}

function StraightTube({ from, to }) {
  const { mid, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    return { mid, quat, len };
  }, [from, to]);

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[PIPE_R, PIPE_R, len, 10]} />
      <meshStandardMaterial
        color="#155e75"
        emissive="#22d3ee"
        emissiveIntensity={0.35}
        metalness={0.8}
        roughness={0.25}
      />
    </mesh>
  );
}

function Elbow({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[PIPE_R * 1.5, 10, 10]} />
      <meshStandardMaterial color="#1e3a4a" metalness={0.85} roughness={0.2} />
    </mesh>
  );
}

function Pipe({ start, end }) {
  const riserA = [start[0], RISER_BASE, start[2]];
  const topA = [start[0], PIPE_Y, start[2]];
  const topB = [end[0], PIPE_Y, end[2]];
  const riserB = [end[0], RISER_BASE, end[2]];

  return (
    <group>
      {/* vertical risers */}
      <StraightTube from={riserA} to={topA} />
      <StraightTube from={riserB} to={topB} />
      {/* straight overhead run */}
      <StraightTube from={topA} to={topB} />
      {/* elbow joints */}
      <Elbow position={topA} />
      <Elbow position={topB} />
      {/* flanges where risers meet the clusters */}
      {[riserA, riserB].map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.07, 0.07, 0.06, 10]} />
          <meshStandardMaterial color="#1e3a4a" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
      {/* flow pulses along the straight run */}
      <Pulse from={topA} to={topB} offset={0} speed={0.14} color="#67e8f9" />
      <Pulse from={topA} to={topB} offset={0.5} speed={0.14} color="#34d399" />
    </group>
  );
}

// index pairs into the positions array: ring around the hall + one cross-link
const CONNECTIONS = [
  [0, 1], [1, 2],      // back row
  [3, 4], [4, 5],      // front row
  [0, 3], [2, 5],      // sides
  [1, 4],              // center cross-link
];

export default function Pipes({ positions }) {
  return (
    <group>
      {CONNECTIONS.map(([a, b], i) => (
        <Pipe key={i} start={positions[a]} end={positions[b]} />
      ))}
    </group>
  );
}

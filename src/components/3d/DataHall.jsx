import { Grid } from '@react-three/drei';

const ROOM_W = 19;   // x extent
const ROOM_D = 12;   // z extent
const WALL_H = 2.8;
const WALL_T = 0.08;

function Wall({ position, size }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color="#64748b"
          transparent
          opacity={0.1}
          metalness={0.1}
          roughness={0.4}
          depthWrite={false}
        />
      </mesh>
      {/* glowing top edge */}
      <mesh position={[0, size[1] / 2, 0]}>
        <boxGeometry args={[size[0], 0.03, Math.max(size[2], 0.06)]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function CornerPost({ x, z }) {
  return (
    <mesh position={[x, WALL_H / 2 + 0.12, z]}>
      <boxGeometry args={[0.14, WALL_H, 0.14]} />
      <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
    </mesh>
  );
}

function Generator({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.5, 0.9, 0.9]} />
        <meshStandardMaterial color="#b45309" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.93, 0]}>
        <boxGeometry args={[1.55, 0.06, 0.95]} />
        <meshStandardMaterial color="#78350f" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* vents */}
      {[-0.45, -0.15, 0.15, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.45, 0.46]}>
          <boxGeometry args={[0.16, 0.55, 0.01]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
      ))}
      {/* exhaust stack */}
      <mesh position={[0.55, 1.12, -0.25]}>
        <cylinderGeometry args={[0.07, 0.09, 0.4, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

export default function DataHall() {
  const hw = ROOM_W / 2;
  const hd = ROOM_D / 2;

  return (
    <group>
      {/* Foundation slab */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[ROOM_W + 1, 0.12, ROOM_D + 1]} />
        <meshStandardMaterial color="#111a2c" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Tiled floor grid */}
      <Grid
        position={[0, 0.125, 0]}
        args={[ROOM_W, ROOM_D]}
        cellSize={0.65}
        cellThickness={0.4}
        cellColor="#1b2b45"
        sectionSize={2.6}
        sectionThickness={0.8}
        sectionColor="#24405e"
        fadeDistance={40}
        fadeStrength={0}
        infiniteGrid={false}
      />

      {/* Translucent walls */}
      <Wall position={[0, WALL_H / 2 + 0.12, -hd]} size={[ROOM_W, WALL_H, WALL_T]} />
      <Wall position={[0, WALL_H / 2 + 0.12, hd]} size={[ROOM_W, WALL_H, WALL_T]} />
      <Wall position={[-hw, WALL_H / 2 + 0.12, 0]} size={[WALL_T, WALL_H, ROOM_D]} />
      <Wall position={[hw, WALL_H / 2 + 0.12, 0]} size={[WALL_T, WALL_H, ROOM_D]} />

      <CornerPost x={-hw} z={-hd} />
      <CornerPost x={hw} z={-hd} />
      <CornerPost x={-hw} z={hd} />
      <CornerPost x={hw} z={hd} />

      {/* Backup generators (back-left corner) */}
      <Generator position={[-6.8, 0.12, -3.6]} />
      <Generator position={[-6.8, 0.12, -1.6]} />

      {/* Interior ceiling lights (no roof, just fixtures glow) */}
      {[[-5, -2], [0, -2], [5, -2], [-5, 2.5], [0, 2.5], [5, 2.5]].map(([x, z], i) => (
        <pointLight key={i} position={[x, 2.6, z]} intensity={0.22} color="#c8e6ff" distance={6} />
      ))}
    </group>
  );
}

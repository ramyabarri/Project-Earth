import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { AGENTS } from '../../data/mockData';
import { asset, DRACO_PATH, TEXT_FONT } from '../../utils/assets';

const BOT_URL = asset('models/puter-bot.glb');
const BOT_TEXTURE_URL = asset('models/puter-texture.png');
const TABLE_URL = asset('models/meeting-table.glb');

const ROOM_SIZE = 4.6;
const ROOM_H = 2.2;
const TABLE_SCALE = 0.58;       // raw table is ~4.8 x 1.4 x 3.7 (includes chairs)
const BOT_SCALE = 0.68;         // raw bot is ~1.08 tall
const HOLO_Y = 1.35;            // hologram floats above the table
const SPEAK_SECONDS = 3;

function GlassWall({ position, size }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color="#7dd3fc"
          transparent
          opacity={0.07}
          metalness={0.1}
          roughness={0.05}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, size[1] / 2, 0]}>
        <boxGeometry args={[size[0] + 0.04, 0.04, Math.max(size[2], 0.07)]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, -size[1] / 2 + 0.02, 0]}>
        <boxGeometry args={[size[0] + 0.04, 0.05, Math.max(size[2], 0.07)]} />
        <meshStandardMaterial color="#164e63" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function MeetingTable() {
  const { scene } = useGLTF(TABLE_URL, DRACO_PATH);

  const table = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (child.isMesh && child.material?.name === 'emission') {
        child.material = child.material.clone();
        child.material.emissive = new THREE.Color('#22d3ee');
        child.material.emissiveIntensity = 1.1;
        child.material.toneMapped = false;
      }
    });
    return cloned;
  }, [scene]);

  return <primitive object={table} scale={TABLE_SCALE} position={[0, 0.05, 0]} />;
}

function Hologram() {
  const holoRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (holoRef.current) {
      holoRef.current.rotation.y = t * 0.5;
      holoRef.current.position.y = HOLO_Y + Math.sin(t * 1.2) * 0.04;
    }
  });
  return (
    <group>
      <group ref={holoRef} position={[0, HOLO_Y, 0]}>
        <mesh>
          <icosahedronGeometry args={[0.22, 1]} />
          <meshBasicMaterial color="#34d399" wireframe transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.005, 8, 40]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
        </mesh>
      </group>
      {/* light cone from the table surface up to the hologram */}
      <mesh position={[0, HOLO_Y - 0.28, 0]}>
        <coneGeometry args={[0.42, 0.5, 24, 1, true]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight position={[0, HOLO_Y, 0]} color="#22d3ee" intensity={0.8} distance={3.5} />
    </group>
  );
}

function ChatDots({ color }) {
  const refs = [useRef(), useRef(), useRef()];
  useFrame(({ clock }) => {
    refs.forEach((r, i) => {
      if (r.current) {
        const pulse = Math.sin(clock.elapsedTime * 5 - i * 0.9);
        r.current.scale.setScalar(0.7 + Math.max(0, pulse) * 0.6);
      }
    });
  });
  return (
    <group>
      {[-0.09, 0, 0.09].map((x, i) => (
        <mesh key={i} ref={refs[i]} position={[x, 0, 0]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// bots stand at the four corners of the table, facing the center
const BOT_POSITIONS = [
  [1.75, 0, 1.4],
  [-1.75, 0, 1.4],
  [-1.75, 0, -1.4],
  [1.75, 0, -1.4],
];

function AgentBot({ agent, index, isSpeaking }) {
  const groupRef = useRef();
  const { scene } = useGLTF(BOT_URL, DRACO_PATH);
  const texture = useTexture(BOT_TEXTURE_URL);

  const bot = useMemo(() => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    const cloned = scene.clone(true);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.55,
      metalness: 0.25,
      emissive: new THREE.Color(agent.color),
      emissiveIntensity: 0.08,
    });
    cloned.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) child.material = material;
    });
    return cloned;
  }, [scene, texture, agent.color]);

  const basePos = BOT_POSITIONS[index];
  const faceCenter = Math.atan2(basePos[0], basePos[2]) + Math.PI;

  // beam from the bot's head toward the hologram
  const beam = useMemo(() => {
    const from = new THREE.Vector3(basePos[0], 0.75, basePos[2]);
    const to = new THREE.Vector3(0, HOLO_Y, 0);
    const dir = to.clone().sub(from);
    const len = dir.length();
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    return { mid, quat, len };
  }, [basePos]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      // subtle idle bob; the speaker leans in slightly
      groupRef.current.position.y = Math.sin(t * 1.6 + index * 1.7) * 0.02;
      groupRef.current.scale.setScalar(isSpeaking ? 1.05 : 1);
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <group position={basePos} rotation={[0, faceCenter, 0]}>
          <primitive object={bot} scale={BOT_SCALE} />
          {/* colored identity ring under the bot */}
          <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.28, 0.34, 28]} />
            <meshBasicMaterial
              color={agent.color}
              transparent
              opacity={isSpeaking ? 0.75 : 0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
          {isSpeaking && (
            <group position={[0, 0.95, 0]}>
              <ChatDots color={agent.color} />
            </group>
          )}
          <pointLight position={[0, 0.6, 0]} color={agent.color} intensity={isSpeaking ? 1.1 : 0.4} distance={2.2} />
          <Text
            font={TEXT_FONT}
            position={[0, 0.82, 0]}
            fontSize={0.09}
            color={agent.color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.006}
            outlineColor="#020712"
          >
            {agent.name}
          </Text>
        </group>
      </group>

      {/* speaking beam to the hologram */}
      {isSpeaking && (
        <mesh position={beam.mid} quaternion={beam.quat}>
          <cylinderGeometry args={[0.012, 0.012, beam.len, 6]} />
          <meshBasicMaterial color={agent.color} transparent opacity={0.35} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export default function AgentMeetingRoom({ position }) {
  const [speaker, setSpeaker] = useState(0);

  useFrame(({ clock }) => {
    const idx = Math.floor(clock.elapsedTime / SPEAK_SECONDS) % AGENTS.length;
    if (idx !== speaker) setSpeaker(idx);
  });

  const half = ROOM_SIZE / 2;

  return (
    <group position={position}>
      {/* Room floor pad */}
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[ROOM_SIZE, 0.03, ROOM_SIZE]} />
        <meshStandardMaterial color="#0e2233" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Glass walls */}
      <GlassWall position={[0, ROOM_H / 2, -half]} size={[ROOM_SIZE, ROOM_H, 0.05]} />
      <GlassWall position={[0, ROOM_H / 2, half]} size={[ROOM_SIZE, ROOM_H, 0.05]} />
      <GlassWall position={[-half, ROOM_H / 2, 0]} size={[0.05, ROOM_H, ROOM_SIZE]} />
      <GlassWall position={[half, ROOM_H / 2, 0]} size={[0.05, ROOM_H, ROOM_SIZE]} />

      <MeetingTable />
      <Hologram />

      {AGENTS.map((agent, i) => (
        <AgentBot key={agent.id} agent={agent} index={i} isSpeaking={speaker === i} />
      ))}

      {/* Room label */}
      <Text font={TEXT_FONT} position={[0, ROOM_H + 0.35, 0]} fontSize={0.16} color="#22d3ee" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#020712">
        AGENT CONTROL ROOM
      </Text>
    </group>
  );
}

useGLTF.preload(BOT_URL, DRACO_PATH);
useGLTF.preload(TABLE_URL, DRACO_PATH);

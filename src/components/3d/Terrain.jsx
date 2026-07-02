import { useMemo } from 'react';
import * as THREE from 'three';

// Rolling land, flattened where the data center campus sits
export function heightAt(x, z) {
  const h =
    Math.sin(x * 0.35) * Math.cos(z * 0.45) * 0.6 +
    Math.sin(x * 0.9 + 1.7) * Math.sin(z * 0.8 + 0.6) * 0.3 +
    Math.cos(x * 1.7 + 4.0) * 0.12;

  const fx = Math.max(0, Math.abs(x) - 10.2);
  const fz = Math.max(0, Math.abs(z) - 6.8);
  const d = Math.sqrt(fx * fx + fz * fz);
  const w = Math.min(1, d / 2.5);
  return Math.max(-0.35, h) * w * w;
}

function pseudoRandom(i) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function Land() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(38, 30, 76, 60);
    const pos = geo.attributes.position;
    const colors = [];
    const c = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const wx = pos.getX(i);
      const wz = -pos.getY(i);
      const h = heightAt(wx, wz);
      pos.setZ(i, h);

      const jitter = pseudoRandom(i) * 0.035;
      const lift = Math.max(0, h) * 0.16;
      // dark grassy green, lighter on hills, hint of earth in dips
      c.setRGB(
        0.055 + lift * 0.5 + jitter * 0.6,
        0.16 + lift * 1.4 + jitter,
        0.085 + lift * 0.55 + jitter * 0.5,
      );
      colors.push(c.r, c.g, c.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.95} metalness={0} />
    </mesh>
  );
}

function Tree({ x, z, scale = 1 }) {
  const y = heightAt(x, z);
  return (
    <group position={[x, y, z]} scale={scale}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.18, 5]} />
        <meshStandardMaterial color="#3d2b1f" roughness={1} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <coneGeometry args={[0.2, 0.42, 6]} />
        <meshStandardMaterial color="#1c4a2e" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <coneGeometry args={[0.13, 0.3, 6]} />
        <meshStandardMaterial color="#236038" flatShading roughness={0.9} />
      </mesh>
    </group>
  );
}

function Rock({ x, z, scale = 1 }) {
  const y = heightAt(x, z);
  return (
    <mesh position={[x, y + 0.05 * scale, z]} scale={scale} rotation={[0.4, 1.2, 0.2]}>
      <icosahedronGeometry args={[0.12, 0]} />
      <meshStandardMaterial color="#334155" flatShading roughness={0.9} />
    </mesh>
  );
}

const TREES = [
  [-12.5, -8.5, 1.3], [-13.5, 0.5, 1.1], [-12.5, 6.5, 1.4], [-15, -4, 1.0],
  [12, -8, 1.2], [13, 1.5, 1.35], [12.5, 7.5, 1.1], [15, -3.5, 1.25],
  [-4, -9.5, 1.2], [4.5, -10, 1.35], [0.5, 10.5, 1.2], [-7, 9.5, 1.1],
  [7, 10, 1.3], [-15.5, 5, 1.15], [15.5, 6, 1.2], [14.5, -7, 1.1],
];

const ROCKS = [
  [-11.5, -7.5, 1.4], [11.5, 9, 1.2], [-13, 8, 1.6], [13.5, -5.5, 1.1], [2, -11, 1.5],
];

export default function Terrain() {
  return (
    <group>
      <Land />
      {TREES.map(([x, z, s], i) => <Tree key={i} x={x} z={z} scale={s} />)}
      {ROCKS.map(([x, z, s], i) => <Rock key={i} x={x} z={z} scale={s} />)}
    </group>
  );
}

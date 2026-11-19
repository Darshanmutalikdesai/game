import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { useFrame } from '@react-three/fiber'
import { LINES, traffic } from './shared'
import { rng } from './terrain'

// side profile [z (length), y (height)] -> extruded across the width, length along +Z (front = +Z)
function extrude(pts, width) {
  const s = new THREE.Shape()
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
  const g = new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: false })
  g.translate(0, 0, -width / 2); g.rotateY(-Math.PI / 2)
  return g
}

// ---------- hero car: white wedge sports car with red stripes (Testarossa-inspired, original model) ----------
export function SportsCar() {
  const body = useMemo(() => extrude([[2.35, 0.45], [2.35, 0.78], [1.3, 0.95], [0.45, 1.08], [-0.3, 1.38], [-1.0, 1.38], [-1.7, 1.02], [-2.3, 0.98], [-2.3, 0.45]], 2), [])
  const sideGlass = useMemo(() => {
    const s = new THREE.Shape(); [[0.35, 1.1], [-0.25, 1.34], [-1.0, 1.34], [-1.45, 1.04]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
    return new THREE.ShapeGeometry(s).rotateY(-Math.PI / 2)
  }, [])
  const white = <meshPhysicalMaterial color="#f4f1ea" clearcoat={1} clearcoatRoughness={0.1} roughness={0.35} metalness={0.2} />
  const red = <meshStandardMaterial color="#b3182a" roughness={0.4} metalness={0.2} />
  const glass = <meshStandardMaterial color="#10151c" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
  const dark = <meshStandardMaterial color="#111114" roughness={0.8} />
  return (
    <group>
      <mesh geometry={body}>{white}</mesh>
      <mesh position={[0, 0.36, 0]}><boxGeometry args={[1.9, 0.18, 4.4]} />{dark}</mesh>
      <mesh position={[0, 0.6, 0]}><boxGeometry args={[2.02, 0.16, 4.5]} />{red}</mesh>
      <mesh position={[0, 1.245, 0.075]} rotation-x={0.38}><boxGeometry args={[1.7, 0.03, 0.8]} />{glass}</mesh>
      <mesh position={[0, 1.2, -1.35]} rotation-x={-0.475}><boxGeometry args={[1.7, 0.03, 0.78]} />{glass}</mesh>
      <mesh geometry={sideGlass} position-x={1.006}>{glass}</mesh>
      <mesh geometry={sideGlass} position-x={-1.006}>{glass}</mesh>
      {[-0.25, 0.25].map((x) => (<mesh key={x} position={[x, 0.875, 1.78]} rotation-x={0.17}><boxGeometry args={[0.13, 0.012, 1.3]} />{red}</mesh>))}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 1.012, 0.85, -1.2]}><boxGeometry args={[0.04, 0.3, 1.0]} />{dark}</mesh>
          <mesh position={[s * 1.06, 1.1, 0.4]}><boxGeometry args={[0.18, 0.12, 0.1]} />{white}</mesh>
          <mesh position={[s * 0.62, 0.66, 2.36]}><boxGeometry args={[0.45, 0.08, 0.02]} /><meshStandardMaterial color="#fff3c8" emissive="#fff3c8" emissiveIntensity={3} toneMapped={false} /></mesh>
          <mesh position={[s * 0.86, 0.52, 2.36]}><boxGeometry args={[0.2, 0.1, 0.02]} /><meshStandardMaterial color="#ffb400" emissive="#ffb400" emissiveIntensity={2.5} toneMapped={false} /></mesh>
          {[1.45, -1.45].map((z) => (
            <group key={z} position={[s * 0.97, 0.37, z]} rotation-z={Math.PI / 2}>
              <mesh><cylinderGeometry args={[0.37, 0.37, z < 0 ? 0.36 : 0.3, 20]} /><meshStandardMaterial color="#0d0d0f" roughness={0.9} /></mesh>
              <mesh position-y={s * 0.03}><cylinderGeometry args={[0.24, 0.24, z < 0 ? 0.38 : 0.32, 16]} /><meshStandardMaterial color="#c9ccd2" metalness={1} roughness={0.25} /></mesh>
            </group>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.55, 2.36]}><boxGeometry args={[0.7, 0.12, 0.02]} />{dark}</mesh>
      <mesh position={[0, 0.9, -2.31]}><boxGeometry args={[1.9, 0.12, 0.03]} /><meshStandardMaterial color="#ff2030" emissive="#ff1020" emissiveIntensity={2.5} toneMapped={false} /></mesh>
    </group>
  )
}

// ---------- AI traffic (instanced) ----------
const SEDAN = [[2.2, 0.5], [2.2, 0.85], [1.3, 0.95], [0.7, 1.0], [0.4, 1.5], [-0.9, 1.5], [-1.3, 1.0], [-2.2, 0.95], [-2.2, 0.5]]
const PALETTE = ['#e63946', '#f1faee', '#ffd166', '#06d6a0', '#118ab2', '#ff7b9c', '#c77dff', '#2b2d42', '#f4a261', '#8d99ae']
const _d = new THREE.Object3D()

export function Traffic({ count = 46 }) {
  const body = useRef(), dark = useRef()
  const [bg, dg] = useMemo(() => {
    const parts = [new THREE.BoxGeometry(1.96, 0.4, 1.2).translate(0, 1.25, -0.25)]
    for (const x of [-0.95, 0.95]) for (const z of [-1.4, 1.4]) parts.push(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 12).rotateZ(Math.PI / 2).translate(x, 0.36, z))
    return [extrude(SEDAN, 1.9), mergeGeometries(parts)]
  }, [])
  const cars = useMemo(() => {
    const Q = rng(33)
    return Array.from({ length: count }, () => ({ axis: Q() < 0.5 ? 'x' : 'z', L: LINES[(Q() * 5) | 0], dir: Q() < 0.5 ? 1 : -1, t: (Q() - 0.5) * 580, speed: 9 + Q() * 7, x: 0, z: 0, color: PALETTE[(Q() * PALETTE.length) | 0] }))
  }, [count])
  useLayoutEffect(() => {
    const c = new THREE.Color()
    cars.forEach((k, i) => body.current.setColorAt(i, c.set(k.color)))
    body.current.instanceColor.needsUpdate = true
  }, [cars])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    cars.forEach((c, i) => {
      c.t += c.dir * c.speed * dt
      if (c.t > 295) c.t = -295; else if (c.t < -295) c.t = 295
      const h = c.axis === 'z' ? (c.dir > 0 ? 0 : Math.PI) : c.dir > 0 ? Math.PI / 2 : -Math.PI / 2
      const bx = c.axis === 'z' ? c.L : c.t, bz = c.axis === 'z' ? c.t : c.L
      c.x = bx - Math.cos(h) * 3.5; c.z = bz + Math.sin(h) * 3.5 // right-hand traffic
      _d.position.set(c.x, 0, c.z); _d.rotation.set(0, h, 0); _d.updateMatrix()
      body.current.setMatrixAt(i, _d.matrix); dark.current.setMatrixAt(i, _d.matrix)
      traffic[i] = c
    })
    body.current.instanceMatrix.needsUpdate = true; dark.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <instancedMesh ref={body} args={[bg, null, count]} castShadow frustumCulled={false}><meshPhysicalMaterial clearcoat={1} roughness={0.4} metalness={0.3} /></instancedMesh>
      <instancedMesh ref={dark} args={[dg, null, count]} castShadow frustumCulled={false}><meshStandardMaterial color="#111318" roughness={0.6} /></instancedMesh>
    </>
  )
}

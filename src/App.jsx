import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sky, Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { ZONES, PROFILE } from './data'
import { useGame } from './store'
import { carPos, SUN, traffic, mission } from './shared'
import { music } from './music'
import { heightAt } from './terrain'
import { City, Terrain, Water, Trees, Forest, Sun, makeCity, makeStreetTrees } from './World'
import { SportsCar, Traffic } from './Vehicles'
import { Character, Crowd } from './People'

const keys = {}
let fPressed = false
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

// ---------- player: drive the car OR walk (F to enter / exit) ----------
function Controller({ colliders }) {
  const carRef = useRef(), manRef = useRef(), speed = useRef(0), mini = useRef(null)
  const S = useRef({ mode: 'car', c: { x: -3.5, z: -14, h: 0, v: 0 }, p: { x: 0, z: 0, h: 0, v: 0 } })

  useEffect(() => {
    const down = (e) => {
      keys[e.code] = true
      const g = useGame.getState()
      if (e.code === 'KeyE') (g.panel ? g.close() : g.open())
      if (e.code === 'Escape') g.close()
      if (e.code === 'KeyM' && !e.repeat) music.toggle()
      if (e.code === 'KeyN' && !e.repeat) music.next()
      if (e.code === 'KeyF' && !e.repeat) fPressed = true
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault()
    }
    const up = (e) => { keys[e.code] = false }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    ;[carRef, manRef].forEach((r) => r.current.traverse((o) => { if (o.isMesh) o.castShadow = true }))
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  const resolve = (e, r, isCar) => {
    for (const b of colliders) {
      const dx = e.x - b.x, dz = e.z - b.z
      if (Math.abs(dx) > b.w / 2 + r || Math.abs(dz) > b.d / 2 + r) continue
      const px = b.w / 2 + r - Math.abs(dx), pz = b.d / 2 + r - Math.abs(dz)
      if (px < pz) e.x += Math.sign(dx || 1) * px; else e.z += Math.sign(dz || 1) * pz
      if (isCar) e.v *= 0.9
    }
    if (isCar) for (const t of traffic) {
      if (!t) continue
      const dx = e.x - t.x, dz = e.z - t.z, d = Math.hypot(dx, dz)
      if (d < 3.2 && d > 0) { e.x += (dx / d) * (3.2 - d); e.z += (dz / d) * (3.2 - d); e.v *= 0.7 }
    }
    e.x = clamp(e.x, -310, 310); e.z = clamp(e.z, -310, 322)
  }

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05), st = S.current, { c, p } = st, g = useGame.getState()
    const locked = !!g.panel || g.passed
    music.mood(st.mode === 'car', !!g.panel, g.passed)
    const fwd = locked ? 0 : ((keys.KeyW || keys.ArrowUp) ? 1 : 0) - ((keys.KeyS || keys.ArrowDown) ? 1 : 0)
    const turn = locked ? 0 : ((keys.KeyA || keys.ArrowLeft) ? 1 : 0) - ((keys.KeyD || keys.ArrowRight) ? 1 : 0)

    if (fPressed) {
      fPressed = false
      if (!locked) {
        if (st.mode === 'car') { st.mode = 'foot'; p.x = c.x + Math.cos(c.h) * 2.6; p.z = c.z - Math.sin(c.h) * 2.6; p.h = c.h; p.v = 0 }
        else if (Math.hypot(p.x - c.x, p.z - c.z) < 5) st.mode = 'car'
      }
    }
    if (g.mode !== st.mode) g.setMode(st.mode)

    // car physics (keeps braking when the player is on foot)
    const driving = st.mode === 'car'
    const thr = driving ? fwd : 0, steer = driving ? turn : 0
    if (thr > 0) c.v += 22 * dt; else if (thr < 0) c.v -= (c.v > 0 ? 40 : 14) * dt
    c.v -= c.v * (thr === 0 ? 1.2 : 0.25) * dt
    if (keys.Space || !driving) c.v *= 1 - 3 * dt
    c.v = clamp(c.v, -12, 38)
    c.h += steer * 1.9 * dt * clamp(c.v / 8, -1, 1)
    c.x += Math.sin(c.h) * c.v * dt; c.z += Math.cos(c.h) * c.v * dt
    resolve(c, 1.7, true)

    // walking
    if (!driving) {
      const target = fwd * (keys.ShiftLeft || keys.ShiftRight ? 7.5 : 3.4)
      p.v += (target - p.v) * Math.min(1, 10 * dt)
      p.h += turn * 2.6 * dt
      p.x += Math.sin(p.h) * p.v * dt; p.z += Math.cos(p.h) * p.v * dt
      resolve(p, 0.5, false)
    }

    const yc = heightAt(c.x, c.z), yp = heightAt(p.x, p.z)
    carRef.current.position.set(c.x, yc, c.z); carRef.current.rotation.y = c.h
    manRef.current.visible = !driving
    manRef.current.position.set(p.x, yp, p.z); manRef.current.rotation.y = p.h
    speed.current = driving ? 0 : Math.abs(p.v)

    const e = driving ? c : p, ye = driving ? yc : yp
    carPos.x = e.x; carPos.z = e.z
    const sn = Math.sin(e.h), cs = Math.cos(e.h)
    const back = driving ? 10 : 5, up = driving ? 5 : 2.8, look = driving ? 4 : 2
    state.camera.position.lerp({ x: e.x - sn * back, y: ye + up, z: e.z - cs * back }, 1 - Math.exp(-5 * dt))
    state.camera.lookAt(e.x + sn * look, ye + 1.5, e.z + cs * look)

    const near = !driving && Math.hypot(p.x - c.x, p.z - c.z) < 5
    if (g.nearCar !== near) g.setNear(near)
    // ---- missions: track the current objective, unlock the chapter when its ring is reached ----
    const cur = ZONES[g.step], M = cur && cur.mission
    if (mission.step !== g.step) { mission.step = g.step; mission.timeLeft = M && M.type === 'time' ? M.secs : 0 }
    if (M) {
      if (M.type === 'speed' && driving && !g.fast && Math.abs(c.v) * 3.6 >= M.kmh) g.setFast(true)
      if (M.type === 'orbs') M.orbs.forEach(([ox, oz], i) => { if (!g.got.includes(i) && Math.hypot(ox - e.x, oz - e.z) < 4.5) g.collect(i) })
      if (M.type === 'time' && !locked) {
        mission.timeLeft -= dt
        if (mission.timeLeft <= 0) { mission.timeLeft = M.secs; g.say("TIME'S UP · timer restarted, try again!") }
        const tm = document.getElementById('tmr'); if (tm) tm.textContent = Math.ceil(mission.timeLeft)
      }
    }
    const zn = ZONES.find((z) => Math.hypot(z.marker[0] - e.x, z.marker[1] - e.z) < 5.5)
    const id = zn ? zn.id : null
    if (g.zone !== id) g.setZone(id)
    if (zn && cur && zn.id === cur.id) {
      const gs = useGame.getState()
      const ok = M.type === 'drive' ? driving : M.type === 'walk' ? !driving : M.type === 'speed' ? gs.fast && driving : M.type === 'orbs' ? gs.got.length >= M.orbs.length : true
      if (ok) gs.unlock(ZONES.indexOf(cur))
    }

    // HUD: speed + minimap
    const spd = document.getElementById('spd')
    if (spd) spd.textContent = Math.round(Math.abs(driving ? c.v : p.v) * 3.6)
    if (!mini.current) mini.current = document.getElementById('mini')
    const cv = mini.current
    if (cv) {
      const gx = cv.getContext('2d'), Sz = cv.width, M = Sz / 2, sc = 0.4
      gx.clearRect(0, 0, Sz, Sz)
      const toMap = (x, z) => {
        const dx = x - e.x, dz = z - e.z
        let mx = -dx * cs + dz * sn, my = -(dx * sn + dz * cs)
        const d = Math.hypot(mx, my) * sc, max = M - 8
        if (d > max) { mx *= max / d; my *= max / d } else { mx *= sc; my *= sc }
        return [M + mx, M + my]
      }
      gx.fillStyle = '#666'
      colliders.forEach((b) => { if (!b.zone && !b.tree) { const [x, y] = toMap(b.x, b.z); gx.fillRect(x - 2, y - 2, 4, 4) } })
      gx.fillStyle = '#ff5050'
      traffic.forEach((t) => { if (t && Math.hypot(t.x - e.x, t.z - e.z) < 150) { const [x, y] = toMap(t.x, t.z); gx.fillRect(x - 1.5, y - 1.5, 3, 3) } })
      if (!driving) { gx.fillStyle = '#4dc9ff'; const [x, y] = toMap(c.x, c.z); gx.fillRect(x - 3, y - 3, 6, 6) }
      ZONES.forEach((z, i) => {
        const [x, y] = toMap(z.marker[0], z.marker[1]), now = i === g.step
        gx.fillStyle = i <= g.step ? z.color : '#555'; gx.beginPath(); gx.arc(x, y, now ? 7 : 5, 0, 7); gx.fill()
        if (now) { gx.strokeStyle = '#fff'; gx.lineWidth = 2; gx.stroke() }
      })
      if (M && M.type === 'orbs') { gx.fillStyle = '#fff'; M.orbs.forEach(([ox, oz], i) => { if (!g.got.includes(i)) { const [x, y] = toMap(ox, oz); gx.beginPath(); gx.arc(x, y, 3, 0, 7); gx.fill() } }) }
      gx.fillStyle = '#fff'; gx.beginPath(); gx.moveTo(M, M - 8); gx.lineTo(M + 6, M + 7); gx.lineTo(M - 6, M + 7); gx.fill()
    }
  })

  return (
    <>
      <group ref={carRef}><SportsCar /></group>
      <group ref={manRef}><Character speedRef={speed} /></group>
    </>
  )
}

// ---------- floating collectable orbs for the "orbs" mission ----------
function Orbs() {
  const step = useGame((s) => s.step), got = useGame((s) => s.got), ref = useRef()
  const z = ZONES[step], M = z && z.mission
  useFrame(({ clock }) => { if (ref.current) ref.current.children.forEach((o, i) => { o.position.y = 2 + Math.sin(clock.elapsedTime * 2.5 + i) * 0.45; o.rotation.y = clock.elapsedTime }) })
  if (!M || M.type !== 'orbs') return null
  return (
    <group ref={ref}>
      {M.orbs.map(([x, zz], i) => got.includes(i) ? null : (
        <group key={i} position={[x, 2, zz]}>
          <mesh><icosahedronGeometry args={[0.9, 1]} /><meshBasicMaterial color={z.color} toneMapped={false} /></mesh>
          <mesh position-y={-1}><cylinderGeometry args={[0.15, 0.15, 30, 8, 1, true]} /><meshBasicMaterial color={z.color} transparent opacity={0.25} depthWrite={false} /></mesh>
        </group>
      ))}
    </group>
  )
}

// short original victory jingle (WebAudio, no files needed)
function passJingle() {
  try {
    const A = new (window.AudioContext || window.webkitAudioContext)(), t0 = A.currentTime + 0.05
    ;[[392, 0], [523.25, 0.18], [659.25, 0.36], [783.99, 0.54], [1046.5, 0.8]].forEach(([f, d], i, a) => {
      const o = A.createOscillator(), g = A.createGain(), last = i === a.length - 1
      o.type = 'triangle'; o.frequency.value = f
      g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(0.25, t0 + d + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + (last ? 1.6 : 0.3))
      o.connect(g).connect(A.destination); o.start(t0 + d); o.stop(t0 + d + (last ? 1.7 : 0.35))
    })
  } catch (e) { /* audio blocked: ignore */ }
}

// ---------- HUD ----------
function Hud() {
  const { zone, panel, close, mode, nearCar, step, got, fast, banner, passed } = useGame()
  useEffect(() => { if (passed) passJingle() }, [passed])
  const [radio, setRadio] = useState({ on: music.isOn(), name: music.getName() })
  useEffect(() => { music.arm(); return music.subscribe(setRadio) }, [])
  const z = ZONES.find((q) => q.id === zone)
  const zi = ZONES.findIndex((q) => q.id === zone)
  const p = ZONES.find((q) => q.id === panel)
  const cur = ZONES[step], M = cur && cur.mission
  return (
    <div className="hud">
      <div className="mission" style={{ borderColor: cur ? cur.color : '#7dff6b' }}>
        <b style={{ color: cur ? cur.color : '#7dff6b' }}>{cur ? `MISSION ${step + 1} / ${ZONES.length} · ${cur.title}` : 'ALL CHAPTERS UNLOCKED'}</b>
        <span>{cur ? M.text : 'You found everything! Drive to any ring and press E to read a chapter again.'}</span>
        {M && M.type === 'orbs' && <em>Orbs collected: {got.length} / {M.orbs.length}</em>}
        {M && M.type === 'speed' && <em>{fast ? '✔ Speed reached — now go to the ring' : `Reach ${M.kmh} km/h in the car`}</em>}
        {M && M.type === 'time' && <em>Time left: <span id="tmr">{M.secs}</span>s</em>}
        <div className="chips">{ZONES.map((q, i) => <i key={q.id} className={i < step ? 'on' : i === step ? 'now' : ''} style={{ '--c': q.color }}>{i < step ? '✔ ' : '🔒 '}{q.title}</i>)}</div>
      </div>
      {banner && <div className="banner" key={banner}>{banner}</div>}
      {passed && (
        <div className="passed">
          <div className="bar top" /><div className="bar bot" />
          <div className="pwrap">
            <h1>mission passed!</h1>
            <h2>ALL {ZONES.length} CHAPTERS UNLOCKED</h2>
            <p>{PROFILE.name} · {PROFILE.role}</p>
            <div className="pchips">{ZONES.map((q) => <i key={q.id} style={{ background: q.color }}>✔ {q.title}</i>)}</div>
          </div>
        </div>
      )}
      <a className="skip" href={PROFILE.fallbackUrl}>Skip to normal portfolio →</a>
      <button className="musicbtn" onClick={() => music.toggle()}>{radio.on ? '♪ ' + (radio.name || 'RADIO') : '♪ MUSIC OFF'} <small>· N next · M mute</small></button>
      <canvas id="mini" width="150" height="150" className="mini" />
      <div className="speed"><span id="spd">0</span><small>KM/H</small></div>
      <div className="keys">W A S D move · SHIFT run · SPACE brake · F {mode === 'car' ? 'exit car' : 'enter car'} · E interact · N next song · M mute · ESC close</div>
      {z && !p && zi < step && <div className="prompt" style={{ borderColor: z.color }}>Press <b>E</b> to view {z.title}</div>}
      {z && !p && zi === step && <div className="prompt" style={{ borderColor: z.color }}>🔒 {z.title} is locked — {z.mission.text}</div>}
      {z && !p && zi > step && <div className="prompt" style={{ borderColor: '#666' }}>🔒 {z.title} is locked — finish mission {step + 1} first</div>}
      {!z && !p && mode === 'foot' && nearCar && <div className="prompt">Press <b>F</b> to enter car</div>}
      {p && (
        <div className="panel" style={{ borderColor: p.color }}>
          <h2 style={{ color: p.color }}>{p.title}</h2>
          {p.items.map((it, i) => (
            <div className="item" key={i}>
              <h3>{it.link ? <a href={it.link} target="_blank" rel="noreferrer">{it.t} ↗</a> : it.t}</h3>
              <p>{it.d}</p>
              {it.bar && <div className="bar"><i style={{ width: it.bar + '%', background: p.color }} /></div>}
            </div>
          ))}
          <button onClick={close}>Close (E)</button>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const buildings = useMemo(makeCity, [])
  const trees = useMemo(() => makeStreetTrees(buildings), [buildings])
  const colliders = useMemo(() => buildings.concat(trees.palms.concat(trees.parks).map((t) => ({ x: t.x, z: t.z, w: 1.2, d: 1.2, tree: true }))), [buildings, trees])
  return (
    <>
      <Canvas shadows camera={{ fov: 60, near: 0.5, far: 2500, position: [-3.5, 6, -26] }} dpr={[1, 1.5]} gl={{ antialias: false }}>
        <color attach="background" args={['#d4a982']} />
        <fogExp2 attach="fog" args={['#d4a982', 0.0022]} />
        <Sky sunPosition={SUN} turbidity={6} rayleigh={1.5} mieCoefficient={0.005} mieDirectionalG={0.85} />
        <hemisphereLight args={['#a8c8ff', '#4a5a30', 0.45]} />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={4} color="#ffb070" position={[40, 20, 30]} scale={[60, 30, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#8fb8ff" position={[0, 40, 0]} scale={[80, 80, 1]} />
        </Environment>
        <Sun />
        <Terrain />
        <Water />
        <City buildings={buildings} />
        <Trees list={trees.palms} kind="palm" />
        <Trees list={trees.parks} kind="round" />
        <Forest />
        <Traffic />
        <Crowd />
        <Orbs />
        <Controller colliders={colliders} />
        <EffectComposer multisampling={4}>
          <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.2} intensity={0.6} mipmapBlur />
          <Vignette offset={0.3} darkness={0.55} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>
      <Hud />
    </>
  )
}

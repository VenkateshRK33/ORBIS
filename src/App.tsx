import { FormEvent, Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls, Stars, useTexture } from '@react-three/drei'
import * as THREE from 'three'

type View = 'system' | 'earth'

const planets = [
  { name: 'Mercury', radius: 1.15, orbit: 7, size: 0.28, color: '#aaa49a', speed: 1.35 },
  { name: 'Venus', radius: 1.35, orbit: 10, size: 0.4, color: '#e0aa69', speed: 1.05 },
  { name: 'Earth', radius: 1.5, orbit: 13, size: 0.48, color: '#f30f0f', speed: 0.82 },
  { name: 'Mars', radius: 1.2, orbit: 16, size: 0.34, color: '#d16a48', speed: 0.68 },
  { name: 'Jupiter', radius: 2.2, orbit: 21, size: 1.15, color: '#c79a75', speed: 0.45 },
  { name: 'Saturn', radius: 1.7, orbit: 27, size: 0.95, color: '#d5b27e', speed: 0.34 },
  { name: 'Uranus', radius: 1.2, orbit: 33, size: 0.6, color: '#88d1d8', speed: 0.26 },
  { name: 'Neptune', radius: 1.1, orbit: 39, size: 0.58, color: '#5d78dd', speed: 0.2 },
]

function Sun() {
  return (
    <group>
      <pointLight intensity={130} distance={140} color="#1815db" />
      <Html position={[0, 2.8, 0]} center distanceFactor={40}>
        <span className="scene-label sun-label">SUN / LIGHT SOURCE</span>
      </Html>
      <mesh>
        <sphereGeometry args={[2.1, 48, 48]} />
        <meshBasicMaterial color="#ffca68" />
      </mesh>
      <mesh scale={1.18}>
        <sphereGeometry args={[2.1, 32, 32]} />
        <meshBasicMaterial color="#ff8d35" transparent opacity={0.14} />
      </mesh>
    </group>
  )
}

function Planet({ planet, onSelect }: { planet: typeof planets[number]; onSelect: (name: string) => void }) {
  const angle = useRef(Math.random() * Math.PI * 2)
  const planetRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    angle.current += delta * planet.speed * 0.14
    if (planetRef.current) {
      planetRef.current.position.set(Math.cos(angle.current) * planet.orbit, 0, Math.sin(angle.current) * planet.orbit)
    }
  })
  const isEarth = planet.name === 'Earth'

  return (
    <group>
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[planet.orbit - 0.01, planet.orbit + 0.01, 128]} />
        <meshBasicMaterial color="#8ea0b8" transparent opacity={0.2} />
      </mesh>
      <group ref={planetRef}>
        <Html position={[0, planet.size + 0.6, 0]} center distanceFactor={40}>
          <span className="scene-label">{planet.name.toUpperCase()}</span>
        </Html>
        <mesh
          scale={planet.size}
          onClick={(event) => {
            event.stopPropagation()
            onSelect(planet.name)
          }}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={planet.color} roughness={0.58} metalness={0.08} emissive={planet.color} emissiveIntensity={0.08} />
        </mesh>
        {planet.name === 'Saturn' && (
          <mesh rotation-x={Math.PI / 2.4} scale={1.65}>
            <ringGeometry args={[1.1, 1.8, 64]} />
            <meshBasicMaterial color="#d1b582" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        )}
        {isEarth && (
          <mesh scale={1.28}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshBasicMaterial color="#76c9e8" transparent opacity={0.13} />
          </mesh>
        )}
      </group>
    </group>
  )
}

function Earth({ onBack }: { onBack: () => void }) {
  const earthTexture = useTexture('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg')
  const normalTexture = useTexture('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg')
  const earthRef = useRef<THREE.Mesh>(null)
  const moonRef = useRef<THREE.Mesh>(null)
  const moonAngle = useRef(0)
  const sunPosition = new THREE.Vector3(6, 3, 0)
  useFrame((_, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.035
    if (moonRef.current) {
      moonAngle.current += delta * 0.15
      moonRef.current.position.set(Math.cos(moonAngle.current) * 8.5, Math.sin(moonAngle.current) * 1.8 + 0.4, 3)
    }
  })
  return (
    <group>
      <ambientLight intensity={0.38} color="#7899c4" />
      <hemisphereLight args={['#a9d8f4', '#020718', 0.68]} />
      <directionalLight position={sunPosition} intensity={6.2} color="#fff0cf" />
      <pointLight position={sunPosition} intensity={260} distance={100} color="#ffd78d" />
      <mesh position={sunPosition}>
        <Html position={[0, 1.15, 0]} center distanceFactor={40}>
          <span className="scene-label sun-label">SUN / LIGHT SOURCE</span>
        </Html>
        <sphereGeometry args={[0.72, 32, 32]} />
        <meshBasicMaterial color="#fff1b8" />
      </mesh>
      <mesh ref={earthRef} rotation={[0.08, 0.4, 0.1]} onClick={onBack}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial map={earthTexture} normalMap={normalTexture} roughness={0.78} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[3, 48, 48]} />
        <meshBasicMaterial color="#55c9ff" transparent opacity={0.16} side={THREE.BackSide} />
      </mesh>
      <mesh rotation-x={Math.PI / 2.5} rotation-z={0.2}>
        <ringGeometry args={[4.2, 4.22, 128]} />
        <meshBasicMaterial color="#99d7ef" transparent opacity={0.48} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation-x={Math.PI / 2.8} rotation-z={-0.3}>
        <ringGeometry args={[5.2, 5.21, 128]} />
        <meshBasicMaterial color="#8dc4da" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={moonRef} position={[8.5, 0.4, 3]}>
        <Html position={[0, 0.75, 0]} center distanceFactor={40}>
          <span className="scene-label moon-label">MOON</span>
        </Html>
        <sphereGeometry args={[0.34, 32, 32]} />
        <meshStandardMaterial color="#aeb6c5" roughness={0.9} />
      </mesh>
    </group>
  )
}

function SpaceScene({ view, onSelect }: { view: View; onSelect: (name: string) => void }) {
  return (
    <Canvas
      key={view}
      camera={{ position: view === 'earth' ? [0, 0.25, 9] : [0, 38, 62], fov: view === 'earth' ? 42 : 50 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#010207']} />
      <fog attach="fog" args={['#010207', 55, 150]} />
      <Stars radius={90} depth={45} count={6000} factor={3.5} saturation={0.1} fade speed={0.4} />
      <Suspense fallback={null}>
        {view === 'system' ? (
          <>
            <ambientLight intensity={0.7} color="#9bb6d7" />
            <Sun />
            {planets.map((planet) => <Planet key={planet.name} planet={planet} onSelect={onSelect} />)}
          </>
        ) : <Earth onBack={() => onSelect('system')} />}
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={view === 'earth' ? 4.5 : 18}
        maxDistance={view === 'earth' ? 18 : 105}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI - 0.25}
        rotateSpeed={0.45}
        zoomSpeed={0.8}
        autoRotate={false}
      />
    </Canvas>
  )
}

function App() {
  const [view, setView] = useState<View>('system')
  const [query, setQuery] = useState('')
  const selectPlanet = (name: string) => name === 'Earth' ? setView('earth') : name === 'system' && setView('system')
  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    if (query.trim().toLowerCase() === 'earth') setView('earth')
  }

  return (
    <main className="app-shell">
      <div className="scene"><SpaceScene view={view} onSelect={selectPlanet} /></div>
      <div className="vignette" />
      <header className="topbar">
        <button className="brand" onClick={() => setView('system')} aria-label="Return to solar system">
          <span className="brand-mark">O</span>
          <span><strong>ORBIS</strong><small>ORBITAL VISUALISATION</small></span>
        </button>
        <form className="search" onSubmit={submitSearch}>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a world" aria-label="Search a world" />
          <kbd>⌘ K</kbd>
        </form>
        <div className="status"><i /> LIVE / {view === 'system' ? 'SOLAR SYSTEM' : 'EARTH'}</div>
      </header>
      {view === 'system' && <section className="copy">
        <p className="eyebrow">{view === 'system' ? 'OUR SOLAR SYSTEM' : 'ORBITAL OBSERVATION / 01'}</p>
        <h1>
          {view === 'system' ? <>The worlds<br /><em>in motion.</em></> : <>Earth,<br /><em>our home.</em></>}
        </h1>
        <p>{view === 'system' ? 'A first visual map of our neighbourhood.' : 'A closer look at the planet at the centre of Orbis.'}</p>
      </section>}
      {view === 'system' && <div className="instruction">DRAG <span>Rotate</span> &nbsp; SCROLL <span>Zoom</span> &nbsp; CLICK <span>Select</span></div>}
      {view === 'earth' && <button className="back-button" onClick={() => setView('system')}>← RETURN TO SYSTEM</button>}
      <footer><span>ORBITAL VISUALISATION / 01</span><span>ORBiS <b>✦</b></span></footer>
    </main>
  )
}

export default App

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Stars, Sky } from '@react-three/drei'
import { Player } from './Player'
import { World } from './World'
import * as THREE from 'three'
import './App.css'

function App() {
  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputEncoding: THREE.sRGBEncoding
        }}
      >
        <Suspense fallback={null}>
          {/* Re-introducing Sky but with lower turbidity for a cleaner horizon */}
          <Sky
            distance={450000}
            sunPosition={[10, 5, 10]}
            inclination={0}
            azimuth={0.25}
            turbidity={0.1}
            rayleigh={0.5}
          />
          <Stars radius={100} depth={50} count={8000} factor={4} saturation={0} fade speed={1} />

          <Physics gravity={[0, -9.81, 0]}>
            <Player />
            <World />
          </Physics>
        </Suspense>
      </Canvas>

      <div className="ui-overlay">
        <header className="garden-header">
          <h1>Void Explorer</h1>
          <p>Click anywhere to start</p>
        </header>

        <div className="instructions">
          WASD: Move<br />
          Shift: Sprint<br />
          Space: Jump<br />
          Mouse: Look around<br />
          ESC: Exit Controls
        </div>

        <div className="crosshair"></div>
      </div>
    </div>
  )
}

export default App

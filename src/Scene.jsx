import { useRef, useState } from 'react'
import { OrbitControls, PerspectiveCamera, Environment, Float, ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Plant({ position }) {
    const meshRef = useRef()

    // Subtle swaying animation
    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        meshRef.current.rotation.x = Math.sin(t * 2) * 0.1
        meshRef.current.rotation.z = Math.cos(t * 1.5) * 0.1
    })

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh ref={meshRef} position={[0, 0.5, 0]}>
                    <coneGeometry args={[0.3, 1, 8]} />
                    <meshStandardMaterial color="#4ade80" roughness={0.3} />
                </mesh>
                {/* Simple leaves */}
                <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.4, 4]} />
                    <meshStandardMaterial color="#22c55e" side={THREE.DoubleSide} />
                </mesh>
            </Float>
        </group>
    )
}

export default function Scene({ onPlant, plants }) {
    const [hoverPos, setHoverPos] = useState(null)

    const handlePointerMove = (e) => {
        e.stopPropagation()
        setHoverPos([e.point.x, 0, e.point.z])
    }

    const handleClick = (e) => {
        e.stopPropagation()
        onPlant([e.point.x, 0, e.point.z])
    }

    return (
        <>
            <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
            <OrbitControls
                makeDefault
                maxPolarAngle={Math.PI / 2.1}
                minDistance={5}
                maxDistance={25}
                enableDamping
            />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
            />
            <Environment preset="forest" />

            {/* Ground */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                onPointerMove={handlePointerMove}
                onPointerOut={() => setHoverPos(null)}
                onClick={handleClick}
            >
                <circleGeometry args={[10, 64]} />
                <meshStandardMaterial
                    color="#1a2e1a"
                    roughness={0.8}
                />
            </mesh>

            {/* Grid Pattern on ground */}
            <gridHelper args={[20, 20, 0x4ade80, 0x222222]} position={[0, 0.01, 0]} />

            {/* Hover Preview */}
            {hoverPos && (
                <mesh position={[hoverPos[0], 0.02, hoverPos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.5, 32]} />
                    <meshBasicMaterial color="#4ade80" transparent opacity={0.3} />
                </mesh>
            )}

            {/* Render Plants */}
            {plants.map((pos, idx) => (
                <Plant key={idx} position={pos} />
            ))}

            <ContactShadows
                position={[0, -0.01, 0]}
                opacity={0.4}
                scale={20}
                blur={2}
                far={4.5}
            />
        </>
    )
}

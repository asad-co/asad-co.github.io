import { useBox, usePlane } from "@react-three/cannon"
import { Environment, useTexture } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"
import { Ground } from "./Ground"

function Cube({ position, color = "white", ...props }) {
    const [ref] = useBox(() => ({ mass: 1, position, ...props }))
    return (
        <mesh ref={ref} castShadow receiveShadow>
            <boxGeometry />
            <meshStandardMaterial color={color} roughness={0.1} metalness={0.7} />
        </mesh>
    )
}

function Wall({ position, args, color = "white", texturePath }) {
    const [ref] = useBox(() => ({ type: "Static", position, args }))

    // Load the texture
    const baseTexture = useTexture(texturePath || "/brick_diffuse.jpg")
    const texture = useMemo(() => {
        const t = baseTexture.clone()
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.anisotropy = 16
        t.needsUpdate = true
        return t
    }, [baseTexture])

    // Create a texture clone specifically for this wall's dimensions to avoid repeat conflicts
    const wallTexture = useMemo(() => {
        const t = texture.clone()
        t.repeat.set(args[0] / 4, args[1] / 4)
        t.needsUpdate = true
        return t
    }, [texture, args])

    // We use an array of 6 materials for each face of the box to prevent stretching
    // Order: [pos-x, neg-x, pos-y, neg-y, pos-z, neg-z]
    const materials = [
        // Sides (X-axis) - usually the thin ends
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 }),
        // Top/Bottom (Y-axis) 
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 }),
        // Front/Back (Z-axis) - The main faces
        new THREE.MeshStandardMaterial({ map: wallTexture, color: color, roughness: 0.6 }),
        new THREE.MeshStandardMaterial({ map: wallTexture, color: color, roughness: 0.6 }),
    ]

    return (
        <mesh
            ref={ref}
            receiveShadow
            castShadow
            material={materials}
        >
            <boxGeometry args={args} />
        </mesh>
    )
}

export function World() {
    const [floorRef] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0, 0]
    }))

    return (
        <>
            {/* Soft night atmosphere */}
            <Environment preset="night" />

            {/* Lighting mix: Ambient for shadows, point for player area, directional for scene */}
            <ambientLight intensity={0.15} />
            <pointLight position={[0, 10, 0]} intensity={1} distance={50} decay={2} castShadow />
            <directionalLight
                position={[20, 30, 10]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />

            {/* Physics ground (invisible), visuals handled by <Ground /> */}
            <mesh ref={floorRef} visible={false}>
                <planeGeometry args={[1000, 1000]} />
            </mesh>

            <Ground />

            {/* Boundary Walls - Using White tint so the green-tinted texture (if any) or actual color shows correctly */}
            {/* We position them so the Z-face is the main viewable face when possible */}
            <Wall position={[0, 5, -50]} args={[100, 10, 1]} color="#ffffff" texturePath="/brick_diffuse.jpg" />
            <Wall position={[0, 5, 50]} args={[100, 10, 1]} color="#ffffff" texturePath="/brick_diffuse.jpg" />

            {/* For East/West walls, we need to rotate the inner geo or logic, 
                but let's just use the brick material on all for now and see if the streaks are gone */}
            <Wall position={[50, 5, 0]} args={[1, 10, 100]} color="#ffffff" texturePath="/brick_diffuse.jpg" />
            <Wall position={[-50, 5, 0]} args={[1, 10, 100]} color="#ffffff" texturePath="/brick_diffuse.jpg" />

            {/* Internal Highlight Wall */}
            <Wall position={[0, 2.5, -20]} args={[40, 5, 1]} color="#4ade80" texturePath="/brick_diffuse.jpg" />

            {/* Interactive Cubes with better materials */}
            <Cube position={[5, 1, -5]} color="#4ade80" />
            <Cube position={[-5, 5, -10]} color="#facc15" />
            <Cube position={[10, 8, 2]} color="#60a5fa" />
            <Cube position={[15, 2, 10]} color="#f43f5e" />
        </>
    )
}

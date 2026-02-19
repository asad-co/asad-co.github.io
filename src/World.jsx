import { useBox, usePlane } from "@react-three/cannon"

function Cube({ position, color = "white", ...props }) {
    const [ref] = useBox(() => ({ mass: 1, position, ...props }))
    return (
        <mesh ref={ref} castShadow receiveShadow>
            <boxGeometry />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

function Wall({ position, args, color = "#22c55e" }) {
    const [ref] = useBox(() => ({ type: "Static", position, args }))
    return (
        <mesh ref={ref} receiveShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color={color} opacity={0.3} transparent />
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
            {/* Floor (Infinite plane for physics, but visual grid is limited) */}
            <mesh ref={floorRef} receiveShadow>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#0c140c" />
            </mesh>

            {/* Grid for visual scale */}
            <gridHelper args={[100, 100, "#4ade80", "#111"]} position={[0, 0.01, 0]} />

            {/* World Boundaries (4 Walls) */}
            {/* North */}
            <Wall position={[0, 5, -50]} args={[100, 10, 1]} />
            {/* South */}
            <Wall position={[0, 5, 50]} args={[100, 10, 1]} />
            {/* East */}
            <Wall position={[50, 5, 0]} args={[1, 10, 100]} />
            {/* West */}
            <Wall position={[-50, 5, 0]} args={[1, 10, 100]} />

            {/* Internal Obstacles */}
            <Wall position={[0, 2.5, -20]} args={[40, 5, 1]} color="#22c55e" />
            <Wall position={[20, 2.5, 0]} args={[1, 5, 40]} color="#22c55e" />

            {/* Interactive Cubes */}
            <Cube position={[5, 1, -5]} color="#4ade80" />
            <Cube position={[-5, 5, -10]} color="#facc15" />
            <Cube position={[10, 8, 2]} color="#60a5fa" />
            <Cube position={[15, 2, 10]} color="#f43f5e" />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        </>
    )
}

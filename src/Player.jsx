import { useSphere } from "@react-three/cannon"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { PointerLockControls } from "@react-three/drei"
import * as THREE from "three"

const useKeyboard = () => {
    const keys = useRef({
        KeyW: false,
        KeyS: false,
        KeyA: false,
        KeyD: false,
        Space: false,
        ShiftLeft: false,
        ShiftRight: false,
    })

    useEffect(() => {
        const handleKeyDown = (e) => { keys.current[e.code] = true }
        const handleKeyUp = (e) => { keys.current[e.code] = false }
        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("keyup", handleKeyUp)
        }
    }, [])

    return keys.current
}

// Reusable vectors to avoid memory churn
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

export const Player = () => {
    const { camera } = useThree()
    const keys = useKeyboard()

    // Default starting position
    const spawnPos = [0, 2, 0]

    const [ref, api] = useSphere(() => ({
        mass: 1,
        type: "Dynamic",
        position: spawnPos,
        fixedRotation: true, // Prevents the player sphere from rolling like a ball
        args: [0.5],
    }))

    const velocity = useRef([0, 0, 0])
    useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity])

    const pos = useRef([0, 0, 0])
    useEffect(() => api.position.subscribe((p) => (pos.current = p)), [api.position])

    useFrame(() => {
        // 1. Sync camera to physics body
        camera.position.set(pos.current[0], pos.current[1] + 0.75, pos.current[2])

        // 2. Void check (if player somehow clips through walls)
        if (pos.current[1] < -20) {
            api.position.set(...spawnPos)
            api.velocity.set(0, 0, 0)
        }

        // 3. Movement Logic
        frontVector.set(0, 0, Number(keys.KeyS) - Number(keys.KeyW))
        sideVector.set(Number(keys.KeyA) - Number(keys.KeyD), 0, 0)

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .applyEuler(camera.rotation)

        // Lock Y movement
        direction.y = 0

        // SPRINT LOGIC: If Shift is pressed, multiply speed
        const isSprinting = keys.ShiftLeft || keys.ShiftRight
        const speed = isSprinting ? 10 : 5

        direction.normalize().multiplyScalar(speed)

        // Snappy STOP: If no keys are pressed, set horizontal velocity to 0
        if (keys.KeyW || keys.KeyS || keys.KeyA || keys.KeyD) {
            api.velocity.set(direction.x, velocity.current[1], direction.z)
        } else {
            // Apply horizontal friction/stop while preserving falling gravity
            api.velocity.set(0, velocity.current[1], 0)
        }

        // 4. Jump Logic
        if (keys.Space && Math.abs(velocity.current[1]) < 0.1) {
            api.velocity.set(velocity.current[0], 4.5, velocity.current[2])
        }
    })

    return (
        <>
            <PointerLockControls />
            <mesh ref={ref} />
        </>
    )
}

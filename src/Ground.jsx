import { useEffect, useMemo, useRef } from "react"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"

function setUv2(geometry) {
    if (!geometry) return
    const uv = geometry.attributes.uv
    if (!uv || geometry.attributes.uv2) return
    geometry.setAttribute("uv2", new THREE.BufferAttribute(uv.array, 2))
}

function tile(tex, repeatX, repeatY) {
    if (!tex) return
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(repeatX, repeatY)
    tex.anisotropy = 16
}

function TexturedPlane({
    width,
    height,
    position,
    rotation = [-Math.PI / 2, 0, 0],
    materialProps,
    receiveShadow = true,
}) {
    const geoRef = useRef(null)

    useEffect(() => {
        setUv2(geoRef.current)
    }, [])

    return (
        <mesh position={position} rotation={rotation} receiveShadow={receiveShadow}>
            <planeGeometry ref={geoRef} args={[width, height]} />
            <meshStandardMaterial {...materialProps} />
        </mesh>
    )
}

export function Ground({
    grassSize = 1000,
    grassRepeat = 120,
    roadLength = 400,
    roadWidth = 20,
    sidewalkWidth = 4,
    sidewalkGap = 1,
}) {
    const grassLoaded = useTexture({
        map: "/textures/grass/rocky_terrain_02_diff_1k.jpg",
        aoMap: "/textures/grass/rocky_terrain_02_ao_1k.jpg",
        normalMap: "/textures/grass/rocky_terrain_02_nor_gl_1k.jpg",
        roughnessMap: "/textures/grass/rocky_terrain_02_rough_1k.jpg",
    })

    const asphaltLoaded = useTexture({
        map: "/textures/asphalt/asphalt_track_diff_1k.jpg",
        aoMap: "/textures/asphalt/asphalt_track_ao_1k.jpg",
        normalMap: "/textures/asphalt/asphalt_track_nor_gl_1k.jpg",
        roughnessMap: "/textures/asphalt/asphalt_track_rough_1k.jpg",
    })

    const sidewalkLoaded = useTexture({
        map: "/textures/sidewalk/brick_pavement_03_diff_1k.jpg",
        aoMap: "/textures/sidewalk/brick_pavement_03_ao_1k.jpg",
        normalMap: "/textures/sidewalk/brick_pavement_03_nor_gl_1k.jpg",
        roughnessMap: "/textures/sidewalk/brick_pavement_03_rough_1k.jpg",
    })

    // Prepare cloned + configured textures inside useMemo to satisfy immutability lint rules.
    const grass = useMemo(() => {
        const map = grassLoaded.map.clone()
        const aoMap = grassLoaded.aoMap.clone()
        const normalMap = grassLoaded.normalMap.clone()
        const roughnessMap = grassLoaded.roughnessMap.clone()

        map.colorSpace = THREE.SRGBColorSpace

        tile(map, grassRepeat, grassRepeat)
        tile(aoMap, grassRepeat, grassRepeat)
        tile(normalMap, grassRepeat, grassRepeat)
        tile(roughnessMap, grassRepeat, grassRepeat)

        return { map, aoMap, normalMap, roughnessMap }
    }, [grassLoaded, grassRepeat])

    const asphalt = useMemo(() => {
        const map = asphaltLoaded.map.clone()
        const aoMap = asphaltLoaded.aoMap.clone()
        const normalMap = asphaltLoaded.normalMap.clone()
        const roughnessMap = asphaltLoaded.roughnessMap.clone()

        map.colorSpace = THREE.SRGBColorSpace

        const roadRepeatX = Math.max(1, Math.round(roadLength / 10))
        const roadRepeatY = Math.max(1, Math.round(roadWidth / 5))
        tile(map, roadRepeatX, roadRepeatY)
        tile(aoMap, roadRepeatX, roadRepeatY)
        tile(normalMap, roadRepeatX, roadRepeatY)
        tile(roughnessMap, roadRepeatX, roadRepeatY)

        return { map, aoMap, normalMap, roughnessMap }
    }, [asphaltLoaded, roadLength, roadWidth])

    const sidewalk = useMemo(() => {
        const map = sidewalkLoaded.map.clone()
        const aoMap = sidewalkLoaded.aoMap.clone()
        const normalMap = sidewalkLoaded.normalMap.clone()
        const roughnessMap = sidewalkLoaded.roughnessMap.clone()

        map.colorSpace = THREE.SRGBColorSpace

        const sidewalkRepeatX = Math.max(1, Math.round(roadLength / 8))
        const sidewalkRepeatY = Math.max(1, Math.round(sidewalkWidth / 2))
        tile(map, sidewalkRepeatX, sidewalkRepeatY)
        tile(aoMap, sidewalkRepeatX, sidewalkRepeatY)
        tile(normalMap, sidewalkRepeatX, sidewalkRepeatY)
        tile(roughnessMap, sidewalkRepeatX, sidewalkRepeatY)

        return { map, aoMap, normalMap, roughnessMap }
    }, [sidewalkLoaded, roadLength, sidewalkWidth])

    const sidewalkOffsetZ = roadWidth / 2 + sidewalkGap + sidewalkWidth / 2

    return (
        <>
            {/* Grass slightly below the walking surface */}
            <TexturedPlane
                width={grassSize}
                height={grassSize}
                position={[0, -0.02, 0]}
                materialProps={{
                    map: grass.map,
                    aoMap: grass.aoMap,
                    aoMapIntensity: 1,
                    normalMap: grass.normalMap,
                    roughnessMap: grass.roughnessMap,
                    metalness: 0,
                    roughness: 1,
                    color: "white",
                }}
            />

            {/* Road at y=0 so it matches physics plane */}
            <TexturedPlane
                width={roadLength}
                height={roadWidth}
                position={[0, 0, 0]}
                materialProps={{
                    map: asphalt.map,
                    aoMap: asphalt.aoMap,
                    aoMapIntensity: 1,
                    normalMap: asphalt.normalMap,
                    roughnessMap: asphalt.roughnessMap,
                    metalness: 0,
                    roughness: 1,
                    color: "white",
                }}
            />

            {/* Sidewalks */}
            <TexturedPlane
                width={roadLength}
                height={sidewalkWidth}
                position={[0, 0.001, -sidewalkOffsetZ]}
                materialProps={{
                    map: sidewalk.map,
                    aoMap: sidewalk.aoMap,
                    aoMapIntensity: 1,
                    normalMap: sidewalk.normalMap,
                    roughnessMap: sidewalk.roughnessMap,
                    metalness: 0,
                    roughness: 1,
                    color: "white",
                }}
            />
            <TexturedPlane
                width={roadLength}
                height={sidewalkWidth}
                position={[0, 0.001, sidewalkOffsetZ]}
                materialProps={{
                    map: sidewalk.map,
                    aoMap: sidewalk.aoMap,
                    aoMapIntensity: 1,
                    normalMap: sidewalk.normalMap,
                    roughnessMap: sidewalk.roughnessMap,
                    metalness: 0,
                    roughness: 1,
                    color: "white",
                }}
            />
        </>
    )
}


import React, { useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

// True black vinyl — maximum groove contrast via low roughness + sharp clearcoat
const VINYL_MATERIAL = {
  color: new THREE.Color(0x010101),
  roughness: 0.018,
  metalness: 0.04,
  iridescence: 1.0,
  iridescenceIOR: 1.55,
  iridescenceThicknessRange: [80, 600],
  clearcoat: 1.0,
  clearcoatRoughness: 0.02,
  envMapIntensity: 2.5,
  side: THREE.DoubleSide,
}

// hoveredRef + mouseRef + dragDeltaRef passed as props — DOM handles events, zero 3D raycasting
function VinylMesh({ hoveredRef, mouseRef, dragDeltaRef }) {
  const groupRef = useRef()
  const normalised = useRef(false)
  const spinSpeed = useRef(0)
  const { scene } = useGLTF('/vinile-blu.glb')

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (!child.isMesh) return
      child.material = new THREE.MeshPhysicalMaterial(VINYL_MATERIAL)
    })
    return clone
  }, [scene])

  // Normalise size + centre once
  useEffect(() => {
    if (!groupRef.current || normalised.current) return
    normalised.current = true
    groupRef.current.scale.set(1, 1, 1)
    groupRef.current.position.set(0, 0, 0)
    const box = new THREE.Box3().setFromObject(groupRef.current)
    const size = new THREE.Vector3()
    box.getSize(size)
    const center = new THREE.Vector3()
    box.getCenter(center)
    const s = 2.4 / Math.max(size.x, size.y, size.z)
    groupRef.current.scale.setScalar(s)
    groupRef.current.position.set(-center.x * s, -center.y * s, -center.z * s)
  }, [clonedScene])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const isHovered = hoveredRef.current
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    // Apply drag delta directly (grab & spin feel) — consume after use
    const dx = dragDeltaRef.current.x
    const dy = dragDeltaRef.current.y
    if (dx !== 0 || dy !== 0) {
      groupRef.current.rotation.y += dx * 0.012  // drag X → spin
      groupRef.current.rotation.x += dy * 0.008  // drag Y → tilt
      dragDeltaRef.current.x = 0
      dragDeltaRef.current.y = 0
    }

    // Auto-spin only when hovering without drag
    spinSpeed.current = THREE.MathUtils.lerp(spinSpeed.current, isHovered ? 1.1 : 0, 0.04)
    groupRef.current.rotation.y += delta * spinSpeed.current

    // Hover tilt (position-based, only when not dragging)
    const targetZ = isHovered ? mx * 0.55 : 0
    const targetX = isHovered ? -my * 0.65 : 0
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.04)
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetZ, 0.04)
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  )
}

export function Vinyl3D({ onClick }) {
  const hoveredRef = useRef(false)
  const mouseRef = useRef({ x: 0, y: 0 })
  const dragDeltaRef = useRef({ x: 0, y: 0 })
  const draggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const dragDistRef = useRef(0)  // total drag px — distinguish click from drag

  // Release drag even if mouse leaves window
  useEffect(() => {
    const onUp = () => { draggingRef.current = false }
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [])

  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    draggingRef.current = true
    lastPosRef.current = { x: e.clientX, y: e.clientY }
    dragDistRef.current = 0
    document.body.style.cursor = 'grabbing'
  }

  const handleMouseUp = (e) => {
    draggingRef.current = false
    document.body.style.cursor = 'pointer'
    // Fire onClick only if total drag was small (real click, not drag)
    if (dragDistRef.current < 6) onClick?.()
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const zone = rect.width * 0.8
    mouseRef.current.x = Math.max(-1, Math.min(1, (e.clientX - cx) / zone))
    mouseRef.current.y = Math.max(-1, Math.min(1, -(e.clientY - cy) / zone))

    if (draggingRef.current) {
      const dx = e.clientX - lastPosRef.current.x
      const dy = e.clientY - lastPosRef.current.y
      dragDeltaRef.current.x += dx
      dragDeltaRef.current.y += dy
      dragDistRef.current += Math.abs(dx) + Math.abs(dy)
      lastPosRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  return (
    // Outer div = hover/click zone (220×220). Canvas is 380×380, centered behind it.
    // pointerEvents:none on canvas wrapper → events fall through to outer div.
    <div
      style={{ width: 220, height: 220, cursor: 'pointer', position: 'relative', userSelect: 'none' }}
      onMouseEnter={() => { hoveredRef.current = true }}
      onMouseLeave={() => { hoveredRef.current = false; mouseRef.current = { x: 0, y: 0 }; draggingRef.current = false; document.body.style.cursor = '' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 380, height: 380,
        pointerEvents: 'none',
      }}>
      <Canvas
        camera={{ position: [0, 1.0, 5.8], fov: 38 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Environment files="/studio.hdr" />
          <ambientLight intensity={0.08} />
          <directionalLight position={[3, 5, 4]} intensity={4.5} />
          <directionalLight position={[0.3, 0.05, 4]} intensity={2.2} color="#ffffff" />
          <directionalLight position={[-4, -1, -3]} intensity={0.9} color="#3344cc" />
          <directionalLight position={[0, -4, -2]} intensity={1.0} color="#8866ff" />
          <VinylMesh hoveredRef={hoveredRef} mouseRef={mouseRef} dragDeltaRef={dragDeltaRef} />
        </Suspense>
      </Canvas>
      </div>
    </div>
  )
}

useGLTF.preload('/vinile-blu.glb')

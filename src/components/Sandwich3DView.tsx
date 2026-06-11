import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useSandwichStore } from '../store'

const LAYER_HEIGHT = 0.18
const LAYER_GAP = 0.04
const LAYER_WIDTH = 2.2
const LAYER_DEPTH = 1.4

export default function Sandwich3DView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const layersGroupRef = useRef<THREE.Group | null>(null)
  const animationIdRef = useRef<number>(0)

  const currentLayers = useSandwichStore((s) => s.currentLayers)
  const ingredients = useSandwichStore((s) => s.ingredients)
  const isPacking = useSandwichStore((s) => s.isPacking)
  const currentLayersRef = useRef(currentLayers)

  useEffect(() => {
    currentLayersRef.current = currentLayers
  }, [currentLayers])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#faf5ed')
    scene.fog = new THREE.Fog('#faf5ed', 8, 20)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(4.5, 3.2, 6)
    camera.lookAt(0, 0.8, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight('#fff5e6', 1.5)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight('#ffffff', 3)
    sunLight.position.set(8, 10, 5)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 50
    sunLight.shadow.camera.left = -10
    sunLight.shadow.camera.right = 10
    sunLight.shadow.camera.top = 10
    sunLight.shadow.camera.bottom = -10
    sunLight.shadow.bias = -0.0001
    scene.add(sunLight)

    const fillLight = new THREE.DirectionalLight('#ffe0b2', 0.8)
    fillLight.position.set(-3, 2, -3)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight('#ffffff', 0.5)
    rimLight.position.set(0, 1, -5)
    scene.add(rimLight)

    const groundGeometry = new THREE.PlaneGeometry(16, 16)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: '#e8d5c0',
      roughness: 0.9,
      metalness: 0,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2.5
    ground.receiveShadow = true
    scene.add(ground)

    const gridHelper = new THREE.PolarGridHelper(5, 32, 24, 64, '#c4a882', '#c4a882')
    gridHelper.position.y = -2.49
    scene.add(gridHelper)

    const layersGroup = new THREE.Group()
    scene.add(layersGroup)
    layersGroupRef.current = layersGroup

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.8, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 3
    controls.maxDistance = 10
    controls.maxPolarAngle = Math.PI * 0.7
    controls.minPolarAngle = 0.3
    controls.update()
    controlsRef.current = controls

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationIdRef.current)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    if (!layersGroupRef.current) return
    const group = layersGroupRef.current

    while (group.children.length > 0) {
      const child = group.children[0]
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose())
        } else {
          child.material.dispose()
        }
      }
      group.remove(child)
    }

    currentLayers.forEach((id, index) => {
      const ingredient = ingredients.find((i) => i.id === id)
      if (!ingredient) return

      const geometry = new THREE.BoxGeometry(LAYER_WIDTH, LAYER_HEIGHT, LAYER_DEPTH, 2, 2, 2)
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(ingredient.color),
        roughness: 0.55,
        metalness: 0.05,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.y = index * (LAYER_HEIGHT + LAYER_GAP)
      mesh.castShadow = true
      mesh.receiveShadow = true

      const edgeGeometry = new THREE.EdgesGeometry(geometry)
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(ingredient.color).multiplyScalar(0.7),
        transparent: true,
        opacity: 0.3,
      })
      const edgeLine = new THREE.LineSegments(edgeGeometry, edgeMaterial)
      mesh.add(edgeLine)

      group.add(mesh)
    })

    const totalHeight = currentLayers.length * (LAYER_HEIGHT + LAYER_GAP)
    group.position.y = -totalHeight / 2 + LAYER_HEIGHT / 2
  }, [currentLayers, ingredients])

  useEffect(() => {
    if (!layersGroupRef.current) return
    const group = layersGroupRef.current

    if (isPacking) {
      const startTime = performance.now()
      const duration = 600

      const animatePack = (time: number) => {
        const elapsed = time - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)

        group.scale.setScalar(1 - eased * 0.9)
        group.position.y -= eased * 0.02

        if (progress < 1) {
          requestAnimationFrame(animatePack)
        } else {
          group.scale.setScalar(1)
        }
      }
      requestAnimationFrame(animatePack)
    }
  }, [isPacking])

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-amber-100 bg-[#faf5ed]">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 text-xs text-stone-400 bg-white/60 backdrop-blur-sm px-2 py-1 rounded-lg">
        拖拽旋转 · 滚轮缩放
      </div>
    </div>
  )
}
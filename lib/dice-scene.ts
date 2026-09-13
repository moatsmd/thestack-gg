import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { createDieGeometry, getDieFaces, landingOrientation } from './dice-geometry'
import { diceAnimationProgress, physicalDice } from './dice-rolloff'
import type { DieResult, PhysicalDie } from './dice-rolloff'

interface DieModel { group: THREE.Group; target: THREE.Quaternion; position: THREE.Vector3; vertices: THREE.Vector3[]; scale: number }
const COLORS = [0x135350, 0x253857, 0x602c3d, 0x513e68, 0x765528, 0x285647, 0x3f5364, 0x574432]

function textureCanvas(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable')
  return { canvas, context }
}

function numberTexture(value: string, sides: number): THREE.CanvasTexture {
  const { canvas, context: ctx } = textureCanvas(256)
  ctx.fillStyle = '#ffe5ae'
  ctx.strokeStyle = '#ffe5ae'
  if (sides === 6) {
    const dots: Record<string, number[][]> = {
      '1': [[128, 128]], '2': [[67, 67], [189, 189]], '3': [[67, 67], [128, 128], [189, 189]],
      '4': [[67, 67], [189, 67], [67, 189], [189, 189]], '5': [[67, 67], [189, 67], [128, 128], [67, 189], [189, 189]],
      '6': [[67, 61], [189, 61], [67, 128], [189, 128], [67, 195], [189, 195]],
    }
    dots[value]?.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill() })
  } else {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `600 ${value.length > 1 ? 142 : 170}px Georgia, serif`
    ctx.shadowColor = '#5a3616'
    ctx.shadowOffsetY = 3
    ctx.shadowBlur = 2
    ctx.fillText(value, 128, 135)
    if (value === '6' || value === '9') { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(100, 220); ctx.lineTo(156, 220); ctx.stroke() }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function feltTexture(): THREE.CanvasTexture {
  const { canvas, context: ctx } = textureCanvas(512)
  ctx.fillStyle = '#142c29'
  ctx.fillRect(0, 0, 512, 512)
  // Deterministic fine felt grain never consumes roll entropy.
  for (let index = 0; index < 18000; index++) {
    const x = (index * 73.317) % 512
    const y = (index * 137.711) % 512
    ctx.fillStyle = index % 2 ? '#ffffff08' : '#00000014'
    ctx.fillRect(x, y, 1, 2)
  }
  ctx.strokeStyle = '#b3935430'
  ctx.lineWidth = 1.2
  for (const radius of [196, 208, 219]) { ctx.beginPath(); ctx.arc(256, 256, radius, 0, Math.PI * 2); ctx.stroke() }
  for (let index = 0; index < 60; index++) {
    const angle = index / 60 * Math.PI * 2
    ctx.beginPath(); ctx.moveTo(256 + Math.cos(angle) * 200, 256 + Math.sin(angle) * 200)
    ctx.lineTo(256 + Math.cos(angle) * (index % 5 ? 204 : 213), 256 + Math.sin(angle) * (index % 5 ? 204 : 213)); ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function resinTexture(): THREE.CanvasTexture {
  const { canvas, context: ctx } = textureCanvas(256)
  ctx.fillStyle = '#d7dbd9'; ctx.fillRect(0, 0, 256, 256)
  for (let line = 0; line < 35; line++) {
    ctx.strokeStyle = line % 3 ? '#ffffff0c' : '#182e3430'
    ctx.lineWidth = 2 + (line % 5)
    ctx.beginPath()
    for (let x = -20; x < 280; x += 8) {
      const y = line * 8 + Math.sin(x * 0.021 + line * 0.47) * 31
      if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const renderable = child as THREE.Mesh
    renderable.geometry?.dispose()
    const materials = Array.isArray(renderable.material) ? renderable.material : [renderable.material]
    materials.filter(Boolean).forEach((material) => {
      const textured = material as THREE.MeshStandardMaterial
      textured.map?.dispose()
      material.dispose()
    })
  })
}

function buildDie(die: PhysicalDie, index: number, count: number): DieModel {
  const group = new THREE.Group()
  const geometry = createDieGeometry(die.sides)
  const faces = getDieFaces(geometry)
  if (!geometry.getAttribute('uv')) {
    const position = geometry.getAttribute('position')
    const uv: number[] = []
    for (let i = 0; i < position.count; i++) uv.push(position.getX(i) * 0.4 + 0.5, position.getY(i) * 0.4 + 0.5)
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  }
  const body = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ color: COLORS[die.colorIndex % COLORS.length], metalness: 0.3, roughness: 0.27, clearcoat: 0.9, clearcoatRoughness: 0.17, map: resinTexture(), flatShading: true, envMapIntensity: 1.25 }))
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 12), new THREE.LineBasicMaterial({ color: 0xd4ac68, transparent: true, opacity: 0.75 }))
  edges.scale.setScalar(1.003)
  group.add(edges)
  faces.forEach((face, faceIndex) => {
    const label = die.labels?.[faceIndex] ?? String(faceIndex + 1)
    const material = new THREE.MeshStandardMaterial({ map: numberTexture(label, die.sides), transparent: true, alphaTest: 0.15, metalness: 0.45, roughness: 0.36, emissive: 0xcaa665, emissiveIntensity: 0.08, polygonOffset: true, polygonOffsetFactor: -2 })
    const text = new THREE.Mesh(new THREE.PlaneGeometry(face.radius * 1.58, face.radius * 1.58), material)
    text.position.copy(face.center).addScaledVector(face.normal, 0.012)
    text.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(face.right, face.up, face.normal))
    group.add(text)
  })
  const target = landingOrientation(faces, die.value)
  if (die.sides === 4) {
    const label = group.children[2 + die.value] as THREE.Mesh
    const normal = faces[die.value].normal.clone().applyQuaternion(target)
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), normal).normalize()
    const up = new THREE.Vector3().crossVectors(normal, right).normalize()
    label.quaternion.copy(target.clone().invert().multiply(new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, normal))))
  }
  const columns = count <= 3 ? count : count <= 6 ? 3 : 4
  const rows = Math.ceil(count / columns)
  const row = Math.floor(index / columns)
  const itemsInRow = Math.min(columns, count - row * columns)
  const scale = count === 1 ? 1.1 : count <= 3 ? 0.94 : count <= 6 ? 0.77 : 0.65
  group.scale.setScalar(scale)
  const position = new THREE.Vector3((index % columns - (itemsInRow - 1) / 2) * (count <= 3 ? 2.25 : 2.0), 0, (row - (rows - 1) / 2) * 2.05)
  const attribute = geometry.getAttribute('position')
  const vertices = Array.from({ length: attribute.count }, (_, i) => new THREE.Vector3().fromBufferAttribute(attribute, i))
  return { group, target, position, vertices, scale }
}

/** Real 3D meshes; the cinematic trajectory is choreographed, not a rigid-body simulation. */
export function createDiceScene(container: HTMLElement, onContextLoss: () => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
  container.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60)
  camera.position.set(0, 7.1, 8.2)
  camera.lookAt(0, 0.25, 0)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, 0.035)
  scene.environment = environment.texture
  room.dispose()
  pmrem.dispose()
  scene.add(new THREE.HemisphereLight(0xd4e6ff, 0x172220, 2.1))
  const key = new THREE.DirectionalLight(0xffe0a5, 5.5)
  key.position.set(-3.5, 8, 5)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.left = key.shadow.camera.bottom = -7
  key.shadow.camera.right = key.shadow.camera.top = 7
  key.shadow.normalBias = 0.025
  key.shadow.bias = -0.0004
  key.shadow.radius = 4
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x91caff, 3.2)
  rim.position.set(4, 3, -5)
  scene.add(rim)
  const warm = new THREE.PointLight(0xffa347, 16, 16, 2)
  warm.position.set(-4, 2.5, 1)
  scene.add(warm)
  const floor = new THREE.Mesh(new THREE.CircleGeometry(5.7, 96), new THREE.MeshStandardMaterial({ map: feltTexture(), roughness: 0.96, metalness: 0.02 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)
  const border = new THREE.Mesh(new THREE.TorusGeometry(5.73, 0.09, 12, 96), new THREE.MeshStandardMaterial({ color: 0x77542d, roughness: 0.36, metalness: 0.8 }))
  border.rotation.x = Math.PI / 2
  border.position.y = 0.015
  scene.add(border)
  let models: DieModel[] = []
  let frame = 0
  let disposed = false
  let contextLost = false
  let previousRoll = -1
  let started = 0
  let animate = false
  let signature = ''
  const tempQ = new THREE.Quaternion()
  const spinEuler = new THREE.Euler()
  const tempV = new THREE.Vector3()
  const pose = (now: number) => {
    if (disposed || contextLost) return
    models.forEach((model, index) => {
      const t = animate ? diceAnimationProgress(now - started, index, models.length) : 1
      const remaining = 1 - t
      const variation = ((previousRoll * 7 + index * 11) % 23) / 23
      spinEuler.set(remaining * remaining * Math.PI * (8.5 + index * 0.73 + variation), remaining * remaining * Math.PI * (6.4 + index * 0.41 - variation), remaining * remaining * Math.PI * (4.2 + index * 0.37 + variation))
      tempQ.setFromEuler(spinEuler)
      model.group.quaternion.copy(model.target).multiply(tempQ)
      let support = 0
      model.vertices.forEach((vertex) => { support = Math.max(support, -tempV.copy(vertex).applyQuaternion(model.group.quaternion).y * model.scale) })
      const bounce = Math.pow(remaining, 2.2) * Math.abs(Math.cos(t * Math.PI * 3.7)) * 3.2
      const glide = remaining * remaining
      model.group.position.set(model.position.x + glide * (index % 2 ? 1.5 : -1.5) + Math.sin(t * Math.PI * 2) * remaining * 0.35, support + 0.025 + bounce, model.position.z - glide * 2.4)
    })
    const push = animate ? Math.max(0, 1 - (now - started) / 1950) : 0
    camera.position.set(0, (models.length === 1 ? 5.2 : 7.1) + push * 0.4, (models.length === 1 ? 6 : 8.2) + push * 0.6)
    camera.lookAt(0, 0.25, 0)
    renderer.render(scene, camera)
    if (animate && now - started < 2060 && !disposed) frame = requestAnimationFrame(pose)
  }
  const resize = () => {
    if (disposed) return
    const width = container.clientWidth || 360
    const height = container.clientHeight || 340
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.fov = camera.aspect < 1.1 && models.length > 3 ? 44 : 38
    camera.updateProjectionMatrix()
    cancelAnimationFrame(frame)
    pose(performance.now())
  }
  const observer = new ResizeObserver(resize)
  observer.observe(container)
  const handleContextLost = (event: Event) => { event.preventDefault(); contextLost = true; cancelAnimationFrame(frame); onContextLoss() }
  renderer.domElement.addEventListener('webglcontextlost', handleContextLost)
  resize()
  return {
    update(results: DieResult[], rolling: boolean, rollId: number, reducedMotion: boolean) {
      if (disposed) return
      const nextSignature = JSON.stringify(results)
      if (nextSignature !== signature) {
        models.forEach((model) => { scene.remove(model.group); disposeObject(model.group) })
        const dice = physicalDice(results)
        models = dice.map((die, index) => buildDie(die, index, dice.length))
        models.forEach((model) => scene.add(model.group))
        signature = nextSignature
        camera.fov = camera.aspect < 1.1 && models.length > 3 ? 44 : 38
        camera.updateProjectionMatrix()
      }
      if (rollId !== previousRoll) { started = performance.now(); previousRoll = rollId }
      animate = rolling && !reducedMotion
      cancelAnimationFrame(frame)
      pose(performance.now())
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost)
      disposeObject(scene)
      environment.dispose()
      key.shadow.map?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}

<template>
  <div class="spectrum-3d-container p-4">
    <h2 class="font-bold text-2xl mb-4">📊 LCX 3D Price Range Spectrum</h2>
    <div ref="threeWrap" class="three-wrapper border rounded w-full" style="height:600px"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const threeWrap = ref(null)

const levels = [
  { id: 'ATL', label: 'ATL', price: 0.0000001, zone: 'buy', range: 1 },
  { id: 'L1', label: 'L1', price: 0.0000001, zone: 'buy', range: 2 },
  { id: 'L2', label: 'L2', price: 0.0000002, zone: 'buy', range: 3 },
  { id: 'L3', label: 'L3', price: 0.0000003, zone: 'buy', range: 5 },
  { id: 'L4', label: 'L4', price: 0.0000004, zone: 'buy', range: 8 },
  { id: 'L5', label: 'L5', price: 0.0000005, zone: 'buy', range: 13 },
  { id: 'L6', label: 'L6', price: 0.0000006, zone: 'buy', range: 21 },
  { id: 'L7', label: 'L7', price: 0.0000007, zone: 'neutral', range: 34 },
  { id: 'L8', label: 'L8', price: 0.0000008, zone: 'neutral', range: 55 },
  { id: 'L9', label: 'L9', price: 0.000001, zone: 'sell', range: 89 },
  { id: 'ATH', label: 'ATH', price: 0.000008, zone: 'ath', range: 300 }
]

const currentPrice = 0.00000099

let renderer, scene, camera, controls, animFrame

const zoneColor = (zone) => {
  if (zone === 'buy') return 0x16a34a
  if (zone === 'neutral') return 0xfacc15
  if (zone === 'sell') return 0xdc2626
  if (zone === 'ath') return 0xf97316
  return 0x999999
}

const initThree = () => {
  const el = threeWrap.value
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(el.clientWidth, el.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  el.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 1000)
  camera.position.set(0, 50, 150)

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0)
  hemi.position.set(0, 200, 0)
  scene.add(hemi)

  const dir = new THREE.DirectionalLight(0xffffff, 0.6)
  dir.position.set(-100, 100, -50)
  scene.add(dir)

  // Floor grid
  const grid = new THREE.GridHelper(200, 10, 0xcccccc, 0xeeeeee)
  scene.add(grid)

  // Max range for scaling
  const maxRange = Math.max(...levels.map(l => l.range))

  const spacing = 20
  const baseX = -((levels.length - 1) * spacing) / 2

  levels.forEach((lvl, idx) => {
    const h = (lvl.range / maxRange) * 80 + 5 // scale height
    const geom = new THREE.BoxGeometry(10, h, 10)
    const mat = new THREE.MeshStandardMaterial({ color: zoneColor(lvl.zone) })
    const mesh = new THREE.Mesh(geom, mat)
    mesh.position.set(baseX + idx * spacing, h / 2, 0)
    scene.add(mesh)

    // Label 3D
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.font = '20px Arial'
    ctx.fillText(lvl.label + ' ' + lvl.price.toFixed(8), 8, 28)
    const texture = new THREE.CanvasTexture(canvas)
    const spriteMat = new THREE.SpriteMaterial({ map: texture })
    const sprite = new THREE.Sprite(spriteMat)
    sprite.scale.set(30, 8, 1)
    sprite.position.set(baseX + idx * spacing, h + 8, 0)
    scene.add(sprite)
  })

  // Current price indicator
  const priceY = levels.reduce((prev, lvl) => {
    return Math.abs(lvl.price - currentPrice) < Math.abs(prev.price - currentPrice) ? lvl : prev
  }, levels[0])
  const lineGeo = new THREE.BoxGeometry(levels.length * spacing + 20, 0.5, 2)
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x0000ff })
  const priceLine = new THREE.Mesh(lineGeo, lineMat)
  priceLine.position.set(0, (priceY.range / Math.max(...levels.map(l => l.range))) * 80, 0)
  scene.add(priceLine)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  const animate = () => {
    animFrame = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  // resize
  window.addEventListener('resize', () => {
    renderer.setSize(el.clientWidth, el.clientHeight)
    camera.aspect = el.clientWidth / el.clientHeight
    camera.updateProjectionMatrix()
  })
}

const disposeThree = () => {
  if (animFrame) cancelAnimationFrame(animFrame)
  if (controls) controls.dispose()
  if (renderer) {
    renderer.forceContextLoss()
    renderer.domElement = null
    renderer.context = null
    renderer = null
  }
}

onMounted(() => {
  initThree()
})

onBeforeUnmount(() => {
  disposeThree()
})
</script>

<style scoped>
.spectrum-3d-container { font-family: Inter, Arial, sans-serif; }
.three-wrapper { width: 100%; height: 600px; }
</style>

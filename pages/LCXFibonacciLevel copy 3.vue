<template>
  <div class="lcx-fib-graphic p-4">
    <div class="controls mb-4 flex items-center gap-4">
      <div class="summary">
        <div class="title font-bold text-lg">₿ LCX Price Scenarios</div>
        <div class="sub text-sm mt-1">BTC @ $107,976.24</div>
        <div class="row mt-2">Current 1 LCX = <strong>₿ 0.00000099</strong></div>
        <div class="row">Current USD: <strong>$0.1067</strong></div>
        <div class="row mt-1">Current Level: <span class="level">🟡 L8 Neutral</span></div>
      </div>

      <div class="mode-toggle ml-auto">
        <label class="mr-2">Mode</label>
        <select v-model="mode" class="border rounded px-2 py-1">
          <option value="2d">2D (SVG)</option>
          <option value="3d">3D (Three.js)</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <div v-if="mode === '2d'">
          <svg ref="svgRef" :width="svgWidth" :height="svgHeight" class="w-full border rounded">
            <g v-for="(lvl, i) in levels" :key="lvl.id">
              <rect
                :x="i * (barW + gap) + margin" :y="svgHeight - margin - lvlHeight(lvl)"
                :width="barW" :height="lvlHeight(lvl)"
                :fill="zoneColor(lvl.zone)" :opacity="hovered === lvl.id ? 0.9 : 0.75"
                @mouseenter="hovered = lvl.id" @mouseleave="hovered = null" @click="scrollToLevel(i)"
              />
              <text :x="i * (barW + gap) + margin + barW/2" :y="svgHeight - 6" text-anchor="middle" font-size="10">{{ lvl.label }}</text>
              <text :x="i * (barW + gap) + margin + barW/2" :y="svgHeight - margin - lvlHeight(lvl) - 6" text-anchor="middle" font-size="10">{{ formatPrice(lvl.price) }}</text>
            </g>
          </svg>
        </div>

        <div v-else class="three-wrapper border rounded" ref="threeWrap" style="height:480px"></div>
      </div>

      <div class="col-span-1 overflow-auto p-2 border rounded max-h-[520px]">
        <div class="legend mb-3">
          <div class="font-semibold">📊 Price Ranges (click to scroll)</div>
        </div>

        <div class="zones mb-3">
          <div class="zone-title">🟢 BUY ZONES</div>
          <div class="flex flex-col gap-1 mt-1">
            <button v-for="lvl in buyZones" :key="lvl.id" @click="focusLevel(lvl.id)" class="text-left p-1 rounded hover:bg-gray-100">{{ lvl.label }} — {{ formatPrice(lvl.price) }}</button>
          </div>
        </div>

        <div class="zones mb-3">
          <div class="zone-title">🟡 NEUTRAL ZONES</div>
          <div class="flex flex-col gap-1 mt-1">
            <button v-for="lvl in neutralZones" :key="lvl.id" @click="focusLevel(lvl.id)" class="text-left p-1 rounded hover:bg-gray-100">{{ lvl.label }} — {{ formatPrice(lvl.price) }}</button>
          </div>
        </div>

        <div class="zones mb-3">
          <div class="zone-title">🔴 SELL ZONES</div>
          <div class="flex flex-col gap-1 mt-1">
            <button v-for="lvl in sellZones" :key="lvl.id" @click="focusLevel(lvl.id)" class="text-left p-1 rounded hover:bg-gray-100">{{ lvl.label }} — {{ formatPrice(lvl.price) }}</button>
          </div>
        </div>

        <div class="zones">
          <div class="zone-title">🔥 ATH ZONE</div>
          <div class="mt-1 p-1">ATH — {{" " + formatPrice(ath.price)}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
// three.js imports for 3D mode
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Props could be passed from parent; for demo we define reactive local data
const props = defineProps({
  initialMode: { type: String, default: '2d' },
  // levels array can be passed to the component, but we include default demo data
  inputLevels: { type: Array, default: () => null }
})

const mode = ref(props.initialMode)

// Sample Fibonacci-like levels (demo values). In real usage, pass inputLevels prop.
const defaultLevels = [
  // BUY L1-L6
  { id: 'L1', label: 'L1', price: 0.02, zone: 'buy', range: 1 },
  { id: 'L2', label: 'L2', price: 0.03, zone: 'buy', range: 2 },
  { id: 'L3', label: 'L3', price: 0.04, zone: 'buy', range: 3 },
  { id: 'L4', label: 'L4', price: 0.05, zone: 'buy', range: 5 },
  { id: 'L5', label: 'L5', price: 0.08, zone: 'buy', range: 8 },
  { id: 'L6', label: 'L6', price: 0.13, zone: 'buy', range: 13 },
  // NEUTRAL L7-L8
  { id: 'L7', label: 'L7', price: 0.21, zone: 'neutral', range: 21 },
  { id: 'L8', label: 'L8', price: 0.34, zone: 'neutral', range: 34 },
  // SELL L9-L19 (few demo levels)
  { id: 'L9', label: 'L9', price: 0.55, zone: 'sell', range: 55 },
  { id: 'L10', label: 'L10', price: 0.89, zone: 'sell', range: 89 },
  { id: 'L11', label: 'L11', price: 1.44, zone: 'sell', range: 144 },
  { id: 'ATH', label: 'ATH', price: 2.33, zone: 'ath', range: 233 }
]

const levels = ref(props.inputLevels && props.inputLevels.length ? props.inputLevels : defaultLevels)

// SVG layout params
const svgRef = ref(null)
const svgWidth = 1000
const svgHeight = 320
const margin = 20
const barW = 40
const gap = 12

const hovered = ref(null)

// Helpers
const zoneColor = (zone) => {
  if (zone === 'buy') return '#10b981' // green
  if (zone === 'neutral') return '#f59e0b' // amber
  if (zone === 'sell') return '#ef4444' // red
  if (zone === 'ath') return '#f97316' // orange
  return '#9ca3af'
}

const maxRange = computed(() => Math.max(...levels.value.map(l => l.range || 1)))
const lvlHeight = (lvl) => {
  const available = svgHeight - margin * 2
  const ratio = (lvl.range || 1) / maxRange.value
  return Math.max(10, available * ratio)
}

const formatPrice = (p) => (typeof p === 'number' ? p.toFixed(6) : p)

// lists for legend
const buyZones = computed(() => levels.value.filter(l => l.zone === 'buy'))
const neutralZones = computed(() => levels.value.filter(l => l.zone === 'neutral'))
const sellZones = computed(() => levels.value.filter(l => l.zone === 'sell'))
const ath = computed(() => levels.value.find(l => l.zone === 'ath') || { price: 0 })

// Scroll and focus helpers (for 2D)
const svgContainer = ref(null)
const scrollToLevel = async (index) => {
  // in 2D mode we simply highlight the hovered element. If you have a list separate, scroll into view.
  hovered.value = levels.value[index].id
}

const focusLevel = (id) => {
  mode.value = '2d'
  hovered.value = id
}

// ---------- THREE.JS 3D MODE ----------
let renderer, scene, camera, controls, animFrame
const threeWrap = ref(null)
const initThree = () => {
  const el = threeWrap.value
  if (!el) return

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(el.clientWidth, el.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  el.innerHTML = ''
  el.appendChild(renderer.domElement)

  // scene & camera
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 1000)
  camera.position.set(0, 80, 150)

  // lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0)
  hemi.position.set(0, 200, 0)
  scene.add(hemi)

  const dir = new THREE.DirectionalLight(0xffffff, 0.6)
  dir.position.set(-100, 100, -50)
  scene.add(dir)

  // floor grid
  const grid = new THREE.GridHelper(500, 10, 0xdddddd, 0xeeeeee)
  scene.add(grid)

  // add boxes for levels
  const spacing = 22
  const baseX = -((levels.value.length - 1) * spacing) / 2

  levels.value.forEach((lvl, idx) => {
    const h = Math.max(2, (lvl.range || 1) / maxRange.value * 60)
    const geom = new THREE.BoxGeometry(16, h, 16)
    const mat = new THREE.MeshStandardMaterial({ color: zoneColor(lvl.zone) })
    const mesh = new THREE.Mesh(geom, mat)
    mesh.position.set(baseX + idx * spacing, h / 2, 0)
    mesh.userData = { id: lvl.id, label: lvl.label, price: lvl.price }
    scene.add(mesh)

    // label (sprite)
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.font = '18px Arial'
    ctx.fillText(lvl.label + ' ' + formatPrice(lvl.price), 8, 28)
    const tex = new THREE.CanvasTexture(canvas)
    const spriteMat = new THREE.SpriteMaterial({ map: tex })
    const sprite = new THREE.Sprite(spriteMat)
    sprite.scale.set(40, 10, 1)
    sprite.position.set(baseX + idx * spacing, h + 8, 0)
    scene.add(sprite)
  })

  // controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // resize handler
  const onResize = () => {
    renderer.setSize(el.clientWidth, el.clientHeight)
    camera.aspect = el.clientWidth / el.clientHeight
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', onResize)

  const animate = () => {
    animFrame = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
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
  window.removeEventListener('resize', () => {})
}

onMounted(() => {
  // re-init three when switching modes
  watch(mode, async (m) => {
    await nextTick()
    if (m === '3d') initThree()
    else disposeThree()
  }, { immediate: true })
})

onBeforeUnmount(() => {
  disposeThree()
})
</script>

<style scoped>
.lcx-fib-graphic { font-family: Inter, Arial, sans-serif }
.controls .summary { max-width: 520px }
.zone-title { font-weight: 600 }
button:focus { outline: none }
svg { background: #fff }
.three-wrapper { width: 100%; height: 480px }
</style>

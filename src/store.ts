import { create } from 'zustand'
import type { Ingredient, PackedSandwich, CustomerOrder, OrderEvaluation, TasteProfile, QueueItem, FilterPreset } from './types'
import { DEFAULT_INGREDIENTS } from './data'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch { /* ignore */ }
  return fallback
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}

function fillDefaults(ingredients: Ingredient[]): Ingredient[] {
  return ingredients.map((ing) => {
    const def = DEFAULT_INGREDIENTS.find((d) => d.id === ing.id)
    if (!def) return ing
    return {
      ...ing,
      lowStockThreshold: ing.lowStockThreshold ?? def.lowStockThreshold,
      restockTarget: ing.restockTarget ?? def.restockTarget,
      autoRestock: ing.autoRestock ?? def.autoRestock,
    }
  })
}

function validateSandwich(layers: string[]): string | null {
  if (layers.length === 0) return null
  if (layers[0] !== 'bread') return '⚠️ 三明治底部必须是面包！请先添加面包作为底层。'
  for (let i = 0; i < layers.length; i++) {
    if (layers[i] === 'patty' && i === layers.length - 1) {
      return '🥩 肉饼不适合放在三明治最顶层！请用面包封顶，或在肉饼上方添加酱料/面包后再打包。'
    }
  }
  if (layers[layers.length - 1] !== 'bread') return '⚠️ 三明治顶部需要面包封顶！请在顶部添加面包。'
  if (layers.length < 3) return '⚠️ 三明治至少需要3层配料（面包+馅料+面包）。'
  for (let i = 0; i < layers.length - 1; i++) {
    if (layers[i] === 'sauce' && layers[i + 1] === 'sauce') return '⚠️ 不建议连续添加酱料，可能会太咸哦！'
    if (layers[i] === 'bread' && layers[i + 1] === 'bread') return '⚠️ 两片面包不能直接叠在一起，中间需要加些馅料！'
  }
  return null
}

const CUSTOMER_NAMES = ['小明', '小红', '老王', '阿花', '大壮', '小美', '李叔', '张姐', '赵哥', '钱姨']
const TASTE_DESCRIPTIONS = [
  '喜欢浓郁肉香，酱料要足', '偏好清爽口感，蔬菜多些', '无肉不欢，双层肉饼更好',
  '注重健康，低热量优先', '经典口味，传统搭配即可', '喜欢尝鲜，不挑食',
  '只要肉多，其他随意', '酱料不要太多，清淡为主',
]

function generateOrder(): CustomerOrder {
  const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)]
  const taste = TASTE_DESCRIPTIONS[Math.floor(Math.random() * TASTE_DESCRIPTIONS.length)]
  const minBudget = Math.floor(Math.random() * 5) + 5
  const maxBudget = minBudget + Math.floor(Math.random() * 10) + 5
  const minCalories = Math.floor(Math.random() * 200) + 100
  const maxCalories = minCalories + Math.floor(Math.random() * 400) + 100
  return { customerName: name, taste, minBudget, maxBudget, minCalories, maxCalories, generatedAt: Date.now() }
}

function evaluateOrder(layers: string[], order: CustomerOrder, ingredients: Ingredient[]): OrderEvaluation {
  const totalCalories = layers.reduce((sum, id) => { const ing = ingredients.find((i) => i.id === id); return sum + (ing?.calories ?? 0) }, 0)
  const totalCost = layers.reduce((sum, id) => { const ing = ingredients.find((i) => i.id === id); return sum + (ing?.cost ?? 0) }, 0)
  let orderScore = 0, orderComment = ''
  const orderError = validateSandwich(layers)
  if (orderError === null) { orderScore = 30; orderComment = '层次结构完美！' }
  else if (orderError.includes('肉饼')) { orderScore = 10; orderComment = '肉饼位置需要调整。' }
  else { orderScore = 15; orderComment = '层次结构基本合格。' }
  let budgetScore = 0, budgetComment = ''
  if (totalCost >= order.minBudget && totalCost <= order.maxBudget) { budgetScore = 30; budgetComment = '预算控制精准！' }
  else if (totalCost < order.minBudget) { budgetScore = Math.round((totalCost / order.minBudget) * 25); budgetComment = '用料偏少，成本低于预算。' }
  else { budgetScore = Math.round((order.maxBudget / totalCost) * 20); budgetComment = '成本超出预算了。' }
  let calorieScore = 0, calorieComment = ''
  if (totalCalories >= order.minCalories && totalCalories <= order.maxCalories) { calorieScore = 25; calorieComment = '热量控制完美！' }
  else if (totalCalories < order.minCalories) { calorieScore = Math.round((totalCalories / order.minCalories) * 20); calorieComment = '热量偏低，不够饱腹。' }
  else { calorieScore = Math.round((order.maxCalories / totalCalories) * 15); calorieComment = '热量超标了。' }
  const pattyCount = layers.filter((id) => id === 'patty').length
  const veggieCount = layers.filter((id) => id === 'lettuce' || id === 'tomato').length
  let tasteScore = 0, tasteComment = ''
  if (order.taste.includes('肉') && pattyCount >= 2) { tasteScore = 15; tasteComment = '肉量充足，符合口味！' }
  else if (order.taste.includes('肉') && pattyCount >= 1) { tasteScore = 10; tasteComment = '有肉但可以再多些。' }
  else if (order.taste.includes('蔬菜') && veggieCount >= 3) { tasteScore = 15; tasteComment = '蔬菜丰富，清新健康！' }
  else if (order.taste.includes('蔬菜') && veggieCount >= 2) { tasteScore = 10; tasteComment = '蔬菜适中。' }
  else if (order.taste.includes('低热量') && totalCalories < 300) { tasteScore = 15; tasteComment = '低热量，非常健康！' }
  else if (order.taste.includes('经典') && pattyCount === 1) { tasteScore = 15; tasteComment = '经典搭配，恰到好处！' }
  else { tasteScore = 8; tasteComment = '口味基本匹配。' }
  const totalScore = orderScore + budgetScore + calorieScore + tasteScore
  let comment = ''
  if (totalScore >= 80) comment = '🌟 完美！顾客非常满意，给了五星好评！'
  else if (totalScore >= 60) comment = '👍 不错！顾客还算满意，下次继续加油！'
  else if (totalScore >= 40) comment = '😐 一般般，顾客勉强接受了，还有改进空间。'
  else comment = '😞 顾客不太满意，下次注意预算和热量控制。'
  return { totalScore, orderScore, budgetScore, calorieScore, tasteScore, comment: `${comment}\n📐结构: ${orderComment}\n💰预算: ${budgetComment}\n🔥热量: ${calorieComment}\n👅口味: ${tasteComment}` }
}

function computeTasteProfile(layers: string[], ingredients: Ingredient[]): TasteProfile {
  const totalCalories = layers.reduce((sum, id) => { const ing = ingredients.find((i) => i.id === id); return sum + (ing?.calories ?? 0) }, 0)
  const pattyCount = layers.filter((id) => id === 'patty').length
  const veggieCount = layers.filter((id) => id === 'lettuce' || id === 'tomato').length
  const hasBread = layers[0] === 'bread' && layers[layers.length - 1] === 'bread'
  return { meat: Math.min(pattyCount / 2, 1), fresh: Math.min(veggieCount / 3, 1), lowCal: Math.max(0, Math.min((500 - totalCalories) / 500, 1)), classic: hasBread && pattyCount === 1 && veggieCount >= 2 ? 1 : hasBread ? 0.4 : 0.2 }
}

function getMissingStock(layers: string[], ingredients: Ingredient[]): { id: string; name: string; emoji: string; need: number; have: number }[] {
  const counts: Record<string, number> = {}
  layers.forEach((id) => { counts[id] = (counts[id] || 0) + 1 })
  const missing: { id: string; name: string; emoji: string; need: number; have: number }[] = []
  Object.entries(counts).forEach(([id, need]) => {
    const ing = ingredients.find((i) => i.id === id)
    if (ing && ing.stock < need) missing.push({ id, name: ing.name, emoji: ing.emoji, need, have: ing.stock })
  })
  return missing
}

function clamp(value: number, min: number, max: number) { return Math.min(Math.max(value, min), max) }

function getQueueMaterials(queue: QueueItem[], ingredients: Ingredient[]) {
  const total: Record<string, number> = {}
  queue.forEach((item) => { item.layers.forEach((id) => { total[id] = (total[id] || 0) + 1 }) })
  return Object.entries(total).map(([id, need]) => {
    const ing = ingredients.find((i) => i.id === id)
    return { id, name: ing?.name ?? id, emoji: ing?.emoji ?? '', need, have: ing?.stock ?? 0, autoRestock: ing?.autoRestock ?? false }
  })
}

interface SandwichStore {
  ingredients: Ingredient[]
  currentLayers: string[]
  history: PackedSandwich[]
  validationError: string | null
  isPacking: boolean
  currentOrder: CustomerOrder | null
  lastEvaluation: OrderEvaluation | null
  productionQueue: QueueItem[]
  filterPresets: FilterPreset[]

  addIngredient: (id: string) => void
  removeLayer: (index: number) => void
  reorderLayers: (fromIndex: number, toIndex: number) => void
  autoFixBread: () => void
  resetCurrent: () => void
  packSandwich: () => void
  rateSandwich: (id: string, rating: number) => void
  updateNote: (id: string, note: string) => void
  toggleFavorite: (id: string) => void
  resetInventory: () => void
  applyRecipe: (ingredientIds: string[]) => boolean
  copyFromHistory: (id: string) => boolean
  restockForLayers: (ingredientIds: string[]) => void
  restockAll: () => void
  generateOrder: () => void
  dismissOrder: () => void
  dismissEvaluation: () => void
  getMissingForLayers: (layers: string[]) => { id: string; name: string; emoji: string; need: number; have: number }[]
  isLowStock: (id: string) => boolean
  computeTasteProfile: () => TasteProfile
  updateIngredientConfig: (id: string, config: { lowStockThreshold?: number; restockTarget?: number; autoRestock?: boolean }) => void

  addToQueue: (item: QueueItem) => void
  removeFromQueue: (id: string) => void
  clearQueue: () => void
  processQueueItem: (id: string) => boolean
  getQueueMaterials: () => { id: string; name: string; emoji: string; need: number; have: number; autoRestock: boolean }[]
  restockQueueMaterials: () => void

  saveFilterPreset: (preset: FilterPreset) => void
  deleteFilterPreset: (id: string) => void
  applyFilterPreset: (id: string) => FilterPreset | null
}

const savedLayers = loadFromStorage<string[]>('sandwich_current', [])
const initValidationError = validateSandwich(savedLayers)
const savedIngredients = loadFromStorage<Ingredient[]>('sandwich_inventory', DEFAULT_INGREDIENTS)
const migratedIngredients = fillDefaults(savedIngredients)

export const useSandwichStore = create<SandwichStore>((set, get) => ({
  ingredients: migratedIngredients,
  currentLayers: savedLayers,
  history: loadFromStorage<PackedSandwich[]>('sandwich_history', []),
  validationError: initValidationError,
  isPacking: false,
  currentOrder: null,
  lastEvaluation: null,
  productionQueue: loadFromStorage<QueueItem[]>('sandwich_queue', []),
  filterPresets: loadFromStorage<FilterPreset[]>('sandwich_filter_presets', []),

  addIngredient: (id: string) => {
    const { ingredients, currentLayers } = get()
    const ingredient = ingredients.find((i) => i.id === id)
    if (!ingredient || ingredient.stock <= 0) return
    const newIngredients = ingredients.map((i) => i.id === id ? { ...i, stock: i.stock - 1 } : i)
    const newLayers = [...currentLayers, id]
    const error = validateSandwich(newLayers)
    set({ ingredients: newIngredients, currentLayers: newLayers, validationError: error })
    saveToStorage('sandwich_inventory', newIngredients)
    saveToStorage('sandwich_current', newLayers)
  },

  removeLayer: (index: number) => {
    const { ingredients, currentLayers } = get()
    if (index < 0 || index >= currentLayers.length) return
    const removedId = currentLayers[index]
    const newLayers = currentLayers.filter((_, i) => i !== index)
    const newIngredients = ingredients.map((i) => i.id === removedId ? { ...i, stock: clamp(i.stock + 1, 0, i.maxStock) } : i)
    const error = validateSandwich(newLayers)
    set({ ingredients: newIngredients, currentLayers: newLayers, validationError: error })
    saveToStorage('sandwich_inventory', newIngredients)
    saveToStorage('sandwich_current', newLayers)
  },

  resetCurrent: () => {
    const { ingredients, currentLayers } = get()
    const newIngredients = ingredients.map((i) => {
      const used = currentLayers.filter((l) => l === i.id).length
      return { ...i, stock: clamp(i.stock + used, 0, i.maxStock) }
    })
    set({ ingredients: newIngredients, currentLayers: [], validationError: null })
    saveToStorage('sandwich_inventory', newIngredients)
    saveToStorage('sandwich_current', [])
  },

  packSandwich: () => {
    const { currentLayers, validationError, currentOrder } = get()
    if (currentLayers.length === 0) return
    if (validationError !== null) return
    set({ isPacking: true })
    setTimeout(() => {
      const state = get()
      const totalCalories = state.currentLayers.reduce((sum, id) => { const ing = state.ingredients.find((i) => i.id === id); return sum + (ing?.calories ?? 0) }, 0)
      const totalCost = state.currentLayers.reduce((sum, id) => { const ing = state.ingredients.find((i) => i.id === id); return sum + (ing?.cost ?? 0) }, 0)
      let evaluation: OrderEvaluation | null = null
      if (state.currentOrder) evaluation = evaluateOrder(state.currentLayers, state.currentOrder, state.ingredients)
      const packed: PackedSandwich = { id: Date.now().toString(), name: `三明治 #${state.history.length + 1}`, layers: [...state.currentLayers], totalCalories, totalCost, rating: 0, createdAt: new Date().toLocaleString('zh-CN'), note: '', favorite: false }
      const newHistory = [packed, ...state.history]
      set({ history: newHistory, currentLayers: [], validationError: null, isPacking: false, lastEvaluation: evaluation, currentOrder: evaluation ? null : state.currentOrder })
      saveToStorage('sandwich_history', newHistory)
      saveToStorage('sandwich_current', [])
    }, 600)
  },

  rateSandwich: (id: string, rating: number) => {
    const { history } = get()
    const newHistory = history.map((h) => (h.id === id ? { ...h, rating } : h))
    set({ history: newHistory })
    saveToStorage('sandwich_history', newHistory)
  },

  resetInventory: () => {
    const { currentLayers, ingredients } = get()
    const usageCounts: Record<string, number> = {}
    currentLayers.forEach((id) => { usageCounts[id] = (usageCounts[id] || 0) + 1 })
    const currentConfig = ingredients.reduce((map, i) => { map[i.id] = { lowStockThreshold: i.lowStockThreshold, restockTarget: i.restockTarget, autoRestock: i.autoRestock }; return map }, {} as Record<string, { lowStockThreshold: number; restockTarget: number; autoRestock: boolean }>)
    const newIngredients = DEFAULT_INGREDIENTS.map((def) => {
      const used = usageCounts[def.id] || 0
      const cfg = currentConfig[def.id] || { lowStockThreshold: def.lowStockThreshold, restockTarget: def.restockTarget, autoRestock: def.autoRestock }
      return { ...def, stock: clamp(def.maxStock - used, 0, def.maxStock), ...cfg }
    })
    const error = validateSandwich(currentLayers)
    set({ ingredients: newIngredients, validationError: error })
    saveToStorage('sandwich_inventory', newIngredients)
  },

  applyRecipe: (ingredientIds: string[]): boolean => {
    const { currentLayers } = get()
    let newIngredients = get().ingredients.map((i) => {
      const used = currentLayers.filter((l) => l === i.id).length
      return { ...i, stock: clamp(i.stock + used, 0, i.maxStock) }
    })
    const missing = getMissingStock(ingredientIds, newIngredients)
    if (missing.length > 0) {
      if (missing.every((m) => { const ing = newIngredients.find((i) => i.id === m.id); return ing?.autoRestock ?? false })) {
        for (const m of missing) {
          newIngredients = newIngredients.map((i) => i.id === m.id ? { ...i, stock: clamp(i.restockTarget, m.need, i.maxStock) } : i)
        }
      } else { return false }
    }
    for (const id of ingredientIds) newIngredients = newIngredients.map((i) => i.id === id ? { ...i, stock: i.stock - 1 } : i)
    const error = validateSandwich(ingredientIds)
    set({ ingredients: newIngredients, currentLayers: ingredientIds, validationError: error })
    saveToStorage('sandwich_inventory', newIngredients)
    saveToStorage('sandwich_current', ingredientIds)
    return true
  },

  reorderLayers: (fromIndex: number, toIndex: number) => {
    const { currentLayers } = get()
    if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= currentLayers.length || toIndex < 0 || toIndex >= currentLayers.length) return
    const newLayers = [...currentLayers]
    const [moved] = newLayers.splice(fromIndex, 1)
    newLayers.splice(toIndex, 0, moved)
    const error = validateSandwich(newLayers)
    set({ currentLayers: newLayers, validationError: error })
    saveToStorage('sandwich_current', newLayers)
  },

  autoFixBread: () => {
    const { currentLayers } = get()
    if (currentLayers.length < 2) return
    const newLayers = [...currentLayers]
    const breadIndices: number[] = []
    newLayers.forEach((id, i) => { if (id === 'bread') breadIndices.push(i) })
    if (breadIndices.length >= 2) {
      const firstBread = newLayers.splice(breadIndices[0], 1)[0]
      newLayers.unshift(firstBread)
      const lastBreadIdx = newLayers.lastIndexOf('bread')
      if (lastBreadIdx !== newLayers.length - 1) { const lastBread = newLayers.splice(lastBreadIdx, 1)[0]; newLayers.push(lastBread) }
    }
    const pattyIndices: number[] = []
    newLayers.forEach((id, i) => { if (id === 'patty') pattyIndices.push(i) })
    for (const idx of pattyIndices.reverse()) { if (idx === newLayers.length - 1) { const patty = newLayers.splice(idx, 1)[0]; newLayers.splice(newLayers.length - 1, 0, patty) } }
    const error = validateSandwich(newLayers)
    set({ currentLayers: newLayers, validationError: error })
    saveToStorage('sandwich_current', newLayers)
  },

  updateNote: (id: string, note: string) => {
    const { history } = get()
    const newHistory = history.map((h) => (h.id === id ? { ...h, note } : h))
    set({ history: newHistory })
    saveToStorage('sandwich_history', newHistory)
  },

  toggleFavorite: (id: string) => {
    const { history } = get()
    const newHistory = history.map((h) => (h.id === id ? { ...h, favorite: !h.favorite } : h))
    set({ history: newHistory })
    saveToStorage('sandwich_history', newHistory)
  },

  copyFromHistory: (id: string): boolean => {
    const { history, currentLayers, ingredients } = get()
    const source = history.find((h) => h.id === id)
    if (!source) return false
    let newIngredients = ingredients.map((i) => { const used = currentLayers.filter((l) => l === i.id).length; return { ...i, stock: clamp(i.stock + used, 0, i.maxStock) } })
    const missing = getMissingStock(source.layers, newIngredients)
    if (missing.length > 0) {
      if (missing.every((m) => { const ing = newIngredients.find((i) => i.id === m.id); return ing?.autoRestock ?? false })) {
        for (const m of missing) newIngredients = newIngredients.map((i) => i.id === m.id ? { ...i, stock: clamp(i.restockTarget, m.need, i.maxStock) } : i)
      } else { return false }
    }
    for (const layerId of source.layers) newIngredients = newIngredients.map((i) => i.id === layerId ? { ...i, stock: i.stock - 1 } : i)
    const error = validateSandwich(source.layers)
    set({ ingredients: newIngredients, currentLayers: [...source.layers], validationError: error })
    saveToStorage('sandwich_inventory', newIngredients)
    saveToStorage('sandwich_current', [...source.layers])
    return true
  },

  restockForLayers: (ingredientIds: string[]) => {
    const { ingredients } = get()
    const needed: Record<string, number> = {}
    ingredientIds.forEach((id) => { needed[id] = (needed[id] || 0) + 1 })
    const newIngredients = ingredients.map((i) => {
      if (needed[i.id] && i.stock < needed[i.id]) return { ...i, stock: clamp(i.restockTarget, needed[i.id], i.maxStock) }
      return i
    })
    set({ ingredients: newIngredients })
    saveToStorage('sandwich_inventory', newIngredients)
  },

  restockAll: () => {
    const { ingredients, currentLayers } = get()
    const usageCounts: Record<string, number> = {}
    currentLayers.forEach((id) => { usageCounts[id] = (usageCounts[id] || 0) + 1 })
    const newIngredients = ingredients.map((i) => {
      const used = usageCounts[i.id] || 0
      return { ...i, stock: clamp(i.restockTarget, used, i.maxStock) }
    })
    set({ ingredients: newIngredients })
    saveToStorage('sandwich_inventory', newIngredients)
  },

  generateOrder: () => { set({ currentOrder: generateOrder(), lastEvaluation: null }) },
  dismissOrder: () => { set({ currentOrder: null }) },
  dismissEvaluation: () => { set({ lastEvaluation: null }) },
  getMissingForLayers: (layers: string[]) => getMissingStock(layers, get().ingredients),
  isLowStock: (id: string) => { const ing = get().ingredients.find((i) => i.id === id); return ing ? ing.stock <= ing.lowStockThreshold && ing.stock > 0 : false },
  computeTasteProfile: () => computeTasteProfile(get().currentLayers, get().ingredients),

  updateIngredientConfig: (id: string, config) => {
    const { ingredients } = get()
    const newIngredients = ingredients.map((i) => i.id === id ? { ...i, ...config } : i)
    set({ ingredients: newIngredients })
    saveToStorage('sandwich_inventory', newIngredients)
  },

  addToQueue: (item: QueueItem) => {
    const { productionQueue } = get()
    const newQueue = [...productionQueue, item]
    set({ productionQueue: newQueue })
    saveToStorage('sandwich_queue', newQueue)
  },

  removeFromQueue: (id: string) => {
    const { productionQueue } = get()
    const newQueue = productionQueue.filter((q) => q.id !== id)
    set({ productionQueue: newQueue })
    saveToStorage('sandwich_queue', newQueue)
  },

  clearQueue: () => {
    set({ productionQueue: [] })
    saveToStorage('sandwich_queue', [])
  },

  processQueueItem: (id: string): boolean => {
    const { productionQueue, currentLayers } = get()
    const item = productionQueue.find((q) => q.id === id)
    if (!item || item.layers.length === 0) return false
    let newIngredients = get().ingredients.map((i) => {
      const used = currentLayers.filter((l) => l === i.id).length
      return { ...i, stock: clamp(i.stock + used, 0, i.maxStock) }
    })
    const missing = getMissingStock(item.layers, newIngredients)
    if (missing.length > 0) {
      if (missing.every((m) => { const ing = newIngredients.find((i) => i.id === m.id); return ing?.autoRestock ?? false })) {
        for (const m of missing) newIngredients = newIngredients.map((i) => i.id === m.id ? { ...i, stock: clamp(i.restockTarget, m.need, i.maxStock) } : i)
      } else { return false }
    }
    for (const layerId of item.layers) newIngredients = newIngredients.map((i) => i.id === layerId ? { ...i, stock: i.stock - 1 } : i)
    const error = validateSandwich(item.layers)
    const newQueue = productionQueue.filter((q) => q.id !== id)
    set({ ingredients: newIngredients, currentLayers: item.layers, validationError: error, productionQueue: newQueue })
    saveToStorage('sandwich_inventory', newIngredients)
    saveToStorage('sandwich_current', item.layers)
    saveToStorage('sandwich_queue', newQueue)
    return true
  },

  getQueueMaterials: () => getQueueMaterials(get().productionQueue, get().ingredients),

  restockQueueMaterials: () => {
    const { ingredients, productionQueue } = get()
    const materials = getQueueMaterials(productionQueue, ingredients)
    let newIngredients = [...ingredients]
    for (const m of materials) {
      if (m.need > m.have) {
        newIngredients = newIngredients.map((i) => i.id === m.id ? { ...i, stock: clamp(i.restockTarget, m.need, i.maxStock) } : i)
      }
    }
    set({ ingredients: newIngredients })
    saveToStorage('sandwich_inventory', newIngredients)
  },

  saveFilterPreset: (preset: FilterPreset) => {
    const { filterPresets } = get()
    const existing = filterPresets.findIndex((p) => p.id === preset.id)
    const newPresets = existing >= 0 ? filterPresets.map((p, i) => i === existing ? preset : p) : [...filterPresets, preset]
    set({ filterPresets: newPresets })
    saveToStorage('sandwich_filter_presets', newPresets)
  },

  deleteFilterPreset: (id: string) => {
    const { filterPresets } = get()
    const newPresets = filterPresets.filter((p) => p.id !== id)
    set({ filterPresets: newPresets })
    saveToStorage('sandwich_filter_presets', newPresets)
  },

  applyFilterPreset: (id: string) => {
    const { filterPresets } = get()
    return filterPresets.find((p) => p.id === id) ?? null
  },
}))
import { create } from 'zustand'
import type { Ingredient, PackedSandwich } from './types'
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

function validateSandwich(layers: string[]): string | null {
  if (layers.length === 0) return null
  if (layers[0] !== 'bread') return '三明治底部必须是面包！请先添加面包作为底层。'
  if (layers[layers.length - 1] !== 'bread') return '三明治顶部需要面包封顶！请在顶部添加面包。'
  if (layers.length < 3) return '三明治至少需要3层配料（面包+馅料+面包）。'

  for (let i = 0; i < layers.length; i++) {
    if (layers[i] === 'patty' && i === layers.length - 1) {
      return '肉饼不适合放在三明治最顶层！请用面包封顶，或在肉饼上方添加酱料/面包。'
    }
  }

  for (let i = 0; i < layers.length - 1; i++) {
    if (layers[i] === 'sauce' && layers[i + 1] === 'sauce') {
      return '不建议连续添加酱料，可能会太咸哦！'
    }
    if (layers[i] === 'bread' && layers[i + 1] === 'bread') {
      return '两片面包不能直接叠在一起，中间需要加些馅料！'
    }
  }

  return null
}

interface SandwichStore {
  ingredients: Ingredient[]
  currentLayers: string[]
  history: PackedSandwich[]
  validationError: string | null
  isPacking: boolean

  addIngredient: (id: string) => void
  removeLayer: (index: number) => void
  reorderLayers: (fromIndex: number, toIndex: number) => void
  autoFixBread: () => void
  resetCurrent: () => void
  packSandwich: () => void
  rateSandwich: (id: string, rating: number) => void
  updateNote: (id: string, note: string) => void
  resetInventory: () => void
  applyRecipe: (ingredientIds: string[]) => void
  copyFromHistory: (id: string) => void
  restockForRecipe: (ingredientIds: string[]) => void
}

export const useSandwichStore = create<SandwichStore>((set, get) => ({
  ingredients: loadFromStorage<Ingredient[]>('sandwich_inventory', DEFAULT_INGREDIENTS),
  currentLayers: loadFromStorage<string[]>('sandwich_current', []),
  history: loadFromStorage<PackedSandwich[]>('sandwich_history', []),
  validationError: null,
  isPacking: false,

  addIngredient: (id: string) => {
    const { ingredients, currentLayers } = get()
    const ingredient = ingredients.find((i) => i.id === id)
    if (!ingredient || ingredient.stock <= 0) return

    const newIngredients = ingredients.map((i) =>
      i.id === id ? { ...i, stock: i.stock - 1 } : i
    )
    const newLayers = [...currentLayers, id]
    const error = validateSandwich(newLayers)

    set({
      ingredients: newIngredients,
      currentLayers: newLayers,
      validationError: error,
    })
    saveToStorage('sandwich_inventory', newIngredients)
    saveToStorage('sandwich_current', newLayers)
  },

  removeLayer: (index: number) => {
    const { ingredients, currentLayers } = get()
    if (index < 0 || index >= currentLayers.length) return

    const removedId = currentLayers[index]
    const newLayers = currentLayers.filter((_, i) => i !== index)
    const newIngredients = ingredients.map((i) =>
      i.id === removedId ? { ...i, stock: i.stock + 1 } : i
    )
    const error = validateSandwich(newLayers)

    set({
      ingredients: newIngredients,
      currentLayers: newLayers,
      validationError: error,
    })
    saveToStorage('sandwich_inventory', newIngredients)
    saveToStorage('sandwich_current', newLayers)
  },

  resetCurrent: () => {
    const { ingredients, currentLayers } = get()
    const newIngredients = ingredients.map((i) => {
      const used = currentLayers.filter((l) => l === i.id).length
      return { ...i, stock: i.stock + used }
    })
    set({
      ingredients: newIngredients,
      currentLayers: [],
      validationError: null,
    })
    saveToStorage('sandwich_inventory', newIngredients)
    saveToStorage('sandwich_current', [])
  },

  packSandwich: () => {
    const { currentLayers, history, ingredients } = get()
    if (currentLayers.length === 0) return

    set({ isPacking: true })

    setTimeout(() => {
      const state = get()
      const totalCalories = state.currentLayers.reduce((sum, id) => {
        const ing = state.ingredients.find((i) => i.id === id)
        return sum + (ing?.calories ?? 0)
      }, 0)
      const totalCost = state.currentLayers.reduce((sum, id) => {
        const ing = state.ingredients.find((i) => i.id === id)
        return sum + (ing?.cost ?? 0)
      }, 0)

      const packed: PackedSandwich = {
        id: Date.now().toString(),
        name: `三明治 #${state.history.length + 1}`,
        layers: [...state.currentLayers],
        totalCalories,
        totalCost,
        rating: 0,
        createdAt: new Date().toLocaleString('zh-CN'),
        note: '',
      }

      const newHistory = [packed, ...state.history]
      set({
        history: newHistory,
        currentLayers: [],
        validationError: null,
        isPacking: false,
      })
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
    const { currentLayers } = get()
    const newIngredients = DEFAULT_INGREDIENTS.map((def) => ({
      ...def,
      stock: def.maxStock,
    }))
    const error = validateSandwich(currentLayers)
    set({ ingredients: newIngredients, validationError: error })
    saveToStorage('sandwich_inventory', newIngredients)
  },

  applyRecipe: (ingredientIds: string[]) => {
    const { currentLayers } = get()

    let newIngredients = get().ingredients.map((i) => {
      const used = currentLayers.filter((l) => l === i.id).length
      return { ...i, stock: i.stock + used }
    })

    for (const id of ingredientIds) {
      const ing = newIngredients.find((i) => i.id === id)
      if (!ing || ing.stock <= 0) return
      newIngredients = newIngredients.map((i) =>
        i.id === id ? { ...i, stock: i.stock - 1 } : i
      )
    }

    const error = validateSandwich(ingredientIds)
    set({
      ingredients: newIngredients,
      currentLayers: ingredientIds,
      validationError: error,
    })
    saveToStorage('sandwich_inventory', newIngredients)
    saveToStorage('sandwich_current', ingredientIds)
  },

  reorderLayers: (fromIndex: number, toIndex: number) => {
    const { currentLayers } = get()
    if (fromIndex === toIndex) return
    if (fromIndex < 0 || fromIndex >= currentLayers.length) return
    if (toIndex < 0 || toIndex >= currentLayers.length) return

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
    newLayers.forEach((id, i) => {
      if (id === 'bread') breadIndices.push(i)
    })

    if (breadIndices.length >= 2) {
      const firstBread = newLayers.splice(breadIndices[0], 1)[0]
      newLayers.unshift(firstBread)

      const lastBreadIdx = newLayers.lastIndexOf('bread')
      if (lastBreadIdx !== newLayers.length - 1) {
        const lastBread = newLayers.splice(lastBreadIdx, 1)[0]
        newLayers.push(lastBread)
      }
    }

    const pattyIndices: number[] = []
    newLayers.forEach((id, i) => {
      if (id === 'patty') pattyIndices.push(i)
    })

    for (const idx of pattyIndices.reverse()) {
      if (idx === newLayers.length - 1) {
        const patty = newLayers.splice(idx, 1)[0]
        const insertPos = newLayers.length - 1
        newLayers.splice(insertPos, 0, patty)
      }
    }

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

  copyFromHistory: (id: string) => {
    const { history, currentLayers, ingredients } = get()
    const source = history.find((h) => h.id === id)
    if (!source) return

    let newIngredients = ingredients.map((i) => {
      const used = currentLayers.filter((l) => l === i.id).length
      return { ...i, stock: i.stock + used }
    })

    for (const layerId of source.layers) {
      const ing = newIngredients.find((i) => i.id === layerId)
      if (!ing || ing.stock <= 0) return
      newIngredients = newIngredients.map((i) =>
        i.id === layerId ? { ...i, stock: i.stock - 1 } : i
      )
    }

    const error = validateSandwich(source.layers)
    set({
      ingredients: newIngredients,
      currentLayers: [...source.layers],
      validationError: error,
    })
    saveToStorage('sandwich_inventory', newIngredients)
    saveToStorage('sandwich_current', [...source.layers])
  },

  restockForRecipe: (ingredientIds: string[]) => {
    const { ingredients } = get()
    const needed: Record<string, number> = {}
    ingredientIds.forEach((id) => {
      needed[id] = (needed[id] || 0) + 1
    })

    const newIngredients = ingredients.map((i) => {
      if (needed[i.id]) {
        const required = needed[i.id]
        if (i.stock < required) {
          return { ...i, stock: required }
        }
      }
      return i
    })

    set({ ingredients: newIngredients })
    saveToStorage('sandwich_inventory', newIngredients)
  },
}))
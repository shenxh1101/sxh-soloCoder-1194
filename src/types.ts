export interface Ingredient {
  id: string
  name: string
  emoji: string
  color: string
  calories: number
  cost: number
  stock: number
  maxStock: number
  lowStockThreshold: number
  restockTarget: number
  autoRestock: boolean
}

export interface PackedSandwich {
  id: string
  name: string
  layers: string[]
  totalCalories: number
  totalCost: number
  rating: number
  createdAt: string
  note: string
  favorite: boolean
}

export interface Recipe {
  id: string
  name: string
  description: string
  ingredientIds: string[]
  totalCalories: number
  totalCost: number
}

export interface CustomerOrder {
  customerName: string
  taste: string
  minBudget: number
  maxBudget: number
  minCalories: number
  maxCalories: number
  generatedAt: number
}

export interface OrderEvaluation {
  totalScore: number
  orderScore: number
  budgetScore: number
  calorieScore: number
  tasteScore: number
  comment: string
}

export interface TasteProfile {
  meat: number
  fresh: number
  lowCal: number
  classic: number
}

export interface QueueItem {
  id: string
  name: string
  layers: string[]
  source: 'order' | 'recipe' | 'history'
}

export interface FilterPreset {
  id: string
  name: string
  ratingMin: number
  ratingMax: number
  calorieMin: string
  calorieMax: string
  costMin: string
  costMax: string
  favoriteOnly: boolean
}
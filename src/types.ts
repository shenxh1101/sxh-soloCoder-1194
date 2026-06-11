export interface Ingredient {
  id: string
  name: string
  emoji: string
  color: string
  calories: number
  cost: number
  stock: number
  maxStock: number
}

export interface SandwichLayer {
  ingredientId: string
  order: number
}

export interface PackedSandwich {
  id: string
  name: string
  layers: string[]
  totalCalories: number
  totalCost: number
  rating: number
  createdAt: string
}

export interface Recipe {
  id: string
  name: string
  description: string
  ingredientIds: string[]
  totalCalories: number
  totalCost: number
}
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
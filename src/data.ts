import type { Ingredient, Recipe } from './types'

export const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: 'bread', name: '面包', emoji: '🍞', color: '#DEB887', calories: 80, cost: 2.0, stock: 10, maxStock: 10 },
  { id: 'lettuce', name: '生菜', emoji: '🥬', color: '#81C784', calories: 5, cost: 0.5, stock: 10, maxStock: 10 },
  { id: 'tomato', name: '番茄', emoji: '🍅', color: '#EF5350', calories: 15, cost: 1.0, stock: 10, maxStock: 10 },
  { id: 'patty', name: '肉饼', emoji: '🥩', color: '#8D6E63', calories: 250, cost: 5.0, stock: 10, maxStock: 10 },
  { id: 'sauce', name: '酱料', emoji: '🧴', color: '#FFCC80', calories: 30, cost: 1.5, stock: 10, maxStock: 10 },
]

export const RECIPES: Recipe[] = [
  {
    id: 'classic',
    name: '经典汉堡',
    description: '经典搭配，永不过时',
    ingredientIds: ['bread', 'sauce', 'lettuce', 'tomato', 'patty', 'sauce', 'bread'],
    totalCalories: 490,
    totalCost: 13.5,
  },
  {
    id: 'veggie',
    name: '素食三明治',
    description: '清新健康，素食之选',
    ingredientIds: ['bread', 'sauce', 'lettuce', 'tomato', 'lettuce', 'sauce', 'bread'],
    totalCalories: 245,
    totalCost: 8.0,
  },
  {
    id: 'double',
    name: '双层肉饼堡',
    description: '双倍肉饼，双倍满足',
    ingredientIds: ['bread', 'sauce', 'lettuce', 'patty', 'tomato', 'patty', 'sauce', 'bread'],
    totalCalories: 775,
    totalCost: 20.0,
  },
  {
    id: 'light',
    name: '轻食三明治',
    description: '轻盈少负担',
    ingredientIds: ['bread', 'lettuce', 'tomato', 'lettuce', 'bread'],
    totalCalories: 185,
    totalCost: 6.0,
  },
  {
    id: 'deluxe',
    name: '豪华总汇',
    description: '食材丰富，奢华享受',
    ingredientIds: ['bread', 'sauce', 'lettuce', 'tomato', 'patty', 'sauce', 'lettuce', 'tomato', 'bread'],
    totalCalories: 610,
    totalCost: 17.5,
  },
]
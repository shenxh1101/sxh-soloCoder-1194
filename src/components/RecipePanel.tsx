import { useSandwichStore } from '../store'
import { RECIPES } from '../data'
import { Zap } from 'lucide-react'

export default function RecipePanel() {
  const applyRecipe = useSandwichStore((s) => s.applyRecipe)
  const ingredients = useSandwichStore((s) => s.ingredients)

  const canApplyRecipe = (recipe: typeof RECIPES[0]): boolean => {
    const needed: Record<string, number> = {}
    recipe.ingredientIds.forEach((id) => {
      needed[id] = (needed[id] || 0) + 1
    })
    return Object.entries(needed).every(([id, count]) => {
      const ing = ingredients.find((i) => i.id === id)
      return ing && ing.stock >= count
    })
  }

  const getIngredientEmoji = (id: string) => {
    const ing = ingredients.find((i) => i.id === id)
    return ing?.emoji ?? ''
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-amber-900">预制配方</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {RECIPES.map((recipe) => {
          const available = canApplyRecipe(recipe)
          return (
            <button
              key={recipe.id}
              onClick={() => applyRecipe(recipe.ingredientIds)}
              disabled={!available}
              className={`flex-shrink-0 w-44 p-3 rounded-2xl border-2 transition-all duration-200 text-left ${
                available
                  ? 'bg-white border-amber-100 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                  : 'bg-stone-100 border-stone-200 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <span className="font-bold text-sm text-stone-800">{recipe.name}</span>
              </div>
              <p className="text-xs text-stone-500 mb-2">{recipe.description}</p>
              <div className="flex items-center gap-1 text-xs mb-2">
                {recipe.ingredientIds.map((id, i) => (
                  <span key={i} className="text-sm">{getIngredientEmoji(id)}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span>🔥 {recipe.totalCalories}</span>
                <span>💰 ¥{recipe.totalCost.toFixed(1)}</span>
              </div>
              {!available && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">库存不足</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
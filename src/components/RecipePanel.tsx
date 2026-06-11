import { useSandwichStore } from '../store'
import { RECIPES } from '../data'
import { Zap, X, ShoppingCart, ChevronRight, AlertTriangle, ListPlus } from 'lucide-react'
import { useState } from 'react'

export default function RecipePanel() {
  const applyRecipe = useSandwichStore((s) => s.applyRecipe)
  const ingredients = useSandwichStore((s) => s.ingredients)
  const restockForLayers = useSandwichStore((s) => s.restockForLayers)
  const addToQueue = useSandwichStore((s) => s.addToQueue)
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [stockPending, setStockPending] = useState(false)

  const getIngredient = (id: string) => ingredients.find((i) => i.id === id)

  const getRecipeStockStatus = (recipe: typeof RECIPES[0]) => {
    const needed: Record<string, number> = {}
    recipe.ingredientIds.forEach((id) => {
      needed[id] = (needed[id] || 0) + 1
    })
    const status: { id: string; name: string; emoji: string; required: number; current: number }[] = []
    Object.entries(needed).forEach(([id, count]) => {
      const ing = getIngredient(id)
      status.push({
        id,
        name: ing?.name ?? id,
        emoji: ing?.emoji ?? '',
        required: count,
        current: ing?.stock ?? 0,
      })
    })
    return status
  }

  const canApplyRecipe = (recipe: typeof RECIPES[0]): boolean => {
    return getRecipeStockStatus(recipe).every((s) => s.current >= s.required)
  }

  const getMissingIngredients = (recipe: typeof RECIPES[0]) => {
    return getRecipeStockStatus(recipe).filter((s) => s.current < s.required)
  }

  const handleApply = (recipe: typeof RECIPES[0]) => {
    const success = applyRecipe(recipe.ingredientIds)
    if (success) {
      setSelectedRecipe(null)
      setStockPending(false)
    } else {
      setStockPending(true)
    }
  }

  const handleRestockAndApply = (recipe: typeof RECIPES[0]) => {
    restockForLayers(recipe.ingredientIds)
    const success = applyRecipe(recipe.ingredientIds)
    if (success) {
      setSelectedRecipe(null)
      setStockPending(false)
    }
  }

  const getAssemblySteps = (recipe: typeof RECIPES[0]) => {
    return recipe.ingredientIds.map((id, i) => {
      const ing = getIngredient(id)
      return {
        step: i + 1,
        ingredientId: id,
        name: ing?.name ?? id,
        emoji: ing?.emoji ?? '',
        color: ing?.color ?? '#ccc',
      }
    })
  }

  const selected = selectedRecipe ? RECIPES.find((r) => r.id === selectedRecipe) : null

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-amber-900">预制配方</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {RECIPES.map((recipe) => {
          const available = canApplyRecipe(recipe)
          const missing = getMissingIngredients(recipe)
          return (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipe(selectedRecipe === recipe.id ? null : recipe.id)}
              className={`flex-shrink-0 w-44 p-3 rounded-2xl border-2 transition-all duration-200 text-left ${
                selectedRecipe === recipe.id
                  ? 'bg-amber-50 border-amber-400 shadow-md'
                  : available
                  ? 'bg-white border-amber-100 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
                  : 'bg-stone-100 border-stone-200 opacity-70 hover:opacity-90'
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
                  <span key={i} className="text-sm">{getIngredient(id)?.emoji ?? ''}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span>🔥 {recipe.totalCalories}</span>
                <span>💰 ¥{recipe.totalCost.toFixed(1)}</span>
              </div>
              {!available && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-red-500 font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  缺 {missing.length} 种
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="bg-white rounded-2xl border-2 border-amber-200 p-4 shadow-sm animate-in">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-amber-900 text-lg">{selected.name}</h3>
              <p className="text-sm text-stone-500">{selected.description}</p>
            </div>
            <button
              onClick={() => setSelectedRecipe(null)}
              className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-stone-500" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-amber-700">{selected.ingredientIds.length}</div>
              <div className="text-xs text-stone-500">装配步骤</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-orange-700">{selected.totalCalories}</div>
              <div className="text-xs text-stone-500">总热量(千卡)</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-700">¥{selected.totalCost.toFixed(1)}</div>
              <div className="text-xs text-stone-500">总成本</div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-semibold text-stone-700 mb-2">所需库存</h4>
            <div className="flex flex-col gap-1.5">
              {getRecipeStockStatus(selected).map((s) => {
                const enough = s.current >= s.required
                return (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <span className="w-5 text-center">{s.emoji}</span>
                    <span className="text-stone-700 flex-1">{s.name}</span>
                    <span className={`font-mono text-xs ${enough ? 'text-stone-500' : 'text-red-500 font-bold'}`}>
                      {s.current}/{s.required}
                    </span>
                    {!enough && (
                      <span className="text-xs text-red-500">不足</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-semibold text-stone-700 mb-2">装配步骤（从下到上）</h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              {getAssemblySteps(selected).map((s) => (
                <div key={s.step} className="flex items-center gap-1">
                  {s.step > 1 && <ChevronRight className="w-3 h-3 text-stone-300" />}
                  <div className="flex flex-col items-center">
                    <span className="text-lg">{s.emoji}</span>
                    <span className="text-[10px] text-stone-400">{s.step}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {stockPending && (
              <div className="p-2 rounded-xl bg-orange-50 border border-orange-200">
                <p className="text-xs text-orange-700 font-medium mb-1.5">库存不足，需要补货：</p>
                <div className="flex flex-wrap gap-1">
                  {getMissingIngredients(selected).map((m) => (
                    <span key={m.id} className="text-xs px-1.5 py-0.5 rounded-full bg-white border border-orange-200 text-orange-600">
                      {m.emoji} {m.name} {m.current}/{m.required}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  addToQueue({
                    id: Date.now().toString(),
                    name: selected.name,
                    layers: selected.ingredientIds,
                    source: 'recipe',
                  })
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all duration-200 font-semibold text-sm border border-purple-200"
              >
                <ListPlus className="w-4 h-4" />
                加入队列
              </button>
              {(stockPending || !canApplyRecipe(selected)) && (
                <button
                  onClick={() => handleRestockAndApply(selected)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all duration-200 font-semibold text-sm border border-blue-200"
                >
                  <ShoppingCart className="w-4 h-4" />
                  补货并生成
                </button>
              )}
              <button
                onClick={() => handleApply(selected)}
                disabled={!canApplyRecipe(selected) && !stockPending}
                className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-bold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Zap className="w-4 h-4" />
                一键生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
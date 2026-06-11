import { useSandwichStore } from '../store'
import { X } from 'lucide-react'

export default function IngredientPanel() {
  const ingredients = useSandwichStore((s) => s.ingredients)
  const addIngredient = useSandwichStore((s) => s.addIngredient)
  const resetInventory = useSandwichStore((s) => s.resetInventory)

  const totalUsed = ingredients.reduce((sum, i) => sum + (i.maxStock - i.stock), 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-amber-900">配料区</h2>
        <button
          onClick={resetInventory}
          className="text-xs text-amber-600 hover:text-amber-800 underline underline-offset-2 transition-colors"
        >
          重置库存
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {ingredients.map((ingredient) => {
          const isOutOfStock = ingredient.stock <= 0
          return (
            <button
              key={ingredient.id}
              onClick={() => addIngredient(ingredient.id)}
              disabled={isOutOfStock}
              className={`group relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 text-left ${
                isOutOfStock
                  ? 'bg-stone-100 border-stone-200 opacity-50 cursor-not-allowed'
                  : 'bg-white border-amber-100 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
              }`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: ingredient.color + '30' }}
              >
                {ingredient.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-stone-800">{ingredient.name}</span>
                  {isOutOfStock && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                      售罄
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                  <span>🔥 {ingredient.calories}千卡</span>
                  <span>💰 ¥{ingredient.cost.toFixed(1)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(ingredient.stock / ingredient.maxStock) * 100}%`,
                        backgroundColor: ingredient.color,
                      }}
                    />
                  </div>
                  <span className="text-xs text-stone-400 font-medium tabular-nums min-w-[2ch] text-right">
                    {ingredient.stock}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="text-xs text-stone-400 text-center">
        已使用 {totalUsed} 份配料
      </div>
    </div>
  )
}
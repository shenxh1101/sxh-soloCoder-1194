import { useSandwichStore } from '../store'
import { ShoppingCart } from 'lucide-react'

export default function IngredientPanel() {
  const ingredients = useSandwichStore((s) => s.ingredients)
  const addIngredient = useSandwichStore((s) => s.addIngredient)
  const resetInventory = useSandwichStore((s) => s.resetInventory)
  const restockAll = useSandwichStore((s) => s.restockAll)
  const isLowStock = useSandwichStore((s) => s.isLowStock)

  const totalUsed = ingredients.reduce((sum, i) => sum + (i.maxStock - i.stock), 0)
  const anyLowStock = ingredients.some((i) => i.stock <= 3 && i.stock > 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-amber-900">配料区</h2>
        <div className="flex items-center gap-1">
          {anyLowStock && (
            <button
              onClick={restockAll}
              className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors flex items-center gap-1"
            >
              <ShoppingCart className="w-3 h-3" />
              补满
            </button>
          )}
          <button
            onClick={resetInventory}
            className="text-xs text-amber-600 hover:text-amber-800 underline underline-offset-2 transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {ingredients.map((ingredient) => {
          const isOutOfStock = ingredient.stock <= 0
          const lowStock = isLowStock(ingredient.id)
          return (
            <button
              key={ingredient.id}
              onClick={() => addIngredient(ingredient.id)}
              disabled={isOutOfStock}
              className={`group relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 text-left ${
                isOutOfStock
                  ? 'bg-stone-100 border-stone-200 opacity-50 cursor-not-allowed'
                  : lowStock
                  ? 'bg-white border-orange-200 hover:border-orange-400 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
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
                  {lowStock && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
                      低库存
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
                      className={`h-full rounded-full transition-all duration-300 ${lowStock ? 'animate-pulse' : ''}`}
                      style={{
                        width: `${(ingredient.stock / ingredient.maxStock) * 100}%`,
                        backgroundColor: lowStock ? '#f59e0b' : ingredient.color,
                      }}
                    />
                  </div>
                  <span className={`text-xs font-medium tabular-nums min-w-[2ch] text-right ${
                    lowStock ? 'text-orange-600' : 'text-stone-400'
                  }`}>
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
        {anyLowStock && <span className="text-orange-500 ml-1">· 库存预警</span>}
      </div>
    </div>
  )
}
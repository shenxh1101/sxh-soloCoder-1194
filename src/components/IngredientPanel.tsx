import { useSandwichStore } from '../store'
import { ShoppingCart, Settings, X, Check } from 'lucide-react'
import { useState } from 'react'

export default function IngredientPanel() {
  const ingredients = useSandwichStore((s) => s.ingredients)
  const addIngredient = useSandwichStore((s) => s.addIngredient)
  const resetInventory = useSandwichStore((s) => s.resetInventory)
  const restockAll = useSandwichStore((s) => s.restockAll)
  const isLowStock = useSandwichStore((s) => s.isLowStock)
  const updateIngredientConfig = useSandwichStore((s) => s.updateIngredientConfig)
  const [configIngredient, setConfigIngredient] = useState<string | null>(null)

  const totalUsed = ingredients.reduce((sum, i) => sum + (i.maxStock - i.stock), 0)
  const anyLowStock = ingredients.some((i) => i.stock <= i.lowStockThreshold && i.stock > 0)

  const configIng = configIngredient ? ingredients.find((i) => i.id === configIngredient) : null

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
          const isConfigOpen = configIngredient === ingredient.id

          return (
            <div key={ingredient.id} className="relative">
              <button
                onClick={() => {
                  if (configIngredient === ingredient.id) {
                    setConfigIngredient(null)
                  } else {
                    addIngredient(ingredient.id)
                  }
                }}
                disabled={isOutOfStock}
                className={`group relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 text-left w-full ${
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
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">售罄</span>
                    )}
                    {lowStock && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">低库存</span>
                    )}
                    {ingredient.autoRestock && (
                      <span className="text-[10px] px-1 py-0.5 rounded-full bg-green-100 text-green-600 font-medium">自动</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                    <span>🔥 {ingredient.calories}千卡</span>
                    <span>💰 ¥{ingredient.cost.toFixed(1)}</span>
                    <span className="text-stone-300">|</span>
                    <span>⏬ {ingredient.lowStockThreshold}</span>
                    <span>🎯 {ingredient.restockTarget}</span>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setConfigIngredient(isConfigOpen ? null : ingredient.id)
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isConfigOpen ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-400 hover:bg-amber-50 hover:text-amber-500'
                  }`}
                  title="配置规则"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </button>

              {isConfigOpen && configIng && (
                <div className="mt-1 p-3 rounded-xl bg-white border-2 border-amber-200 shadow-sm animate-in">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-stone-400 font-medium uppercase">低库存线</label>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => updateIngredientConfig(configIng.id, { lowStockThreshold: v })}
                            className={`text-xs w-7 h-6 rounded-lg transition-colors font-medium ${
                              configIng.lowStockThreshold === v
                                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                                : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 font-medium uppercase">补货目标</label>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[5, 8, 10, 12, 15].map((v) => (
                          <button
                            key={v}
                            onClick={() => updateIngredientConfig(configIng.id, { restockTarget: v })}
                            disabled={v > configIng.maxStock}
                            className={`text-xs w-7 h-6 rounded-lg transition-colors font-medium ${
                              configIng.restockTarget === v
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200'
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => updateIngredientConfig(configIng.id, { autoRestock: !configIng.autoRestock })}
                        className={`w-8 h-4 rounded-full transition-colors relative ${
                          configIng.autoRestock ? 'bg-emerald-400' : 'bg-stone-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                            configIng.autoRestock ? 'left-4.5 translate-x-0' : 'left-0.5'
                          }`}
                          style={{ left: configIng.autoRestock ? '17px' : '2px' }}
                        />
                      </div>
                      <span className="text-xs text-stone-600 font-medium">
                        {configIng.autoRestock ? '自动补货：开' : '自动补货：关'}
                      </span>
                    </label>
                    <button
                      onClick={() => setConfigIngredient(null)}
                      className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium"
                    >
                      <Check className="w-3 h-3" />
                      完成
                    </button>
                  </div>
                </div>
              )}
            </div>
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
import { useSandwichStore } from '../store'
import { ClipboardList, X, Target, TrendingUp } from 'lucide-react'

export default function OrderPanel() {
  const currentOrder = useSandwichStore((s) => s.currentOrder)
  const generateOrder = useSandwichStore((s) => s.generateOrder)
  const dismissOrder = useSandwichStore((s) => s.dismissOrder)
  const currentLayers = useSandwichStore((s) => s.currentLayers)
  const ingredients = useSandwichStore((s) => s.ingredients)

  const totalCalories = currentLayers.reduce((sum, id) => {
    const ing = ingredients.find((i) => i.id === id)
    return sum + (ing?.calories ?? 0)
  }, 0)
  const totalCost = currentLayers.reduce((sum, id) => {
    const ing = ingredients.find((i) => i.id === id)
    return sum + (ing?.cost ?? 0)
  }, 0)

  if (!currentOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-stone-400">
        <button
          onClick={generateOrder}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98]"
        >
          <ClipboardList className="w-4 h-4" />
          接取顾客订单
        </button>
        <p className="text-xs mt-2 text-stone-400">点击接单获取随机顾客需求</p>
      </div>
    )
  }

  const calorieInRange = totalCalories >= currentOrder.minCalories && totalCalories <= currentOrder.maxCalories
  const costInRange = totalCost >= currentOrder.minBudget && totalCost <= currentOrder.maxBudget
  const matchCount = [calorieInRange, costInRange].filter(Boolean).length

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="font-bold text-sm text-stone-800">顾客订单</span>
        </div>
        <button
          onClick={dismissOrder}
          className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
        >
          <X className="w-3 h-3 text-stone-500" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">👤</span>
          <div>
            <span className="font-bold text-stone-800">{currentOrder.customerName}</span>
            <p className="text-xs text-stone-500">{currentOrder.taste}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-blue-50 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-stone-500">💰 预算</span>
              {costInRange && currentLayers.length > 0 && (
                <span className="text-xs text-emerald-500 font-bold">✓</span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-stone-700">¥{currentOrder.minBudget}</span>
              <span className="text-xs text-stone-400">-</span>
              <span className="text-sm font-bold text-stone-700">¥{currentOrder.maxBudget}</span>
            </div>
            {currentLayers.length > 0 && (
              <div className="mt-1">
                <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      costInRange ? 'bg-emerald-400' : totalCost < currentOrder.minBudget ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min((totalCost / currentOrder.maxBudget) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  当前 ¥{totalCost.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div className="bg-orange-50 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-stone-500">🔥 热量</span>
              {calorieInRange && currentLayers.length > 0 && (
                <span className="text-xs text-emerald-500 font-bold">✓</span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-stone-700">{currentOrder.minCalories}</span>
              <span className="text-xs text-stone-400">-</span>
              <span className="text-sm font-bold text-stone-700">{currentOrder.maxCalories}</span>
            </div>
            {currentLayers.length > 0 && (
              <div className="mt-1">
                <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      calorieInRange ? 'bg-emerald-400' : totalCalories < currentOrder.minCalories ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min((totalCalories / currentOrder.maxCalories) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  当前 {totalCalories}千卡
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs text-stone-500">
            匹配进度：
            <span className={`font-bold ${matchCount === 2 ? 'text-emerald-600' : matchCount === 1 ? 'text-amber-600' : 'text-stone-500'}`}>
              {matchCount}/2
            </span>
          </span>
          <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400 transition-all"
              style={{ width: `${(matchCount / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
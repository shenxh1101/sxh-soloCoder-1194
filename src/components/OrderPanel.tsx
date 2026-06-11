import { useSandwichStore } from '../store'
import { ClipboardList, X, Target, Gauge, ListPlus, ArrowRight } from 'lucide-react'
import { useMemo } from 'react'

export default function OrderPanel() {
  const currentOrder = useSandwichStore((s) => s.currentOrder)
  const generateOrder = useSandwichStore((s) => s.generateOrder)
  const dismissOrder = useSandwichStore((s) => s.dismissOrder)
  const currentLayers = useSandwichStore((s) => s.currentLayers)
  const ingredients = useSandwichStore((s) => s.ingredients)
  const computeTasteProfile = useSandwichStore((s) => s.computeTasteProfile)
  const addToQueue = useSandwichStore((s) => s.addToQueue)

  const totalCalories = currentLayers.reduce((sum, id) => { const ing = ingredients.find((i) => i.id === id); return sum + (ing?.calories ?? 0) }, 0)
  const totalCost = currentLayers.reduce((sum, id) => { const ing = ingredients.find((i) => i.id === id); return sum + (ing?.cost ?? 0) }, 0)

  const tasteProfile = useMemo(() => computeTasteProfile(), [currentLayers, ingredients, computeTasteProfile])

  const hints = useMemo(() => {
    if (!currentOrder || currentLayers.length === 0) return []
    const result: { text: string; type: 'warn' | 'good' | 'tip' }[] = []
    const pattyCount = currentLayers.filter((id) => id === 'patty').length
    const veggieCount = currentLayers.filter((id) => id === 'lettuce' || id === 'tomato').length
    const hasTop = currentLayers[currentLayers.length - 1] === 'bread'
    const hasBottom = currentLayers[0] === 'bread'

    if (currentOrder.taste.includes('肉')) {
      if (pattyCount === 0) result.push({ text: '🥩 还差肉饼，至少加1片', type: 'warn' })
      else if (currentOrder.taste.includes('多') && pattyCount < 2) result.push({ text: '🥩 顾客想要更多肉，再加1片肉饼', type: 'tip' })
      else if (pattyCount >= 2) result.push({ text: '🥩 肉量已满足顾客口味', type: 'good' })
    }
    if (currentOrder.taste.includes('蔬菜') || currentOrder.taste.includes('清爽')) {
      if (veggieCount === 0) result.push({ text: '🥬 需要添加蔬菜（生菜/番茄）', type: 'warn' })
      else if (veggieCount < 2) result.push({ text: '🥬 再多加些蔬菜更清爽', type: 'tip' })
      else result.push({ text: '🥬 蔬菜量充足', type: 'good' })
    }
    if (currentOrder.taste.includes('低热量')) {
      if (totalCalories > currentOrder.maxCalories) result.push({ text: `🔥 热量已超 ${currentOrder.maxCalories}，注意控制`, type: 'warn' })
      else if (totalCalories < currentOrder.minCalories) result.push({ text: '🔥 热量偏低，可以加些馅料', type: 'tip' })
      else result.push({ text: '🔥 热量在合理范围内', type: 'good' })
    }
    if (currentOrder.taste.includes('经典')) {
      if (!hasTop || !hasBottom) result.push({ text: '🥪 经典结构需要面包封顶和垫底', type: 'warn' })
      else if (pattyCount !== 1) result.push({ text: '🥪 经典搭配需要恰好1片肉饼', type: 'tip' })
      else if (!hasTop || !hasBottom) {}
      else result.push({ text: '🥪 经典结构已完成', type: 'good' })
    }
    if (!hasTop) result.push({ text: '⚠️ 顶部需要面包封顶', type: 'warn' })
    if (!hasBottom) result.push({ text: '⚠️ 底部需要面包垫底', type: 'warn' })
    if (totalCalories > currentOrder.maxCalories && !result.some((r) => r.text.includes('热量已超'))) {
      result.push({ text: `🔥 热量已超上限 ${currentOrder.maxCalories}`, type: 'warn' })
    }
    if (totalCost > currentOrder.maxBudget && !result.some((r) => r.text.includes('成本'))) {
      result.push({ text: `💰 成本已超预算 ¥${currentOrder.maxBudget}`, type: 'warn' })
    }
    return result.slice(0, 5)
  }, [currentOrder, currentLayers, totalCalories, totalCost])

  if (!currentOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-stone-400">
        <button onClick={generateOrder} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98]">
          <ClipboardList className="w-4 h-4" />接取顾客订单
        </button>
        <p className="text-xs mt-2 text-stone-400">点击接单获取随机顾客需求</p>
      </div>
    )
  }

  const calorieInRange = totalCalories >= currentOrder.minCalories && totalCalories <= currentOrder.maxCalories
  const costInRange = totalCost >= currentOrder.minBudget && totalCost <= currentOrder.maxBudget
  const matchCount = [calorieInRange, costInRange].filter(Boolean).length
  const isMeatOrder = currentOrder.taste.includes('肉')
  const isFreshOrder = currentOrder.taste.includes('蔬菜') || currentOrder.taste.includes('清爽')
  const isLowCalOrder = currentOrder.taste.includes('低热量')
  const isClassicOrder = currentOrder.taste.includes('经典')
  const tasteDimensions = [
    { label: '肉香', key: 'meat' as const, color: '#ef4444', active: isMeatOrder },
    { label: '清爽', key: 'fresh' as const, color: '#22c55e', active: isFreshOrder },
    { label: '低热量', key: 'lowCal' as const, color: '#3b82f6', active: isLowCalOrder },
    { label: '经典', key: 'classic' as const, color: '#a855f7', active: isClassicOrder },
  ]

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center"><ClipboardList className="w-3.5 h-3.5 text-blue-600" /></div>
          <span className="font-bold text-sm text-stone-800">排产看板</span>
        </div>
        <button onClick={dismissOrder} className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"><X className="w-3 h-3 text-stone-500" /></button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">👤</span>
          <div>
            <span className="font-bold text-stone-800">{currentOrder.customerName}</span>
            <p className="text-xs text-stone-500">{currentOrder.taste}</p>
          </div>
          <button
            onClick={() => {
              const layers = currentLayers.length > 0 ? [...currentLayers] : []
              addToQueue({ id: Date.now().toString(), name: `${currentOrder.customerName}的订单`, layers, source: 'order' })
            }}
            className="ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium"
          >
            <ListPlus className="w-3 h-3" />加入队列
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-blue-50 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-1"><span className="text-xs text-stone-500">💰 预算</span>{costInRange && currentLayers.length > 0 && <span className="text-xs text-emerald-500 font-bold">✓</span>}</div>
            <div className="flex items-baseline gap-1"><span className="text-sm font-bold text-stone-700">¥{currentOrder.minBudget}</span><span className="text-xs text-stone-400">-</span><span className="text-sm font-bold text-stone-700">¥{currentOrder.maxBudget}</span></div>
            {currentLayers.length > 0 && (
              <div className="mt-1">
                <div className="h-1 bg-stone-200 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${costInRange ? 'bg-emerald-400' : totalCost < currentOrder.minBudget ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${Math.min((totalCost / currentOrder.maxBudget) * 100, 100)}%` }} /></div>
                <span className="text-[10px] text-stone-400 mt-0.5 block">当前 ¥{totalCost.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="bg-orange-50 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-1"><span className="text-xs text-stone-500">🔥 热量</span>{calorieInRange && currentLayers.length > 0 && <span className="text-xs text-emerald-500 font-bold">✓</span>}</div>
            <div className="flex items-baseline gap-1"><span className="text-sm font-bold text-stone-700">{currentOrder.minCalories}</span><span className="text-xs text-stone-400">-</span><span className="text-sm font-bold text-stone-700">{currentOrder.maxCalories}</span></div>
            {currentLayers.length > 0 && (
              <div className="mt-1">
                <div className="h-1 bg-stone-200 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${calorieInRange ? 'bg-emerald-400' : totalCalories < currentOrder.minCalories ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${Math.min((totalCalories / currentOrder.maxCalories) * 100, 100)}%` }} /></div>
                <span className="text-[10px] text-stone-400 mt-0.5 block">当前 {totalCalories}千卡</span>
              </div>
            )}
          </div>
        </div>

        {currentLayers.length > 0 && (
          <div className="mb-3">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 mb-2">
              <div className="flex items-center gap-1.5 mb-2"><Gauge className="w-3.5 h-3.5 text-purple-500" /><span className="text-xs font-semibold text-stone-600">口味实时匹配</span></div>
              <div className="flex flex-col gap-1.5">
                {tasteDimensions.map((dim) => (
                  <div key={dim.key} className="flex items-center gap-2">
                    <span className={`text-[10px] w-10 font-medium ${dim.active ? 'text-stone-700' : 'text-stone-400'}`}>{dim.label}{dim.active && <span className="text-purple-500 ml-0.5">★</span>}</span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-300" style={{ width: `${tasteProfile[dim.key] * 100}%`, backgroundColor: dim.active ? dim.color : '#d4d4d4', opacity: dim.active ? 1 : 0.5 }} /></div>
                    <span className="text-[10px] text-stone-400 w-7 text-right tabular-nums">{Math.round(tasteProfile[dim.key] * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {hints.length > 0 && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <div className="flex items-center gap-1.5 mb-2"><ArrowRight className="w-3.5 h-3.5 text-blue-500" /><span className="text-xs font-semibold text-blue-700">装配方向</span></div>
                <div className="flex flex-col gap-1">
                  {hints.map((h, i) => (
                    <div key={i} className={`text-xs px-2 py-1 rounded-lg ${
                      h.type === 'warn' ? 'bg-red-50 text-red-700 border border-red-100' :
                      h.type === 'tip' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {h.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs text-stone-500">匹配进度：<span className={`font-bold ${matchCount === 2 ? 'text-emerald-600' : matchCount === 1 ? 'text-amber-600' : 'text-stone-500'}`}>{matchCount}/2</span></span>
          <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden"><div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${(matchCount / 2) * 100}%` }} /></div>
        </div>
      </div>
    </div>
  )
}
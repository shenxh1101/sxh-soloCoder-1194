import { useSandwichStore } from '../store'
import { ListOrdered, X, Play, Trash2, ShoppingCart } from 'lucide-react'
import { useMemo } from 'react'

export default function ProductionQueue() {
  const queue = useSandwichStore((s) => s.productionQueue)
  const ingredients = useSandwichStore((s) => s.ingredients)
  const removeFromQueue = useSandwichStore((s) => s.removeFromQueue)
  const clearQueue = useSandwichStore((s) => s.clearQueue)
  const processQueueItem = useSandwichStore((s) => s.processQueueItem)
  const restockQueueMaterials = useSandwichStore((s) => s.restockQueueMaterials)

  const materials = useMemo(() => {
    const total: Record<string, number> = {}
    queue.forEach((item) => { item.layers.forEach((id) => { total[id] = (total[id] || 0) + 1 }) })
    return Object.entries(total).map(([id, need]) => {
      const ing = ingredients.find((i) => i.id === id)
      return { id, name: ing?.name ?? id, emoji: ing?.emoji ?? '', need, have: ing?.stock ?? 0, autoRestock: ing?.autoRestock ?? false }
    })
  }, [queue, ingredients])

  const autoCount = materials.filter((m) => m.have < m.need && m.autoRestock).length
  const manualCount = materials.filter((m) => m.have < m.need && !m.autoRestock).length

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-3 text-stone-400">
        <span className="text-2xl mb-1">📋</span>
        <p className="text-xs font-medium">生产队列为空</p>
        <p className="text-[10px] mt-0.5">从订单/配方/成品库加入待生产项</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
          <ListOrdered className="w-4 h-4 text-amber-500" />生产队列 ({queue.length})
        </span>
        <button onClick={clearQueue} className="text-xs text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1">
          <Trash2 className="w-3 h-3" />清空
        </button>
      </div>

      {materials.length > 0 && (
        <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
          <p className="text-[10px] text-stone-500 font-medium mb-1.5">队列总需求</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {materials.map((m) => {
              const enough = m.have >= m.need
              return (
                <span key={m.id} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  enough ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  m.autoRestock ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {m.emoji} {m.name} {m.have}/{m.need}
                  {!enough && !m.autoRestock && <span className="ml-0.5">!</span>}
                </span>
              )
            })}
          </div>
          {manualCount > 0 && (
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-red-600">⚠️ {manualCount} 种需手动确认</span>
              <span className="text-blue-600">📦 {autoCount} 种自动补货</span>
              <button onClick={restockQueueMaterials} className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium">
                <ShoppingCart className="w-3 h-3" />全部补货
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
        {queue.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-amber-100 hover:border-amber-200 transition-colors">
            <span className="text-[10px] text-stone-400 font-mono w-4">{index + 1}</span>
            <span className="text-xs text-stone-600 flex-1 font-medium truncate">{item.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">{item.source === 'order' ? '订单' : item.source === 'recipe' ? '配方' : '成品'}</span>
            <button onClick={() => processQueueItem(item.id)} className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors" title="开始生产">
              <Play className="w-3 h-3 text-emerald-600" />
            </button>
            <button onClick={() => removeFromQueue(item.id)} className="w-5 h-5 rounded-full bg-stone-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
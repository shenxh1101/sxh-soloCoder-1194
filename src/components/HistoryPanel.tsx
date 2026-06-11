import { useSandwichStore } from '../store'
import { Star, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function HistoryPanel() {
  const history = useSandwichStore((s) => s.history)
  const ingredients = useSandwichStore((s) => s.ingredients)
  const rateSandwich = useSandwichStore((s) => s.rateSandwich)
  const [expanded, setExpanded] = useState(false)

  const getIngredientName = (id: string) => {
    return ingredients.find((i) => i.id === id)?.name ?? id
  }

  const getIngredientColor = (id: string) => {
    return ingredients.find((i) => i.id === id)?.color ?? '#ccc'
  }

  const displayedHistory = expanded ? history : history.slice(0, 3)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-amber-900">
          历史记录
          {history.length > 0 && (
            <span className="ml-2 text-sm font-normal text-stone-400">({history.length})</span>
          )}
        </h2>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-stone-400 bg-white/50 rounded-2xl border border-dashed border-amber-200">
          <span className="text-4xl mb-2">📦</span>
          <p className="text-sm font-medium">还没有打包的三明治</p>
          <p className="text-xs mt-1">完成一个三明治后点击"打包"即可</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayedHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-amber-100 p-3 transition-all duration-200 hover:border-amber-200 hover:shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-stone-800">{item.name}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => rateSandwich(item.id, star)}
                      className="transition-transform duration-150 hover:scale-125"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= item.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {item.layers.map((id, i) => (
                  <span
                    key={i}
                    className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: getIngredientColor(id) + '30',
                      color: getIngredientColor(id),
                    }}
                  >
                    {getIngredientName(id)}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.createdAt}
                </span>
                <span>🔥 {item.totalCalories}千卡</span>
                <span>💰 ¥{item.totalCost.toFixed(1)}</span>
              </div>
            </div>
          ))}

          {history.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-center gap-1 py-2 text-sm text-amber-600 hover:text-amber-800 transition-colors font-medium"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  收起
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  查看全部 ({history.length})
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
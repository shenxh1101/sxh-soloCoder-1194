import { useSandwichStore } from '../store'
import { Star, Clock, ChevronDown, ChevronUp, Copy, MessageSquare, Filter } from 'lucide-react'
import { useState, useMemo } from 'react'

type SortMode = 'newest' | 'rating' | 'calories_asc' | 'calories_desc' | 'cost_asc' | 'cost_desc'

export default function HistoryPanel() {
  const history = useSandwichStore((s) => s.history)
  const ingredients = useSandwichStore((s) => s.ingredients)
  const rateSandwich = useSandwichStore((s) => s.rateSandwich)
  const updateNote = useSandwichStore((s) => s.updateNote)
  const copyFromHistory = useSandwichStore((s) => s.copyFromHistory)
  const [expanded, setExpanded] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [noteFilter, setNoteFilter] = useState('')

  const getIngredientName = (id: string) => {
    return ingredients.find((i) => i.id === id)?.name ?? id
  }

  const getIngredientColor = (id: string) => {
    return ingredients.find((i) => i.id === id)?.color ?? '#ccc'
  }

  const sortedHistory = useMemo(() => {
    let list = [...history]
    switch (sortMode) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'calories_asc':
        list.sort((a, b) => a.totalCalories - b.totalCalories)
        break
      case 'calories_desc':
        list.sort((a, b) => b.totalCalories - a.totalCalories)
        break
      case 'cost_asc':
        list.sort((a, b) => a.totalCost - b.totalCost)
        break
      case 'cost_desc':
        list.sort((a, b) => b.totalCost - a.totalCost)
        break
      default:
        break
    }
    if (noteFilter) {
      list = list.filter((h) => h.note.toLowerCase().includes(noteFilter.toLowerCase()))
    }
    return list
  }, [history, sortMode, noteFilter])

  const displayedHistory = expanded ? sortedHistory : sortedHistory.slice(0, 3)

  const handleStartNote = (id: string, currentNote: string) => {
    setEditingNote(id)
    setNoteDraft(currentNote)
  }

  const handleSaveNote = (id: string) => {
    updateNote(id, noteDraft)
    setEditingNote(null)
    setNoteDraft('')
  }

  const handleCopy = (id: string) => {
    copyFromHistory(id)
  }

  const sortOptions: { value: SortMode; label: string }[] = [
    { value: 'newest', label: '最新' },
    { value: 'rating', label: '评分' },
    { value: 'calories_asc', label: '热量↑' },
    { value: 'calories_desc', label: '热量↓' },
    { value: 'cost_asc', label: '价格↑' },
    { value: 'cost_desc', label: '价格↓' },
  ]

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

      {history.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-amber-100 p-1">
            <Filter className="w-3 h-3 text-stone-400 ml-1" />
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortMode(opt.value)}
                className={`text-xs px-2 py-1 rounded-lg transition-colors font-medium ${
                  sortMode === opt.value
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-stone-500 hover:bg-stone-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="搜索备注..."
            value={noteFilter}
            onChange={(e) => setNoteFilter(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-xl border border-amber-100 bg-white w-24 focus:outline-none focus:border-amber-300 text-stone-600 placeholder-stone-300"
          />
        </div>
      )}

      {sortedHistory.length === 0 && history.length > 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-stone-400 bg-white/50 rounded-2xl border border-dashed border-amber-200">
          <span className="text-2xl mb-1">🔍</span>
          <p className="text-xs">没有匹配的备注</p>
        </div>
      )}

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
              <div className="flex items-center gap-3 text-xs text-stone-400 mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.createdAt}
                </span>
                <span>🔥 {item.totalCalories}千卡</span>
                <span>💰 ¥{item.totalCost.toFixed(1)}</span>
              </div>

              {editingNote === item.id ? (
                <div className="flex gap-1.5 mb-1">
                  <input
                    type="text"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveNote(item.id)
                      if (e.key === 'Escape') setEditingNote(null)
                    }}
                    placeholder="添加备注..."
                    className="flex-1 text-xs px-2 py-1 rounded-lg border border-amber-200 bg-amber-50 focus:outline-none focus:border-amber-400 text-stone-700"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveNote(item.id)}
                    className="text-xs px-2 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors font-medium"
                  >
                    保存
                  </button>
                </div>
              ) : item.note ? (
                <div className="mb-1 text-xs text-stone-500 italic bg-stone-50 px-2 py-1 rounded-lg">
                  💬 {item.note}
                </div>
              ) : null}

              <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                <button
                  onClick={() => handleCopy(item.id)}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 transition-colors font-medium"
                >
                  <Copy className="w-3 h-3" />
                  再制一份
                </button>
                <button
                  onClick={() =>
                    editingNote === item.id
                      ? setEditingNote(null)
                      : handleStartNote(item.id, item.note)
                  }
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  {editingNote === item.id ? '取消' : '备注'}
                </button>
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
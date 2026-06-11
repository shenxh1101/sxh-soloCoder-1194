import { useSandwichStore } from '../store'
import { Star, Clock, ChevronDown, ChevronUp, Copy, MessageSquare, Filter, Heart, ShoppingCart, SlidersHorizontal, Save, Bookmark, BookmarkCheck, ListOrdered } from 'lucide-react'
import { useState, useMemo } from 'react'
import type { FilterPreset } from '../types'

type SortMode = 'newest' | 'rating' | 'calories_asc' | 'calories_desc' | 'cost_asc' | 'cost_desc'

export default function HistoryPanel() {
  const history = useSandwichStore((s) => s.history)
  const ingredients = useSandwichStore((s) => s.ingredients)
  const rateSandwich = useSandwichStore((s) => s.rateSandwich)
  const updateNote = useSandwichStore((s) => s.updateNote)
  const toggleFavorite = useSandwichStore((s) => s.toggleFavorite)
  const copyFromHistory = useSandwichStore((s) => s.copyFromHistory)
  const restockForLayers = useSandwichStore((s) => s.restockForLayers)
  const getMissingForLayers = useSandwichStore((s) => s.getMissingForLayers)
  const filterPresets = useSandwichStore((s) => s.filterPresets)
  const saveFilterPreset = useSandwichStore((s) => s.saveFilterPreset)
  const deleteFilterPreset = useSandwichStore((s) => s.deleteFilterPreset)

  const [expanded, setExpanded] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [ratingMin, setRatingMin] = useState(0)
  const [ratingMax, setRatingMax] = useState(5)
  const [calorieMin, setCalorieMin] = useState('')
  const [calorieMax, setCalorieMax] = useState('')
  const [costMin, setCostMin] = useState('')
  const [costMax, setCostMax] = useState('')
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [copyPending, setCopyPending] = useState<string | null>(null)
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [presetName, setPresetName] = useState('')

  const getIngredientName = (id: string) => ingredients.find((i) => i.id === id)?.name ?? id
  const getIngredientColor = (id: string) => ingredients.find((i) => i.id === id)?.color ?? '#ccc'

  const sortedHistory = useMemo(() => {
    let list = [...history]
    if (ratingMin > 0 || ratingMax < 5) list = list.filter((h) => h.rating >= ratingMin && h.rating <= ratingMax)
    if (calorieMin) list = list.filter((h) => h.totalCalories >= Number(calorieMin))
    if (calorieMax) list = list.filter((h) => h.totalCalories <= Number(calorieMax))
    if (costMin) list = list.filter((h) => h.totalCost >= Number(costMin))
    if (costMax) list = list.filter((h) => h.totalCost <= Number(costMax))
    if (favoriteOnly) list = list.filter((h) => h.favorite)
    switch (sortMode) {
      case 'rating': list.sort((a, b) => b.rating - a.rating); break
      case 'calories_asc': list.sort((a, b) => a.totalCalories - b.totalCalories); break
      case 'calories_desc': list.sort((a, b) => b.totalCalories - a.totalCalories); break
      case 'cost_asc': list.sort((a, b) => a.totalCost - b.totalCost); break
      case 'cost_desc': list.sort((a, b) => b.totalCost - a.totalCost); break
      default: break
    }
    return list
  }, [history, sortMode, ratingMin, ratingMax, calorieMin, calorieMax, costMin, costMax, favoriteOnly])

  const stats = useMemo(() => {
    if (sortedHistory.length === 0) return null
    const avgRating = sortedHistory.reduce((s, h) => s + h.rating, 0) / sortedHistory.length
    const avgCalories = sortedHistory.reduce((s, h) => s + h.totalCalories, 0) / sortedHistory.length
    const avgCost = sortedHistory.reduce((s, h) => s + h.totalCost, 0) / sortedHistory.length
    return { avgRating: avgRating.toFixed(1), avgCalories: Math.round(avgCalories), avgCost: avgCost.toFixed(1) }
  }, [sortedHistory])

  const displayedHistory = expanded ? sortedHistory : sortedHistory.slice(0, 3)
  const handleStartNote = (id: string, note: string) => { setEditingNote(id); setNoteDraft(note) }
  const handleSaveNote = (id: string) => { updateNote(id, noteDraft); setEditingNote(null); setNoteDraft('') }
  const handleCopy = (id: string) => { const ok = copyFromHistory(id); if (!ok) setCopyPending(id) }
  const handleCopyWithRestock = (id: string) => { const item = history.find((h) => h.id === id); if (item) { restockForLayers(item.layers); copyFromHistory(id) }; setCopyPending(null) }
  const getCopyMissing = (id: string) => { const item = history.find((h) => h.id === id); return item ? getMissingForLayers(item.layers) : [] }

  const handleSavePreset = () => {
    if (!presetName.trim()) return
    saveFilterPreset({ id: Date.now().toString(), name: presetName.trim(), ratingMin, ratingMax, calorieMin, calorieMax, costMin, costMax, favoriteOnly })
    setShowSavePreset(false)
    setPresetName('')
  }

  const applyPreset = (preset: FilterPreset) => {
    setRatingMin(preset.ratingMin); setRatingMax(preset.ratingMax)
    setCalorieMin(preset.calorieMin); setCalorieMax(preset.calorieMax)
    setCostMin(preset.costMin); setCostMax(preset.costMax)
    setFavoriteOnly(preset.favoriteOnly)
  }

  const sortOptions: { value: SortMode; label: string }[] = [
    { value: 'newest', label: '最新' }, { value: 'rating', label: '评分' },
    { value: 'calories_asc', label: '热量↑' }, { value: 'calories_desc', label: '热量↓' },
    { value: 'cost_asc', label: '价格↑' }, { value: 'cost_desc', label: '价格↓' },
  ]

  const activeFilterCount = [ratingMin > 0 || ratingMax < 5, !!calorieMin || !!calorieMax, !!costMin || !!costMax, favoriteOnly].filter(Boolean).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-amber-900">成品库{history.length > 0 && <span className="ml-2 text-sm font-normal text-stone-400">({sortedHistory.length}/{history.length})</span>}</h2>
      </div>

      {filterPresets.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {filterPresets.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p)}
              className="group flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors font-medium">
              <Bookmark className="w-3 h-3 fill-purple-300 text-purple-300" />{p.name}
              <button onClick={(e) => { e.stopPropagation(); deleteFilterPreset(p.id) }}
                className="opacity-0 group-hover:opacity-100 w-3 h-3 rounded-full bg-purple-200 flex items-center justify-center hover:bg-red-200 transition-all">
                <span className="text-[8px] text-red-500">✕</span>
              </button>
            </button>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white rounded-xl border border-amber-100 p-1">
              <Filter className="w-3 h-3 text-stone-400 ml-1" />
              {sortOptions.map((opt) => (
                <button key={opt.value} onClick={() => setSortMode(opt.value)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors font-medium ${sortMode === opt.value ? 'bg-amber-100 text-amber-800' : 'text-stone-500 hover:bg-stone-50'}`}>{opt.label}</button>
              ))}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-xl border transition-colors font-medium ${showFilters || activeFilterCount > 0 ? 'bg-purple-50 border-purple-200 text-purple-700' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
              <SlidersHorizontal className="w-3 h-3" />筛选{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
            <button onClick={() => setFavoriteOnly(!favoriteOnly)}
              className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-xl border transition-colors font-medium ${favoriteOnly ? 'bg-red-50 border-red-200 text-red-600' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
              <Heart className={`w-3 h-3 ${favoriteOnly ? 'fill-red-400 text-red-400' : ''}`} />收藏
            </button>
            {activeFilterCount > 0 && (
              <button onClick={() => setShowSavePreset(true)}
                className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors font-medium border border-purple-200">
                <Save className="w-3 h-3" />保存筛选
              </button>
            )}
          </div>

          {showSavePreset && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-purple-200 animate-in">
              <input type="text" value={presetName} onChange={(e) => setPresetName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSavePreset(); if (e.key === 'Escape') setShowSavePreset(false) }}
                placeholder="方案名称..." autoFocus className="flex-1 text-xs px-2 py-1 rounded-lg border border-purple-200 focus:outline-none focus:border-purple-400" />
              <button onClick={handleSavePreset} className="text-xs px-2 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium"><BookmarkCheck className="w-3 h-3 inline mr-1" />保存</button>
              <button onClick={() => setShowSavePreset(false)} className="text-xs text-stone-400 hover:text-stone-600">取消</button>
            </div>
          )}

          {showFilters && (
            <div className="bg-white rounded-xl border border-purple-100 p-3 flex flex-wrap gap-3 animate-in">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-stone-500">评分</span>
                {[0, 1, 2, 3, 4, 5].map((v) => (
                  <button key={v} onClick={() => {
                    if (ratingMin === v && ratingMax === 5) { setRatingMin(0) } else if (ratingMin === 0 && ratingMax === v) { setRatingMax(5) }
                    else { if (ratingMin === 0) { setRatingMin(v); setRatingMax(v) } else if (v < ratingMin) { setRatingMin(v) } else { setRatingMax(v) } }
                  }}
                  className={`text-xs px-1.5 py-0.5 rounded transition-colors font-medium ${v >= ratingMin && v <= ratingMax ? 'bg-amber-200 text-amber-800' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                    {v === 0 ? '全部' : '★'.repeat(v)}
                  </button>
                ))}
                <span className="text-[10px] text-stone-400">{ratingMin === 0 && ratingMax === 5 ? '全部' : `${ratingMin}-${ratingMax}★`}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-stone-500">热量</span>
                <input type="number" placeholder="最低" value={calorieMin} onChange={(e) => setCalorieMin(e.target.value)} className="w-16 text-xs px-1.5 py-0.5 rounded-lg border border-stone-200 focus:outline-none focus:border-purple-300" />
                <span className="text-xs text-stone-400">-</span>
                <input type="number" placeholder="最高" value={calorieMax} onChange={(e) => setCalorieMax(e.target.value)} className="w-16 text-xs px-1.5 py-0.5 rounded-lg border border-stone-200 focus:outline-none focus:border-purple-300" />
                <span className="text-xs text-stone-400">千卡</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-stone-500">价格</span>
                <input type="number" placeholder="最低" value={costMin} onChange={(e) => setCostMin(e.target.value)} className="w-16 text-xs px-1.5 py-0.5 rounded-lg border border-stone-200 focus:outline-none focus:border-purple-300" step="0.1" />
                <span className="text-xs text-stone-400">-</span>
                <input type="number" placeholder="最高" value={costMax} onChange={(e) => setCostMax(e.target.value)} className="w-16 text-xs px-1.5 py-0.5 rounded-lg border border-stone-200 focus:outline-none focus:border-purple-300" step="0.1" />
                <span className="text-xs text-stone-400">元</span>
              </div>
              {(ratingMin > 0 || ratingMax < 5 || calorieMin || calorieMax || costMin || costMax || favoriteOnly) && (
                <button onClick={() => { setRatingMin(0); setRatingMax(5); setCalorieMin(''); setCalorieMax(''); setCostMin(''); setCostMax(''); setFavoriteOnly(false) }}
                  className="text-xs text-purple-600 hover:text-purple-800 underline">清除筛选</button>
              )}
            </div>
          )}
        </div>
      )}

      {stats && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 text-xs">
          <span className="text-stone-500">当前筛选：</span>
          <span className="text-amber-600 font-semibold">⭐{stats.avgRating}</span>
          <span className="text-stone-300">|</span>
          <span className="text-orange-600 font-semibold">🔥{stats.avgCalories}千卡</span>
          <span className="text-stone-300">|</span>
          <span className="text-emerald-600 font-semibold">💰¥{stats.avgCost}</span>
        </div>
      )}

      {sortedHistory.length === 0 && history.length > 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-stone-400 bg-white/50 rounded-2xl border border-dashed border-amber-200"><span className="text-2xl mb-1">🔍</span><p className="text-xs">没有匹配的成品</p></div>
      )}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-stone-400 bg-white/50 rounded-2xl border border-dashed border-amber-200"><span className="text-4xl mb-2">📦</span><p className="text-sm font-medium">还没有打包的三明治</p><p className="text-xs mt-1">完成一个三明治后点击"打包"即可</p></div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayedHistory.map((item) => {
            const isCopyPending = copyPending === item.id
            const copyMissing = isCopyPending ? getCopyMissing(item.id) : []
            return (
              <div key={item.id} className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-sm p-3 ${item.favorite ? 'border-red-200 bg-red-50/30' : 'border-amber-100 hover:border-amber-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => toggleFavorite(item.id)} className="transition-transform duration-150 hover:scale-125"><Heart className={`w-4 h-4 ${item.favorite ? 'fill-red-400 text-red-400' : 'text-stone-300 hover:text-red-300'}`} /></button>
                    <span className="font-semibold text-sm text-stone-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-0.5">{[1,2,3,4,5].map((star) => (<button key={star} onClick={() => rateSandwich(item.id, star)} className="transition-transform duration-150 hover:scale-125"><Star className={`w-4 h-4 ${star <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 hover:text-amber-300'}`} /></button>))}</div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">{item.layers.map((id, i) => (<span key={i} className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: getIngredientColor(id) + '30', color: getIngredientColor(id) }}>{getIngredientName(id)}</span>))}</div>
                <div className="flex items-center gap-3 text-xs text-stone-400 mb-2"><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.createdAt}</span><span>🔥 {item.totalCalories}千卡</span><span>💰 ¥{item.totalCost.toFixed(1)}</span></div>
                {editingNote === item.id ? (
                  <div className="flex gap-1.5 mb-1"><input type="text" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNote(item.id); if (e.key === 'Escape') setEditingNote(null) }} placeholder="添加备注..." autoFocus className="flex-1 text-xs px-2 py-1 rounded-lg border border-amber-200 bg-amber-50 focus:outline-none focus:border-amber-400 text-stone-700" /><button onClick={() => handleSaveNote(item.id)} className="text-xs px-2 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors font-medium">保存</button></div>
                ) : item.note ? (<div className="mb-1 text-xs text-stone-500 italic bg-stone-50 px-2 py-1 rounded-lg">💬 {item.note}</div>) : null}
                {isCopyPending && copyMissing.length > 0 && (
                  <div className="mb-1 p-2 rounded-xl bg-orange-50 border border-orange-200"><p className="text-xs text-orange-700 font-medium mb-1.5">库存不足，需要补货：</p><div className="flex flex-wrap gap-1 mb-2">{copyMissing.map((m) => (<span key={m.id} className="text-xs px-1.5 py-0.5 rounded-full bg-white border border-orange-200 text-orange-600">{m.emoji} {m.name} {m.have}/{m.need}</span>))}</div><button onClick={() => handleCopyWithRestock(item.id)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium"><ShoppingCart className="w-3 h-3" />补货并继续</button></div>
                )}
                <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                  <button onClick={() => handleCopy(item.id)} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 transition-colors font-medium"><Copy className="w-3 h-3" />再制一份</button>
                  <button onClick={() => editingNote === item.id ? setEditingNote(null) : handleStartNote(item.id, item.note)} className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors"><MessageSquare className="w-3 h-3" />{editingNote === item.id ? '取消' : '备注'}</button>
                  <button
                    onClick={() => {
                      const store = useSandwichStore.getState()
                      store.addToQueue({ id: Date.now().toString(), name: item.name, layers: item.layers, source: 'history' })
                    }}
                    className="ml-auto flex items-center gap-1 text-xs text-stone-400 hover:text-blue-500 transition-colors">
                    <ListOrdered className="w-3 h-3" />加入队列
                  </button>
                </div>
              </div>
            )
          })}
          {sortedHistory.length > 3 && (
            <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-center gap-1 py-2 text-sm text-amber-600 hover:text-amber-800 transition-colors font-medium">
              {expanded ? (<><ChevronUp className="w-4 h-4" />收起</>) : (<><ChevronDown className="w-4 h-4" />查看全部 ({sortedHistory.length})</>)}
            </button>
          )}
        </div>
      )}
    </div>
  )}
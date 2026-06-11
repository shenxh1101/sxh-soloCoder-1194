import { useSandwichStore } from '../store'
import { RotateCcw, Package, Star, TrendingUp, X } from 'lucide-react'

export default function ControlBar() {
  const currentLayers = useSandwichStore((s) => s.currentLayers)
  const ingredients = useSandwichStore((s) => s.ingredients)
  const validationError = useSandwichStore((s) => s.validationError)
  const isPacking = useSandwichStore((s) => s.isPacking)
  const lastEvaluation = useSandwichStore((s) => s.lastEvaluation)
  const packSandwich = useSandwichStore((s) => s.packSandwich)
  const resetCurrent = useSandwichStore((s) => s.resetCurrent)
  const dismissEvaluation = useSandwichStore((s) => s.dismissEvaluation)

  const totalCalories = currentLayers.reduce((sum, id) => {
    const ing = ingredients.find((i) => i.id === id)
    return sum + (ing?.calories ?? 0)
  }, 0)

  const totalCost = currentLayers.reduce((sum, id) => {
    const ing = ingredients.find((i) => i.id === id)
    return sum + (ing?.cost ?? 0)
  }, 0)

  const canPack = currentLayers.length >= 3 && validationError === null

  return (
    <div className="flex flex-col gap-3">
      {lastEvaluation && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 p-4 shadow-lg animate-in">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-amber-900">顾客评价</span>
            </div>
            <button
              onClick={dismissEvaluation}
              className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-200 transition-colors"
            >
              <X className="w-3 h-3 text-amber-600" />
            </button>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-4xl font-bold text-amber-700">{lastEvaluation.totalScore}</div>
            <div className="text-sm text-amber-600 font-medium">分</div>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: '结构', score: lastEvaluation.orderScore, max: 30 },
              { label: '预算', score: lastEvaluation.budgetScore, max: 30 },
              { label: '热量', score: lastEvaluation.calorieScore, max: 25 },
              { label: '口味', score: lastEvaluation.tasteScore, max: 15 },
            ].map((item) => (
              <div key={item.label} className="bg-white/60 rounded-xl p-2 text-center">
                <div className="text-sm font-bold text-stone-700">{item.score}</div>
                <div className="text-[10px] text-stone-400">{item.label}</div>
                <div className="h-1 bg-stone-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(item.score / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-600 whitespace-pre-line leading-relaxed">{lastEvaluation.comment}</p>
        </div>
      )}

      {validationError && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-800 text-sm font-medium animate-in">
          <span className="text-lg shrink-0">⚠️</span>
          <div>
            <p>{validationError}</p>
            <p className="text-xs text-amber-600 mt-1 font-normal">请调整配料顺序后再打包，或使用"一键调整"功能。</p>
          </div>
        </div>
      )}
      {!validationError && currentLayers.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          <span className="text-lg">✅</span>
          <span>搭配合理，可以打包了！</span>
        </div>
      )}

      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-amber-100">
        <div className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold">
          <span className="text-orange-500 text-lg">🔥</span>
          <span className="text-amber-900">{totalCalories}</span>
          <span className="text-amber-600 text-xs">千卡</span>
        </div>
        <div className="w-px h-6 bg-amber-200" />
        <div className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold">
          <span className="text-amber-500 text-lg">💰</span>
          <span className="text-amber-900">{totalCost.toFixed(1)}</span>
          <span className="text-amber-600 text-xs">元</span>
        </div>
        <div className="w-px h-6 bg-amber-200" />
        <div className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold">
          <span className="text-amber-700">📐</span>
          <span className="text-amber-900">{currentLayers.length}</span>
          <span className="text-amber-600 text-xs">层</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={resetCurrent}
          disabled={currentLayers.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all duration-200 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed border border-stone-200"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
        <button
          onClick={packSandwich}
          disabled={!canPack || isPacking}
          title={validationError ? validationError : undefined}
          className="flex-[2] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-bold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Package className="w-4 h-4" />
          {isPacking ? '打包中...' : validationError ? '无法打包' : '打包三明治'}
        </button>
      </div>
    </div>
  )
}
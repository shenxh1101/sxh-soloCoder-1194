import { useSandwichStore } from '../store'
import { RotateCcw, Package } from 'lucide-react'

export default function ControlBar() {
  const currentLayers = useSandwichStore((s) => s.currentLayers)
  const ingredients = useSandwichStore((s) => s.ingredients)
  const validationError = useSandwichStore((s) => s.validationError)
  const isPacking = useSandwichStore((s) => s.isPacking)
  const packSandwich = useSandwichStore((s) => s.packSandwich)
  const resetCurrent = useSandwichStore((s) => s.resetCurrent)

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
      {validationError && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium animate-in slide-in-from-top-2">
          <span className="text-lg">⚠️</span>
          <span>{validationError}</span>
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
          className="flex-[2] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-bold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Package className="w-4 h-4" />
          {isPacking ? '打包中...' : '打包三明治'}
        </button>
      </div>
    </div>
  )
}
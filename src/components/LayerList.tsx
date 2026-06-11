import { useSandwichStore } from '../store'
import { X } from 'lucide-react'

export default function LayerList() {
  const currentLayers = useSandwichStore((s) => s.currentLayers)
  const ingredients = useSandwichStore((s) => s.ingredients)
  const removeLayer = useSandwichStore((s) => s.removeLayer)

  const getIngredient = (id: string) => ingredients.find((i) => i.id === id)

  if (currentLayers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-stone-400">
        <span className="text-4xl mb-2">🥪</span>
        <p className="text-sm font-medium">点击左侧配料开始制作</p>
        <p className="text-xs mt-1">配料将按点击顺序从下往上堆叠</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
        当前层次（从下到上）
      </h3>
      {currentLayers.map((id, index) => {
        const ing = getIngredient(id)
        if (!ing) return null
        return (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-amber-100 group hover:border-amber-200 transition-all"
          >
            <span className="text-xs text-stone-400 font-mono w-5">{index + 1}</span>
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-sm"
              style={{ backgroundColor: ing.color + '40' }}
            >
              {ing.emoji}
            </div>
            <span className="text-sm font-medium text-stone-700 flex-1">{ing.name}</span>
            <button
              onClick={() => removeLayer(index)}
              className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
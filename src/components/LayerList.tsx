import { useSandwichStore } from '../store'
import { X, GripVertical, Wand2 } from 'lucide-react'
import { useRef, useState } from 'react'

export default function LayerList() {
  const currentLayers = useSandwichStore((s) => s.currentLayers)
  const ingredients = useSandwichStore((s) => s.ingredients)
  const removeLayer = useSandwichStore((s) => s.removeLayer)
  const reorderLayers = useSandwichStore((s) => s.reorderLayers)
  const autoFixBread = useSandwichStore((s) => s.autoFixBread)

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragItemRef = useRef<number | null>(null)

  const getIngredient = (id: string) => ingredients.find((i) => i.id === id)

  const handleDragStart = (index: number) => {
    dragItemRef.current = index
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (index: number) => {
    const from = dragItemRef.current
    if (from !== null && from !== index) {
      reorderLayers(from, index)
    }
    setDragIndex(null)
    setDragOverIndex(null)
    dragItemRef.current = null
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
    dragItemRef.current = null
  }

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
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          当前层次（从下到上）
        </h3>
        <button
          onClick={autoFixBread}
          className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-amber-50"
          title="自动将面包放到底部和顶部，肉饼移到推荐位置"
        >
          <Wand2 className="w-3 h-3" />
          一键调整
        </button>
      </div>

      {currentLayers.map((id, index) => {
        const ing = getIngredient(id)
        if (!ing) return null
        const isDragging = dragIndex === index
        const isDragOver = dragOverIndex === index

        return (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing group ${
              isDragging
                ? 'opacity-40 scale-95 border-amber-300'
                : isDragOver
                ? 'border-amber-400 bg-amber-50 shadow-md scale-[1.02]'
                : 'bg-white border-amber-100 hover:border-amber-200'
            }`}
          >
            <div className="flex items-center gap-1.5 text-stone-300 group-hover:text-stone-400 transition-colors">
              <GripVertical className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs text-stone-400 font-mono w-5">{index + 1}</span>
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-sm shrink-0"
              style={{ backgroundColor: ing.color + '40' }}
            >
              {ing.emoji}
            </div>
            <span className="text-sm font-medium text-stone-700 flex-1">{ing.name}</span>
            {index === 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                底
              </span>
            )}
            {index === currentLayers.length - 1 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                顶
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeLayer(index)
              }}
              className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )
      })}

      <p className="text-[10px] text-stone-400 mt-1 text-center">
        拖拽可调整层次顺序 · 点击"一键调整"自动修正面包和肉饼位置
      </p>
    </div>
  )
}
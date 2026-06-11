import IngredientPanel from '../components/IngredientPanel'
import Sandwich3DView from '../components/Sandwich3DView'
import ControlBar from '../components/ControlBar'
import RecipePanel from '../components/RecipePanel'
import HistoryPanel from '../components/HistoryPanel'
import LayerList from '../components/LayerList'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef7ed] via-[#faf3e6] to-[#f5e6d3]">
      <header className="border-b border-amber-200/60 bg-white/40 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
              🥪
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900 tracking-tight">三明治工坊</h1>
              <p className="text-xs text-stone-500">Sandwich Assembly Line</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            流水线就绪
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 flex flex-col gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 shadow-sm">
              <IngredientPanel />
            </div>
          </div>

          <div className="col-span-6 flex flex-col gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-amber-100 shadow-sm overflow-hidden" style={{ height: '420px' }}>
              <Sandwich3DView />
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 shadow-sm">
              <ControlBar />
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 shadow-sm">
              <LayerList />
            </div>
          </div>

          <div className="col-span-3 flex flex-col gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 shadow-sm">
              <HistoryPanel />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 shadow-sm">
            <RecipePanel />
          </div>
        </div>
      </main>
    </div>
  )
}
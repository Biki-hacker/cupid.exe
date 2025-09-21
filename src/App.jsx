import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import BootScreen from './pages/BootScreen'
import LoadingScreen from './pages/LoadingScreen'
import CouponsPage from './pages/CouponsPage'

function App() {
  const location = useLocation()
  const path = location.pathname
  const fontClass =
    path === '/' ? 'font-terminal' :
    path.startsWith('/loading') ? 'font-handwritten' :
    path.startsWith('/coupons') ? 'font-playpen' :
    'font-terminal'
  return (
    <div className={`relative min-h-screen ${fontClass}`}>
      {/* Content wrapper with bottom padding so fixed footer doesn't overlap */}
      <div className="pb-16">
        <Routes>
          <Route path="/" element={<BootScreen />} />
          <Route path="/loading" element={<LoadingScreen />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Global footer fixed at the bottom of the viewport */}
      <footer className="fixed bottom-0 left-0 w-full py-3 text-center text-xs text-gray-300 bg-zinc-900 border-t border-zinc-800 shadow-lg">
        <span className="font-medium">“Site developed with 99% love, 1% caffeine, and unlimited patience for you ☕💖”</span>
      </footer>
    </div>
  )
}

export default App

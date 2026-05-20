import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AppRoutes from './routes/AppRoutes'

function App() {
  const { isLoading } = useSelector((state) => state.ui)

  return (
    <Router>
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <AppRoutes />
    </Router>
  )
}

export default App
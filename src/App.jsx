import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import TopNavBar from './components/ui/TopNavBar'

// Lazy loaded routes
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Restaurant = lazy(() => import('./pages/Restaurant'))
const Cart = lazy(() => import('./pages/Cart'))
const Orders = lazy(() => import('./pages/Orders'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'))
const NoAccess = lazy(() => import('./pages/NoAccess'))
const NotFound = lazy(() => import('./pages/NotFound'))

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse" />
    <div className="relative z-10 flex flex-col items-center space-y-6">
      <h1 className="text-5xl font-bold text-text-primary tracking-tight animate-pulse font-serif">BiteZone</h1>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2.5 h-2.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2.5 h-2.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      {/* Root: full viewport, no overflow clamping, let page containers manage width */}
      <div className="min-h-screen bg-background text-text-primary transition-colors duration-200 relative flex flex-col">
        {/* TopNavBar: shows on sm+ for student routes */}
        <TopNavBar />

        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Student / Public Routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/restaurant/:id" element={<ProtectedRoute><Restaurant /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="restaurant_admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/super-admin" element={<ProtectedRoute requiredRole="superadmin"><SuperAdminDashboard /></ProtectedRoute>} />

            {/* Fallbacks */}
            <Route path="/no-access" element={<NoAccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {user && <PWAInstallPrompt />}
      </div>
    </Router>
  )
}

export default App

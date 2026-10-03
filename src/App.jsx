import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PWAInstallPrompt from './components/PWAInstallPrompt'
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

// Simple loading fallback for Suspense
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  const { user } = useAuth();
  
  return (
    <Router>
      <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
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

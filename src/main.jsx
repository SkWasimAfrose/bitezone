import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './lib/AuthContext'

import { CartProvider } from './lib/CartContext'
import { RestaurantsProvider } from './lib/RestaurantsContext'
import { OrdersProvider } from './lib/OrdersContext'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <RestaurantsProvider>
          <OrdersProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </OrdersProvider>
        </RestaurantsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)

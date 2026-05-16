import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import OrdersList from './pages/orders/OrdersList';
import OrderDetails from './pages/orders/OrderDetails';
import AgentManagement from './pages/admin/AgentManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import ZRExpressAccountManagement from './pages/admin/ZRExpressAccountManagement';
import DeliveryFees from './pages/admin/DeliveryFees';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              
              {/* Admin Only */}
              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/agents" element={<AgentManagement />} />
                <Route path="/categories" element={<CategoryManagement />} />
                <Route path="/zr-accounts" element={<ZRExpressAccountManagement />} />
                <Route path="/delivery-fees" element={<DeliveryFees />} />
              </Route>
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

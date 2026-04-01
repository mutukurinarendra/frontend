import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, OwnerRoute } from './routes/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IntakeOrder from './pages/IntakeOrder';
import Orders from './pages/Orders';
import UserManagement from './pages/UserManagement';
import Invoice from './pages/Invoice';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected routes — all logged-in users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/intake" element={<IntakeOrder />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id/invoice" element={<Invoice />} />
            </Route>

            {/* Owner-only routes */}
            <Route element={<OwnerRoute />}>
              <Route path="/users" element={<UserManagement />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

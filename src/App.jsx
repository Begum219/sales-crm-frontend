import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import authService from './services/authService';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import Deals from './pages/Deals';
import Offers from './pages/Offers';
import Layout from './components/Layout';
import DealDetail from './pages/DealDetail';

function ProtectedRoute({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/deals/:id" element={<DealDetail />} />
          <Route path="/offers" element={<Offers />} />

        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
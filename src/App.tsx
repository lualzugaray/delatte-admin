import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Dashboard from './pages/Dashboard';
import CafesList from './pages/CafesList';
import UsersList from './pages/UsersList';
import ReviewsList from './pages/ReviewsList';
import CategoriesList from './pages/CategoriesList';
import ReviewReportsList from './pages/ReviewReportsList';
import Login from './pages/Login';
import CafeDetail from './pages/CafeDetail';
import { ToastContainer } from 'react-toastify';
import Sidebar from './components/Sidebar';

function ProtectedLayout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, logout, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <ProtectedLayout
                onLogout={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cafes" element={<CafesList />} />
          <Route path="users" element={<UsersList />} />
          <Route path="categories" element={<CategoriesList />} />
          <Route path="reviews" element={<ReviewsList />} />
          <Route path="reports" element={<ReviewReportsList />} />
          <Route path="cafes/:id" element={<CafeDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </BrowserRouter>
  );
}

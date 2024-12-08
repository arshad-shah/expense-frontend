import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Profile from './pages/Profile';
import Login from './pages/login';
import Register from './pages/register';

// Wrapper for authenticated pages with navigation and default layout
const AuthenticatedLayout = ({ children }) => (
  <>
    <Navigation />
    <main className="container w-full mx-auto px-4">
      {children}
    </main>
  </>
);

// Wrapper for public pages with full height and no navigation
const PublicLayout = ({ children }) => (
  <main className="min-h-screen">
    {children}
  </main>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <PublicLayout>
                  <Login />
                </PublicLayout>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicLayout>
                  <Register />
                </PublicLayout>
              } 
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Accounts />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Transactions />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/budgets"
              element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Budgets />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Profile />
                  </AuthenticatedLayout>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
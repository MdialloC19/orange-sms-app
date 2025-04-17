import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './features/auth/contexts/AuthContext';

// Import des pages d'authentification
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';

// Page du tableau de bord
const DashboardPage = () => (
  <div className="container-app py-8">
    <h1 className="mb-6 text-2xl font-bold text-gray-900">Tableau de bord</h1>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="card bg-orange-50">
        <h2 className="mb-2 font-semibold text-orange-700">SMS envoyés</h2>
        <p className="text-3xl font-bold text-orange-600">0</p>
      </div>
      <div className="card bg-blue-50">
        <h2 className="mb-2 font-semibold text-blue-700">Contacts</h2>
        <p className="text-3xl font-bold text-blue-600">0</p>
      </div>
      <div className="card bg-green-50">
        <h2 className="mb-2 font-semibold text-green-700">Taux de livraison</h2>
        <p className="text-3xl font-bold text-green-600">0%</p>
      </div>
    </div>
  </div>
);

// Composant pour les routes protégées qui nécessitent une authentification
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { state } = useAuth();
  
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Wrapper de l'application
const AppWrapper = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

// Composant des routes avec accès au contexte d'authentification
const AppRoutes = () => {
  const { state } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Vérifie si un token existe au chargement initial
  useEffect(() => {
    const checkAuth = async () => {
      // Dans une application réelle, on pourrait vérifier la validité du token ici
      // en appelant l'API backend avec le endpoint /auth/me
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Affiche un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={state.isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/signup" element={state.isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage />} />
        
        {/* Routes protégées */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        {/* Route par défaut */}
        <Route path="/" element={<Navigate to={state.isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

function App() {
  return <AppWrapper />;
}

export default App;

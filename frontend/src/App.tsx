import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './features/auth/contexts/AuthContext';
import { SmsProvider } from './features/sms/contexts/SmsContext';
import { ContactProvider } from './features/contacts/contexts/ContactContext';

// Import des pages d'authentification
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';

// Import des pages du tableau de bord
import DashboardPage from './features/dashboard/pages/DashboardPage';
import SendSmsPage from './features/sms/pages/SendSmsPage';
import SmsHistoryPage from './features/sms/pages/SmsHistoryPage';
import ContactsPage from './features/contacts/pages/ContactsPage';

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
        <SmsProvider>
          <ContactProvider>
            <AppRoutes />
          </ContactProvider>
        </SmsProvider>
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
        <Route path="/send-sms" element={
          <ProtectedRoute>
            <SendSmsPage />
          </ProtectedRoute>
        } />
        <Route path="/sms-history" element={
          <ProtectedRoute>
            <SmsHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/contacts" element={
          <ProtectedRoute>
            <ContactsPage />
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

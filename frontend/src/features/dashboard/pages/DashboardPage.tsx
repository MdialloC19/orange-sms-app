import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { Link } from 'react-router-dom';

// Icônes SVG
const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const ContactIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const DeliveryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Types pour les statistiques
type DashboardStats = {
  totalSms: number;
  totalContacts: number;
  deliveryRate: number;
  recentSms: Array<{
    id: string;
    recipient: string;
    content: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    date: string;
  }>;
};

const DashboardPage = () => {
  const { state } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSms: 0,
    totalContacts: 0,
    deliveryRate: 0,
    recentSms: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Simuler le chargement des données (à remplacer par un appel API réel)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Exemple de données - à remplacer par des données réelles de l'API
      setStats({
        totalSms: 15,
        totalContacts: 7,
        deliveryRate: 92,
        recentSms: [
          {
            id: '1',
            recipient: '+221 77 123 45 67',
            content: 'Bonjour, votre commande est prête à être livrée.',
            status: 'delivered',
            date: '2025-04-18T09:30:00Z'
          },
          {
            id: '2',
            recipient: '+221 76 987 65 43',
            content: 'Rappel: Réunion à 14h aujourd\'hui.',
            status: 'sent',
            date: '2025-04-18T08:15:00Z'
          },
          {
            id: '3',
            recipient: '+221 78 456 78 90',
            content: 'Votre code de confirmation est: 123456',
            status: 'pending',
            date: '2025-04-18T10:05:00Z'
          }
        ]
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-SN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Livré';
      case 'sent':
        return 'Envoyé';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échec';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-orange-600 border-orange-200"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container-app">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="text-orange-600 mr-2">
                <svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60 30C43.43 30 30 43.43 30 60C30 76.57 43.43 90 60 90C76.57 90 90 76.57 90 60C90 43.43 76.57 30 60 30ZM60 75C51.72 75 45 68.28 45 60C45 51.72 51.72 45 60 45C68.28 45 75 51.72 75 60C75 68.28 68.28 75 60 75Z" fill="currentColor"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Orange SMS Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {state.user?.email || 'Utilisateur'}
              </span>
              <button 
                onClick={() => {} /* Implémenter la déconnexion */}
                className="rounded-md bg-gray-100 p-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="container-app py-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-gray-600">Bienvenue sur votre espace Orange SMS Pro</p>
        </div>

        {/* Cartes statistiques */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <div className="card bg-white">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                <MessageIcon />
              </div>
              <div>
                <p className="text-gray-600">SMS envoyés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSms}</p>
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <ContactIcon />
              </div>
              <div>
                <p className="text-gray-600">Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <DeliveryIcon />
              </div>
              <div>
                <p className="text-gray-600">Taux de livraison</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveryRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid gap-4 mb-8 md:grid-cols-2">
          <Link 
            to="/send-sms"
            className="card bg-orange-50 hover:bg-orange-100 transition-colors p-6 flex items-center"
          >
            <div className="text-orange-600 mr-4">
              <MessageIcon />
            </div>
            <div>
              <h3 className="font-bold text-orange-900">Envoyer un SMS</h3>
              <p className="text-orange-700">Composer et envoyer un nouveau message</p>
            </div>
          </Link>

          <Link 
            to="/contacts"
            className="card bg-blue-50 hover:bg-blue-100 transition-colors p-6 flex items-center"
          >
            <div className="text-blue-600 mr-4">
              <ContactIcon />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">Gérer les contacts</h3>
              <p className="text-blue-700">Ajouter ou modifier vos contacts</p>
            </div>
          </Link>
        </div>

        {/* Derniers SMS envoyés */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Derniers SMS envoyés</h3>
          
          <div className="card bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destinataire
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentSms.map((sms) => (
                    <tr key={sms.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sms.recipient}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                        {sms.content}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(sms.status)}`}>
                          {getStatusText(sms.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(sms.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 text-right">
            <Link to="/sms-history" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
              Voir tout l'historique →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

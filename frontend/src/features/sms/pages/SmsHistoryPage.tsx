import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useSms } from '../contexts/SmsContext';
import { SMS } from '../../../types/api';

// Types pour les filtres
type SmsFilter = {
  search: string;
  status: '' | 'pending' | 'sent' | 'delivered' | 'failed';
  dateRange: string;
};

// Composant pour l'historique des SMS
const SmsHistoryPage = () => {
  const { state: authState, logout } = useAuth();
  const { state: smsState, fetchSmsHistory, clearError } = useSms();
  const [filters, setFilters] = useState<SmsFilter>({
    search: '',
    status: '',
    dateRange: 'all'
  });
  const [page, setPage] = useState(1);

  // Charger l'historique des SMS depuis l'API
  useEffect(() => {
    fetchSmsHistory();
  }, [fetchSmsHistory]);
  
  // Nettoyer les erreurs lors du démontage
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Appliquer les filtres et la pagination aux SMS
  const filteredSms = smsState.smsHistory.filter((sms) => {
    // Filtre par texte de recherche
    const searchMatch = filters.search
      ? sms.recipient_number.toLowerCase().includes(filters.search.toLowerCase()) ||
        sms.content.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    
    // Filtre par statut
    const statusMatch = filters.status ? sms.status === filters.status : true;
    
    // Filtre par plage de dates
    let dateMatch = true;
    const smsDate = new Date(sms.created_at);
    const today = new Date();
    
    if (filters.dateRange === 'today') {
      dateMatch = smsDate.toDateString() === today.toDateString();
    } else if (filters.dateRange === 'week') {
      const weekStart = new Date();
      weekStart.setDate(today.getDate() - 7);
      dateMatch = smsDate >= weekStart && smsDate <= today;
    } else if (filters.dateRange === 'month') {
      const monthStart = new Date();
      monthStart.setMonth(today.getMonth() - 1);
      dateMatch = smsDate >= monthStart && smsDate <= today;
    }
    
    return searchMatch && statusMatch && dateMatch;
  });

  // Pagination
  const itemsPerPage = 10;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSms = filteredSms.slice(startIndex, endIndex);
  const totalFilteredPages = Math.ceil(filteredSms.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (key: keyof SmsFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Réinitialiser à la première page lors du changement de filtre
  };

  // Formater une date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (smsState.isLoading) {
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
              <Link to="/dashboard" className="text-xl font-bold text-gray-900 hover:text-orange-600">Orange SMS Pro</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard"
                className="flex items-center rounded-md bg-gray-100 p-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Tableau de bord
              </Link>
              <span className="text-sm text-gray-700">
                {authState.user?.email || 'Utilisateur'}
              </span>
              <button 
                onClick={logout}
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Historique des SMS</h2>
            <p className="text-gray-600">Consultez l'historique complet de vos envois de SMS</p>
          </div>
          <div>
            <Link
              to="/send-sms"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nouveau SMS
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <div className="card bg-white mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="form-input pl-10"
                  placeholder="Rechercher par numéro ou contenu..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="status"
                className="form-input"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value as SmsFilter['status'])}
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="sent">Envoyé</option>
                <option value="delivered">Livré</option>
                <option value="failed">Échec</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                Période
              </label>
              <select
                id="dateRange"
                className="form-input"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des SMS */}
        <div className="card bg-white overflow-hidden">
          {filteredSms.length === 0 ? (
            <div className="py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun SMS trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.status || filters.dateRange !== 'all'
                  ? 'Aucun message ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore envoyé de SMS.'}
              </p>
              <div className="mt-6">
                <Link
                  to="/send-sms"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  Envoyer un nouveau SMS
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destinataire
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedSms.map((sms) => (
                      <tr key={sms.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(sms.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sms.recipient_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                          {sms.content}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(sms.status)}`}>
                            {getStatusText(sms.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalFilteredPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Précédent
                    </button>
                    <button
                      disabled={page === totalFilteredPages}
                      onClick={() => handlePageChange(page + 1)}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        page === totalFilteredPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Suivant
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                        <span className="font-medium">
                          {Math.min(endIndex, filteredSms.length)}
                        </span>{' '}
                        sur <span className="font-medium">{filteredSms.length}</span> résultats
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          disabled={page === 1}
                          onClick={() => handlePageChange(page - 1)}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Précédent</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {Array.from({ length: totalFilteredPages }).map((_, index) => {
                          const pageNumber = index + 1;
                          const isCurrentPage = pageNumber === page;
                          
                          // Afficher seulement certaines pages pour éviter d'encombrer l'interface
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalFilteredPages ||
                            (pageNumber >= page - 1 && pageNumber <= page + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  isCurrentPage
                                    ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                          
                          // Ajouter des points de suspension pour les plages de pages non affichées
                          if (
                            (pageNumber === 2 && page > 3) ||
                            (pageNumber === totalFilteredPages - 1 && page < totalFilteredPages - 2)
                          ) {
                            return (
                              <span
                                key={pageNumber}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          
                          return null;
                        })}
                        
                        <button
                          disabled={page === totalFilteredPages}
                          onClick={() => handlePageChange(page + 1)}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            page === totalFilteredPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Suivant</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SmsHistoryPage;

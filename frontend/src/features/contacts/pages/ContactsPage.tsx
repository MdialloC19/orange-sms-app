import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useContact } from '../contexts/ContactContext';
import { Contact, ContactCreate, ContactUpdate } from '../../../types/api';

// Icônes SVG
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

// Schéma de validation pour les contacts
const contactSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  phone_number: z
    .string()
    .min(1, { message: 'Le numéro de téléphone est requis' })
    .refine(
      (value) => {
        // Nettoyer le numéro de tous les espaces, tirets, etc.
        const cleaned = value.replace(/[\s\-\.()]/g, '');
        
        // Format valide: +221 7X XXX XX XX ou 7X XXX XX XX
        // Accepte les numéros commencant par 70, 75, 76, 77, 78
        const senegalRegex = /^(\+221|221)?[7][0,5-8]\d{7}$/;
        
        return senegalRegex.test(cleaned);
      },
      {
        message: 'Format: +221 7X XXX XX XX (numéro sénégalais)'
      }
    ),
  notes: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const ContactsPage = () => {
  const { state: authState, logout } = useAuth();
  const { 
    state: contactState, 
    fetchContacts, 
    createContact, 
    updateContact, 
    deleteContact: removeContact, 
    setCurrentContact,
    clearCurrentContact,
    clearError,
    clearSuccess
  } = useContact();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone_number: '',
      notes: '',
    },
  });

  // Charger les contacts depuis l'API
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);
  
  // Nettoyer les erreurs et succès lors du démontage
  useEffect(() => {
    return () => {
      clearError();
      clearSuccess();
    };
  }, [clearError, clearSuccess]);

  // Filtrer les contacts selon le terme de recherche
  const filteredContacts = contactState.contacts.filter(contact => {
    const searchValue = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchValue) ||
      contact.phone_number.toLowerCase().includes(searchValue) ||
      (contact.notes && contact.notes.toLowerCase().includes(searchValue))
    );
  });

  const handleEdit = (contact: Contact) => {
    setIsEditing(true);
    setCurrentContact(contact);
    setValue('name', contact.name);
    setValue('phone_number', contact.phone_number.replace(/\s+/g, ''));
    setValue('notes', contact.notes || '');
    window.scrollTo(0, 0);
  };

  const handleDelete = (contact: Contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    // Appeler le service via le contexte pour supprimer le contact
    await removeContact(contactToDelete.id);
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  const onSubmit = async (data: ContactFormValues) => {
    try {
      // Formater le numéro de téléphone en format international standard
      // Nettoyer d'abord le numéro de tous les espaces, tirets, etc.
      let phoneNumber = data.phone_number.replace(/[\s\-\.()]/g, '');
      
      // S'assurer que le numéro commence par +221
      if (!phoneNumber.startsWith('+221')) {
        if (phoneNumber.startsWith('221')) {
          phoneNumber = '+' + phoneNumber;
        } else {
          phoneNumber = '+221' + phoneNumber.replace(/^0/, '');
        }
      }
      
      // Mettre à jour le numéro formaté
      data.phone_number = phoneNumber;
      const formattedPhone = formatPhoneNumber(data.phone_number);
      
      if (isEditing && contactState.currentContact) {
        // Créer l'objet de mise à jour du contact
        const contactData: ContactUpdate = {
          name: data.name,
          phone_number: formattedPhone,
          notes: data.notes || ''
        };
        
        // Mettre à jour le contact
        await updateContact(contactState.currentContact.id, contactData);
        
        // Réinitialiser le formulaire si pas d'erreur
        if (!contactState.error) {
          reset();
          setIsEditing(false);
          clearCurrentContact();
        }
      } else {
        // Créer l'objet de création de contact
        const contactData: ContactCreate = {
          name: data.name,
          phone_number: formattedPhone,
          notes: data.notes || ''
        };
        
        // Créer le contact
        await createContact(contactData);
        
        // Réinitialiser le formulaire si pas d'erreur
        if (!contactState.error) {
          reset();
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du contact:', error);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    clearCurrentContact();
    reset();
  };

  // Fonction pour formater les numéros de téléphone
  const formatPhoneNumber = (phone: string) => {
    // Retirer tout ce qui n'est pas un chiffre
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Ajouter le préfixe +221 si nécessaire
    let formattedNumber = digitsOnly;
    if (digitsOnly.length === 9) {
      // Numéro sans indicatif
      formattedNumber = `+221${digitsOnly}`;
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('221')) {
      // Numéro avec indicatif sans +
      formattedNumber = `+${digitsOnly}`;
    }
    
    // Formatter pour l'affichage (ex: +221 77 123 45 67)
    if (formattedNumber.startsWith('+221') && formattedNumber.length === 13) {
      return `${formattedNumber.substring(0, 5)} ${formattedNumber.substring(5, 7)} ${formattedNumber.substring(7, 10)} ${formattedNumber.substring(10, 12)} ${formattedNumber.substring(12)}`;
    }
    
    return formattedNumber;
  };

  if (contactState.isLoading) {
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
            <h2 className="text-2xl font-bold text-gray-900">Gestion des contacts</h2>
            <p className="text-gray-600">Ajoutez, modifiez ou supprimez vos contacts</p>
          </div>
          <Link 
            to="/dashboard" 
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Retour au tableau de bord
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Formulaire */}
          <div className="md:col-span-1">
            <div className="card bg-white">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? 'Modifier le contact' : 'Ajouter un contact'}
              </h3>

              {contactState.success && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{contactState.success}</p>
                    </div>
                  </div>
                </div>
              )}

              {contactState.error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{contactState.error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom et prénom
                  </label>
                  <Input
                    type="text"
                    placeholder="Entrez le nom et prénom"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Numéro de téléphone
                  </label>
                  <Input
                    type="text"
                    placeholder="+221 XX XXX XX XX"
                    error={errors.phone_number?.message}
                    {...register('phone_number')}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: +221 7X XXX XX XX (numéro sénégalais)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes (optionnel)
                  </label>
                  <textarea
                    className={`form-input min-h-[80px] resize-none ${errors.notes ? 'border-red-500' : ''}`}
                    placeholder="Ajoutez des notes sur ce contact..."
                    {...register('notes')}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={contactState.isLoading}
                    disabled={contactState.isLoading}
                  >
                    {isEditing ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                  
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={cancelEdit}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Liste des contacts */}
          <div className="md:col-span-2">
            <div className="card bg-white">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Mes contacts ({filteredContacts.length})
                </h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="form-input pl-10"
                    placeholder="Rechercher un contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredContacts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">
                    {searchTerm
                      ? 'Aucun contact ne correspond à votre recherche.'
                      : 'Vous n\'avez pas encore de contacts. Commencez par en ajouter un.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Téléphone
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{contact.phone_number}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {contact.notes || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(contact)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <EditIcon />
                              </button>
                              <button
                                onClick={() => handleDelete(contact)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <DeleteIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Confirmer la suppression
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer le contact <span className="font-medium">{contactToDelete?.name}</span> ? Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useContact } from '../../contacts/contexts/ContactContext';
import { useSms } from '../contexts/SmsContext';
import { Contact, SMSSend } from '../../../types/api';

// Schéma de validation du formulaire
const smsSchema = z.object({
  recipient_number: z
    .string()
    .min(1, { message: 'Le numéro de téléphone est requis' })
    .regex(/^(\+221|221)?[76|77|78|70|75]\d{7}$/, {
      message: 'Entrez un numéro de téléphone sénégalais valide'
    }),
  message: z
    .string()
    .min(1, { message: 'Le message est requis' })
    .max(160, { message: 'Le message ne peut pas dépasser 160 caractères' }),
  recipient_id: z.string().optional(),
});

type SmsFormValues = z.infer<typeof smsSchema>;

const SendSmsPage = () => {
  const { state: authState, logout } = useAuth();
  const { state: contactState, fetchContacts } = useContact();
  const { state: smsState, sendSms, clearError, clearSuccess } = useSms();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactsList, setShowContactsList] = useState(false);
  const [charsRemaining, setCharsRemaining] = useState(160);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SmsFormValues>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
      recipient_number: '',
      message: '',
      recipient_id: '',
    },
  });

  // Surveiller le champ message pour mettre à jour le compteur de caractères
  const messageContent = watch('message');
  useEffect(() => {
    if (messageContent) {
      setCharsRemaining(160 - messageContent.length);
    } else {
      setCharsRemaining(160);
    }
  }, [messageContent]);

  // Charger les contacts depuis l'API
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    // Nettoyer le numéro en retirant les espaces
    const cleanNumber = contact.phone_number.replace(/\s+/g, '');
    setValue('recipient_number', cleanNumber);
    setValue('recipient_id', contact.id);
    setShowContactsList(false);
  };
  
  // Effacer les messages d'erreur/succès lorsque le composant se démonte
  useEffect(() => {
    return () => {
      clearError();
      clearSuccess();
    };
  }, [clearError, clearSuccess]);

  const onSubmit = async (data: SmsFormValues) => {
    try {
      // Créer l'objet SMS à envoyer
      const smsData: SMSSend = {
        recipient_number: data.recipient_number,
        message: data.message,
        recipient_id: data.recipient_id
      };
      
      // Envoyer le SMS via le contexte
      await sendSms(smsData);
      
      // Si envoi réussi et pas d'erreur, réinitialiser le formulaire
      if (!smsState.error) {
        reset();
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
    }
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
            <h2 className="text-2xl font-bold text-gray-900">Envoyer un SMS</h2>
            <p className="text-gray-600">Composez votre message et choisissez un destinataire</p>
          </div>
          <Link 
            to="/dashboard" 
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Retour au tableau de bord
          </Link>
        </div>

        <div className="card bg-white max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Messages de succès/erreur */}
            {smsState.success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{smsState.success}</p>
                  </div>
                </div>
              </div>
            )}

            {smsState.error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{smsState.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sélection du destinataire */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Destinataire
              </label>
              
              <div className="relative">
                <Input
                  type="text"
                  placeholder="+221 XX XXX XX XX"
                  error={errors.recipient_number?.message}
                  {...register('recipient_number')}
                  onFocus={() => setShowContactsList(true)}
                />
                
                <div className="mt-1 flex items-center">
                  <button
                    type="button"
                    className="text-xs text-orange-600 hover:text-orange-700"
                    onClick={() => setShowContactsList(!showContactsList)}
                  >
                    Sélectionner depuis mes contacts
                  </button>
                  
                  {selectedContact && (
                    <div className="ml-3 text-xs text-gray-600">
                      Contact sélectionné: <span className="font-medium">{selectedContact.name}</span>
                    </div>
                  )}
                </div>
                
                {showContactsList && contactState.contacts.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                    <ul className="max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                      {contactState.contacts.map((contact) => (
                        <li
                          key={contact.id}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                          onClick={() => handleContactSelect(contact)}
                        >
                          <div className="flex items-center">
                            <span className="font-medium block truncate">{contact.name}</span>
                          </div>
                          <span className="text-gray-500 block text-sm">
                            {formatPhoneNumber(contact.phone_number)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Message à envoyer */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <div className="relative">
                <textarea
                  className={`form-input min-h-[120px] resize-none ${errors.message ? 'border-red-500' : ''}`}
                  placeholder="Tapez votre message ici..."
                  maxLength={160}
                  {...register('message')}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  <span className={charsRemaining < 0 ? 'text-red-500 font-bold' : ''}>
                    {charsRemaining}
                  </span> caractères restants
                </div>
              </div>
              {errors.message && (
                <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
              )}
            </div>

            {/* Bouton d'envoi */}
            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={smsState.isLoading}
                disabled={smsState.isLoading}
              >
                Envoyer le SMS
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SendSmsPage;

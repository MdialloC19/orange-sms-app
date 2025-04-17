import { Link } from 'react-router-dom';
import SignupForm from '../components/SignupForm';

const SignupPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Bannière latérale avec logo Orange */}
      <div className="hidden md:flex md:w-1/2 bg-orange-600 flex-col items-center justify-center p-10 text-white">
        <div className="mb-8">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="120" rx="16" fill="white"/>
            <path d="M60 30C43.43 30 30 43.43 30 60C30 76.57 43.43 90 60 90C76.57 90 90 76.57 90 60C90 43.43 76.57 30 60 30ZM60 75C51.72 75 45 68.28 45 60C45 51.72 51.72 45 60 45C68.28 45 75 51.72 75 60C75 68.28 68.28 75 60 75Z" fill="#FF6600"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Orange SMS Pro</h1>
        <p className="text-center text-lg mb-6">
          Plateforme d'envoi de SMS professionnels pour le Sénégal
        </p>
        <div className="p-4 bg-white/10 rounded-lg">
          <p className="text-sm">
            Créez votre compte pour commencer à envoyer des SMS à vos contacts au Sénégal et suivre leur statut de livraison.
          </p>
        </div>
      </div>

      {/* Formulaire d'inscription */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Logo pour mobile */}
          <div className="md:hidden flex justify-center mb-6">
            <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="120" height="120" rx="16" fill="white"/>
              <path d="M60 30C43.43 30 30 43.43 30 60C30 76.57 43.43 90 60 90C76.57 90 90 76.57 90 60C90 43.43 76.57 30 60 30ZM60 75C51.72 75 45 68.28 45 60C45 51.72 51.72 45 60 45C68.28 45 75 51.72 75 60C75 68.28 68.28 75 60 75Z" fill="#FF6600"/>
            </svg>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Créer un compte</h2>
            <p className="mt-2 text-sm text-gray-600">
              Rejoignez Orange SMS Pro pour envoyer des messages à vos contacts
            </p>
          </div>

          <div className="mt-8">
            <SignupForm />
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import { UserCreate } from '../../../types/api';

// Schéma de validation du formulaire
const signupSchema = z.object({
  email: z.string().email({ message: 'Veuillez entrer un email valide' }),
  full_name: z.string().min(3, { message: 'Le nom complet doit contenir au moins 3 caractères' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { signup, state } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      full_name: '',
      password: '',
      confirm_password: '',
    },
  });

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [state.isAuthenticated, navigate]);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsSubmitting(true);
      // On n'envoie pas confirm_password au backend
      const { confirm_password, ...formData } = data;
      
      // Convertir les données du formulaire au format attendu par l'API
      const signupData: UserCreate = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      };
      
      await signup(signupData);
      
      if (!state.error) {
        setSuccessMessage('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
        reset();
        // Redirection vers la page de connexion après 2 secondes
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMessage && (
        <div className="rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="votre@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Nom complet"
          type="text"
          placeholder="Votre nom complet"
          error={errors.full_name?.message}
          {...register('full_name')}
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="Créez un mot de passe"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="Confirmez votre mot de passe"
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />
      </div>

      {state.error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        Créer un compte
      </Button>
    </form>
  );
};

export default SignupForm;

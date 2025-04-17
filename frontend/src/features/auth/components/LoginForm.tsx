import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest } from '../../../types/api';

// Schéma de validation du formulaire
const loginSchema = z.object({
  username: z.string().email({ message: 'Veuillez entrer un email valide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
});

// Cette interface doit correspondre au type LoginRequest de l'API
type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, state } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Rediriger vers le dashboard si déjà authentifié
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [state.isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      // Convertir les données du formulaire au format attendu par l'API
      const loginData: LoginRequest = {
        username: data.username, // L'API attend 'username' même si c'est un email
        password: data.password
      };
      
      await login(loginData);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="votre@email.com"
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="Votre mot de passe"
          error={errors.password?.message}
          {...register('password')}
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
        Se connecter
      </Button>
    </form>
  );
};

export default LoginForm;

# Orange SMS API Application

Application web pour l'envoi de SMS via l'API d'Orange Sénégal avec FastAPI et React.

## Structure du Projet

- **Backend:** API FastAPI avec MongoDB Atlas
- **Frontend:** Application React

## Prérequis

- Python 3.8+
- Node.js 14+
- Compte MongoDB Atlas
- Compte développeur Orange avec accès à l'API SMS Sénégal

## Configuration du Backend

1. **Créer un environnement virtuel Python**

```bash
cd orange-sms-app/backend
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

2. **Installer les dépendances**

```bash
pip install -r requirements.txt
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à partir du modèle `.env.example` :

```bash
cp .env.example .env
```

Puis modifiez les valeurs dans le fichier `.env`, particulièrement :

- `SECRET_KEY` : Une clé secrète pour la sécurité (cryptage des tokens)
- `MONGODB_URL` : L'URL de connexion à votre base de données MongoDB Atlas
- `ORANGE_CLIENT_ID` et `ORANGE_CLIENT_SECRET` : Vos identifiants pour l'API Orange

4. **Lancer le serveur de développement**

```bash
uvicorn app.main:app --reload
```

Le serveur sera disponible à l'adresse http://localhost:8000

## Configuration de MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) si vous n'en avez pas déjà un.
2. Créez un nouveau cluster (le niveau gratuit est suffisant pour commencer).
3. Créez un utilisateur de base de données avec des permissions de lecture/écriture.
4. Configurez l'accès réseau (ajoutez votre adresse IP).
5. Obtenez votre chaîne de connexion et remplacez `<username>`, `<password>` et `<cluster>` par vos informations.

## Configuration du Frontend (à implémenter)

1. **Installer les dépendances**

```bash
cd orange-sms-app/frontend
npm install
```

2. **Configurer les variables d'environnement**

Créez un fichier `.env` dans le répertoire frontend avec :

```
REACT_APP_API_URL=http://localhost:8000/api/v1
```

3. **Lancer le serveur de développement**

```bash
npm start
```

L'application sera disponible à l'adresse http://localhost:3000

## API Endpoints

Le backend expose les endpoints suivants :

- **Authentification** :
  - `POST /api/v1/auth/signup` : Créer un nouvel utilisateur
  - `POST /api/v1/auth/login/access-token` : Obtenir un token d'accès

- **SMS** :
  - `POST /api/v1/sms/send` : Envoyer un SMS
  - `GET /api/v1/sms/history` : Récupérer l'historique des SMS
  - `GET /api/v1/sms/{sms_id}` : Récupérer les détails d'un SMS
  - `GET /api/v1/sms/{sms_id}/status` : Vérifier le statut de livraison d'un SMS

- **Contacts** :
  - `GET /api/v1/contacts/` : Récupérer la liste des contacts
  - `POST /api/v1/contacts/` : Créer un nouveau contact
  - `GET /api/v1/contacts/{contact_id}` : Récupérer un contact
  - `PUT /api/v1/contacts/{contact_id}` : Mettre à jour un contact
  - `DELETE /api/v1/contacts/{contact_id}` : Supprimer un contact

## Documentation de l'API

Une fois le serveur démarré, vous pouvez accéder à la documentation Swagger à l'adresse :
http://localhost:8000/docs

## Déploiement

### Backend sur Render

1. Créez un compte sur [Render](https://render.com/) si vous n'en avez pas déjà un.
2. Connectez votre dépôt GitHub.
3. Créez un nouveau service Web avec les paramètres suivants :
   - Build Command : `pip install -r requirements.txt`
   - Start Command : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Configurez les variables d'environnement à partir du fichier `.env`

### Frontend (à implémenter)

Vous pourrez déployer le frontend sur Vercel ou Netlify.

## Intégration avec l'API Orange

Pour intégrer l'API Orange SMS Sénégal :

1. Créez un compte sur [Orange Developer](https://developer.orange.com/)
2. Abonnez-vous à l'API SMS Sénégal
3. Obtenez vos identifiants d'API (client_id et client_secret)
4. Configurez-les dans le fichier `.env` du backend
5. Achetez des crédits SMS via Orange Money pour pouvoir envoyer des SMS

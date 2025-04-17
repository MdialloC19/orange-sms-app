# Orange SMS API Application

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![Orange API](https://img.shields.io/badge/Orange-SMS%20API-FF6600.svg?style=flat&logo=orange&logoColor=white)](https://developer.orange.com/apis/sms-sn/overview)

Application web complète pour l'envoi et le suivi de SMS via l'API d'Orange Sénégal, construite avec FastAPI et React. Cette application permet d'envoyer des SMS, de gérer des contacts et de suivre l'historique des messages envoyés.

## 📋 Fonctionnalités

- 🔐 Authentification des utilisateurs (inscription, connexion avec JWT)
- 📞 Gestion des contacts (ajout, modification, suppression)
- 📱 Envoi de SMS via l'API Orange Sénégal
- 📊 Suivi de l'historique des SMS et des statuts de livraison
- 🌐 API RESTful documentée avec Swagger/OpenAPI

## 🏗️ Architecture du Projet

### Backend

- **Framework**: FastAPI avec asyncio pour des performances optimales
- **Base de données**: MongoDB Atlas avec Beanie ODM
- **Authentification**: JWT (JSON Web Tokens)
- **Documentation API**: Swagger UI et ReDoc intégrés

### Frontend (en développement)

- **Framework**: React avec TypeScript
- **UI**: Tailwind CSS avec composants réutilisables
- **État**: React Context API + useReducer
- **API**: Axios avec interceptors pour les tokens

### Structure des dossiers

```
project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/   # Endpoints API (auth, sms, contacts)
│   │   │   ├── routes/      # Configuration des routes
│   │   │   └── schemas.py   # Schémas Pydantic pour validation
│   │   ├── core/           # Configuration, sécurité, dépendances
│   │   ├── db/             # Modèles de données et connexion BD
│   │   ├── services/       # Services externes (Orange API)
│   │   └── main.py         # Point d'entrée de l'application
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/     # Composants React réutilisables
    │   ├── contexts/       # Contextes React (auth, etc.)
    │   ├── services/       # Services API
    │   ├── pages/          # Pages de l'application
    │   └── App.tsx         # Composant racine
    ├── package.json
    └── .env
```

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

## 🍊 Intégration avec l'API Orange

### Configuration du compte Orange Developer

1. Créez un compte sur [Orange Developer](https://developer.orange.com/)
2. Abonnez-vous à l'API SMS Sénégal
3. Créez une nouvelle application dans le portail développeur
4. Obtenez vos identifiants d'API (client_id et client_secret)
5. Configurez les URLs de redirection si nécessaire

### Configuration dans l'application

1. Ajoutez vos identifiants dans le fichier `.env` du backend :
   ```
   ORANGE_CLIENT_ID=votre_client_id
   ORANGE_CLIENT_SECRET=votre_client_secret
   ORANGE_AUTH_URL=https://api.orange.com/oauth/v3/token
   ORANGE_SMS_URL=https://api.orange.com/smsmessaging/v1/outbound
   ORANGE_SENDER_NAME=votre_nom_expediteur
   ```

### Achat de crédits SMS

1. Connectez-vous à votre compte Orange Money
2. Achetez des crédits SMS (suivez les instructions sur le portail Orange Developer)
3. Les crédits seront automatiquement liés à votre compte développeur

### Format des numéros de téléphone

L'application formate automatiquement les numéros de téléphone pour le Sénégal. Si un numéro ne commence pas par "+", le préfixe "+221" sera ajouté.

### Suivi des statuts

L'API permet de suivre les statuts de livraison des SMS avec les valeurs suivantes :
- `DeliveredToTerminal`: Message livré au téléphone
- `DeliveredToNetwork`: Message livré au réseau
- `MessageWaiting`: Message en attente
- `DeliveryImpossible`: Livraison impossible

## 🧪 Tests

### Tests Backend

```bash
cd backend
python -m pytest
```

Les tests couvrent :
- Tests unitaires pour les services
- Tests d'intégration pour les endpoints API
- Tests de la logique métier

### Tests Frontend

```bash
cd frontend
npm test
```

## 🚀 Roadmap

- [x] Configuration initiale du backend FastAPI
- [x] Intégration avec MongoDB Atlas
- [x] Implémentation de l'authentification JWT
- [x] Intégration de l'API Orange SMS
- [x] Endpoints API pour gestion des contacts
- [x] Endpoints API pour envoi et suivi des SMS
- [ ] Développement du frontend React
- [ ] Déploiement sur Render (backend) et Vercel (frontend)
- [ ] Tests automatisés et CI/CD avec GitHub Actions

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests.

## 📝 Licence

Ce projet est sous licence MIT.

---

Développé par [Moussa Diallo](https://github.com/moussadiallo)

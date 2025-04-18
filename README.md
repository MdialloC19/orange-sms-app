# 📱 Application Orange SMS Pro Sénégal

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![Orange API](https://img.shields.io/badge/Orange-SMS%20API-FF6600.svg?style=flat&logo=orange&logoColor=white)](https://developer.orange.com/apis/sms-sn/overview)

Bienvenue sur le projet Orange SMS Pro Sénégal ! Cette application complète te permet d'envoyer des SMS aux clients via l'API d'Orange Sénégal, de gérer tes contacts et de suivre l'historique des messages envoyés.

## 🚀 Guide de démarrage rapide (pour développeurs juniors)

### 1. Configurer le backend

```bash
# Cloner le repo (si ce n'est pas déjà fait)
git clone [URL_DU_REPO]
cd orange-sms-app

# Créer un environnement virtuel Python
cd backend
python -m venv venv

# Sur Mac/Linux
source venv/bin/activate
# Sur Windows
# venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Créer fichier .env à partir de l'exemple
cp .env.example .env

# Démarrer le serveur
uvicorn app.main:app --reload --port 8000
```

### 2. Configurer le frontend

```bash
# Dans un nouveau terminal
cd orange-sms-app/frontend

# Installer les dépendances
npm install

# Démarrer le frontend
npm run dev
```

## ✨ Ce que cette application fait

- 🔐 Connexion et création de compte
- 📞 Gestion des contacts téléphoniques (ajout, modification, suppression)
- 📱 Envoi de SMS via Orange Sénégal
- 📊 Suivi de l'historique des SMS envoyés

## 🔧 Configuration nécessaire

### Pour le fichier .env du backend (important!)

Modifie le fichier `.env` dans le dossier `backend` avec:

```
# Base de données MongoDB Atlas
MONGODBURL=mongodb+srv://username:password@cluster.mongodb.net/orange_sms_db
MONGODB_DB_NAME=orange_sms_db

# Clé secrète (pour sécuriser les tokens)
SECRET_KEY=une_clef_secrete_longue_et_aleatoire

# Identifiants Orange SMS Pro
ORANGE_CLIENT_ID=ton_client_id_orange
ORANGE_CLIENT_SECRET=ton_client_secret_orange
```

## 🧠 Comment tout fonctionne

### 1. Architecture globale

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │ <──> │   Backend   │ <──> │  MongoDB &  │
│   (React)   │      │  (FastAPI)  │      │  Orange API │
└─────────────┘      └─────────────┘      └─────────────┘
```

### 2. Structure du projet

```
project/
├── backend/               # API FastAPI
│   ├── app/
│   │   ├── api/          # Endpoints et routes
│   │   ├── core/         # Config et sécurité
│   │   ├── db/           # Connexion MongoDB
│   │   └── utils/        # Utilitaires
│   └── .env              # Variables d'environnement
└── frontend/             # Application React
    ├── src/
    │   ├── components/   # Composants UI
    │   ├── features/     # Fonctionnalités
    │   └── services/     # Services API
    └── .env              # Config frontend
```

## Configuration du Backend

1. **Créer un environnement virtuel Python**

```bash
cd orange-sms-app/backend
python3 -m venv venv
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

## 📱 Comment utiliser l'API (points d'entrée principaux)

### 🔑 Authentification

- **/api/v1/auth/login/access-token** - Se connecter
  ```
  POST avec { "username": "email@example.com", "password": "ton_mot_de_passe" }
  ```

### 👥 Gestion des contacts

- **/api/v1/contacts/** - Obtenir tous les contacts
  ```
  GET avec en-tête: "Authorization: Bearer ton_token"
  ```

- **/api/v1/contacts/** - Créer un contact
  ```
  POST avec { "name": "Nom Prénom", "phone_number": "+221701234567" }
  ```

### 💬 Envoi de SMS

- **/api/v1/sms/send** - Envoyer un SMS
  ```
  POST avec { "recipient_number": "+221701234567", "message": "Ton message" }
  ```

- **/api/v1/sms/history** - Voir l'historique des SMS
  ```
  GET avec en-tête: "Authorization: Bearer ton_token"
  ```

## 📋 Validation des numéros sénégalais

L'application gère automatiquement le format des numéros sénégalais:

✅ **Formats acceptés**:
- +221 70 123 45 67
- 00221 76 123 45 67
- 77 123 45 67
- 221781234567

⚠️ **Important**: Seuls les préfixes 70, 75, 76, 77, 78 sont valides pour le Sénégal

## 🔄 Dépannage et résolution des problèmes courants

### 1. Erreur de connexion à MongoDB

**Problème**: `Erreur de connexion à MongoDB: connection error`

**Solution**:
- Vérifie que l'URL MongoDB dans `.env` est correcte
- Assure-toi que ton adresse IP est autorisée dans MongoDB Atlas
- Vérifie que ton nom d'utilisateur et mot de passe MongoDB sont corrects

### 2. Erreur d'authentification

**Problème**: `401 Unauthorized` lors de la connexion

**Solution**:
- Assure-toi que l'utilisateur existe dans la base de données
- Vérifie que le nom de la base de données dans `.env` est correct
- Utilise la commande de débogage `python debug_mongodb.py` pour vérifier les utilisateurs

### 3. Problème d'envoi de SMS

**Problème**: Erreur lors de l'envoi d'un SMS

**Solution**:
- Vérifie que tes identifiants Orange API sont corrects
- Assure-toi que le format du numéro de téléphone est valide (commence par +221)
- Vérifie que tu as des crédits SMS disponibles

## 📚 Documentation

Accède à la documentation interactive de l'API:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🍊 Configuration de l'API Orange SMS Pro Sénégal 

### 1. Créer un compte développeur

1. Va sur [Orange Developer](https://developer.orange.com/)
2. Crée un compte (c'est gratuit)
3. Abonne-toi à l'API SMS Pro Sénégal

### 2. Obtenir tes identifiants

1. Crée une nouvelle application dans le portail développeur
2. Note ton `client_id` et ton `client_secret`
3. Ajoute-les dans ton fichier `.env`

### 3. Acheter des crédits SMS (quand tu seras prêt)

1. Utilise Orange Money pour acheter des crédits SMS
2. Les crédits seront automatiquement liés à ton compte

## 🌐 Structure des données

### 1. Collections MongoDB

- **users**: Stocke les utilisateurs et leurs informations d'authentification
- **contacts**: Stocke les contacts avec leurs numéros de téléphone
- **sms_messages**: Stocke l'historique des SMS envoyés

### 2. Format des données

**Contact**:
```json
{
  "name": "Nom du contact",
  "phone_number": "+221701234567",
  "notes": "Note optionnelle",
  "owner_id": "ID_de_l_utilisateur"
}
```

**SMS**:
```json
{
  "content": "Contenu du message",
  "recipient_number": "+221701234567",
  "status": "sent",
  "sender_id": "ID_de_l_utilisateur"
}
```

## 🎯 Pour aller plus loin

### Tutoriels recommandés

1. **FastAPI**: 
   - [Tutoriel officiel](https://fastapi.tiangolo.com/tutorial/)
   - [FastAPI avec MongoDB](https://www.mongodb.com/developer/languages/python/python-quickstart-fastapi/)

2. **MongoDB**:
   - [Tutoriel MongoDB pour débutants](https://www.mongodb.com/basics)
   - [MongoDB Atlas](https://docs.atlas.mongodb.com/getting-started/)

3. **React + TypeScript**:
   - [React pour débutants](https://reactjs.org/tutorial/tutorial.html)
   - [TypeScript avec React](https://react-typescript-cheatsheet.netlify.app/)

## 🧠 Conseils pour développeurs juniors

1. **Commencer petit**: Comprends d'abord comment fonctionne la connexion et la création de contacts

2. **Aide au débogage**:
   - Utilise les outils de développeur Chrome (F12) pour le frontend
   - Consulte les logs du serveur pour les erreurs backend
   - Les messages d'erreur sont souvent instructifs!

3. **Utilise la documentation**:
   - La documentation Swagger (http://localhost:8000/docs) est interactive
   - Tu peux tester tous les endpoints directement dans le navigateur

## 🤝 Besoin d'aide?

Si tu as des questions ou des problèmes avec ce projet, n'hésite pas à:
1. Consulter la documentation fournie
2. Chercher dans les issues GitHub existantes
3. Poser une nouvelle question dans les issues GitHub

---

**Projet développé par l'équipe Orange SMS Pro Sénégal**


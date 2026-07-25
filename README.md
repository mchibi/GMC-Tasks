# GMC Tasks — Application de gestion des tâches (pile MERN)

Application de gestion des tâches développée avec MongoDB, Express.js, React et Node.js.
Les utilisateurs pourront créer, modifier et supprimer des tâches, définir des échéances
et suivre leur progression.

## État d'avancement

- ✅ **Phase 1** : configuration du projet et du backend (structure, dépendances, connexion MongoDB, API CRUD des tâches)
- ✅ **Phase 2** : authentification et autorisation (inscription, connexion, JWT, tâches privées par utilisateur)
- ✅ **Phase 3** : frontend React — création et liste des tâches (titre, description, statut, date limite)
- ✅ **Phase 4** : mise à jour et suppression des tâches depuis l'interface (statut, édition en place, suppression confirmée)

## Structure du projet

```
GMC/
├── backend/
│   ├── config/
│   │   └── db.js                 # Connexion MongoDB (Mongoose)
│   ├── controllers/
│   │   ├── authController.js     # Inscription, connexion, profil
│   │   └── taskController.js     # Logique métier CRUD des tâches
│   ├── middleware/
│   │   ├── auth.js               # Vérification du jeton JWT (protect)
│   │   └── errorHandler.js       # Gestion centralisée des erreurs
│   ├── models/
│   │   ├── Task.js               # Schéma d'une tâche (liée à son propriétaire)
│   │   └── User.js               # Schéma utilisateur (mot de passe haché bcrypt)
│   ├── routes/
│   │   ├── authRoutes.js         # Endpoints /api/auth
│   │   └── taskRoutes.js         # Endpoints /api/tasks (protégés)
│   ├── .env                      # Variables d'environnement (non versionné)
│   ├── .env.example              # Modèle de configuration
│   ├── package.json
│   └── server.js                 # Point d'entrée Express
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # Instance axios (jeton auto, gestion des 401)
│   │   ├── context/AuthContext.jsx  # État d'authentification global
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Barre de navigation (utilisateur, déconnexion)
│   │   │   ├── ProtectedRoute.jsx # Redirection vers /login si non connecté
│   │   │   ├── TaskForm.jsx      # Formulaire de création d'une tâche
│   │   │   └── TaskItem.jsx      # Carte d'une tâche : affichage, édition, suppression
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Page de connexion
│   │   │   ├── Register.jsx      # Page d'inscription
│   │   │   └── Tasks.jsx         # Page principale : formulaire + liste
│   │   ├── App.jsx               # Définition des routes
│   │   ├── main.jsx              # Point d'entrée React
│   │   └── index.css             # Styles de l'application
│   ├── index.html
│   ├── vite.config.js            # Proxy /api → backend (port 5001)
│   └── package.json
└── README.md
```

## Prérequis

- Node.js ≥ 18
- MongoDB (local, Docker ou Atlas)

### MongoDB avec Docker (recommandé en développement)

```bash
docker run -d --name gmc-mongo -p 27017:27017 -v gmc-mongo-data:/data/db mongo:7
```

Le conteneur `gmc-mongo` conserve ses données dans le volume `gmc-mongo-data`.
Pour l'arrêter / le relancer : `docker stop gmc-mongo` / `docker start gmc-mongo`.

## Installation et démarrage

### 1. Backend (API)

```bash
cd backend
npm install
cp .env.example .env   # puis adapter les valeurs si besoin
npm run dev            # développement (nodemon, rechargement auto)
# ou
npm start              # production
```

Le serveur démarre sur **http://localhost:5001**.

> ⚠️ Sur macOS, le port 5000 est occupé par le récepteur AirPlay — le projet utilise donc le port 5001.

### 2. Frontend (interface React)

```bash
cd frontend
npm install
npm run dev
```

L'application s'ouvre sur **http://localhost:5173**. En développement, le proxy
Vite redirige automatiquement les appels `/api` vers le backend — aucun réglage
CORS supplémentaire n'est nécessaire.

## Fonctionnalités de l'interface

- **Inscription et connexion** — session conservée entre les visites, déconnexion automatique si le jeton expire
- **Création d'une tâche** — titre, description et date limite
- **Liste personnelle** — badge de statut coloré, échéance formatée, mention « en retard » si la date est dépassée
- **Changement de statut** — sélecteur direct sur la carte (À faire / En cours / Terminée)
- **Modification** — édition en place du titre, de la description et de l'échéance, avec Enregistrer / Annuler
- **Suppression** — bouton avec demande de confirmation

## API — Endpoints disponibles

### Authentification (publiques)

| Méthode | Endpoint             | Description                                  |
| ------- | -------------------- | -------------------------------------------- |
| POST    | `/api/auth/register` | Inscription (renvoie un jeton JWT)           |
| POST    | `/api/auth/login`    | Connexion (renvoie un jeton JWT)             |
| GET     | `/api/auth/me`       | Profil de l'utilisateur connecté 🔒          |

### Tâches (🔒 jeton requis : `Authorization: Bearer <token>`)

| Méthode | Endpoint         | Description                              |
| ------- | ---------------- | ---------------------------------------- |
| GET     | `/`              | Vérification de l'état de l'API (publique) |
| GET     | `/api/tasks`     | Liste des tâches de l'utilisateur        |
| POST    | `/api/tasks`     | Création d'une tâche                     |
| GET     | `/api/tasks/:id` | Détail d'une de ses tâches               |
| PUT     | `/api/tasks/:id` | Modification d'une de ses tâches         |
| DELETE  | `/api/tasks/:id` | Suppression d'une de ses tâches          |

Chaque utilisateur n'accède qu'à **ses propres tâches** : toute tentative sur la
tâche d'un autre compte renvoie un 404, et toute requête sans jeton valide un 401.

### Sécurité mise en place

- Mots de passe hachés avec **bcrypt** (jamais stockés ni renvoyés en clair)
- Authentification **stateless par JWT** signé (`JWT_SECRET`), expiration configurable
- Message identique pour email inconnu / mot de passe erroné (pas d'énumération de comptes)
- Secrets uniquement dans `.env` (non versionné)

### Modèle d'une tâche

```json
{
  "title": "Créer le frontend React",      // obligatoire, max 100 caractères
  "description": "Composants et pages",    // optionnel, max 1000 caractères
  "status": "todo",                        // "todo" | "in-progress" | "done"
  "dueDate": "2026-08-15"                  // échéance, optionnelle
}
```

Les champs `createdAt` et `updatedAt` sont gérés automatiquement.

### Exemples (curl)

```bash
# S'inscrire (récupérer le jeton dans la réponse)
curl -X POST http://localhost:5001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com","password":"motdepasse123"}'

# Se connecter
curl -X POST http://localhost:5001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"motdepasse123"}'

# Créer une tâche (remplacer <token> par le jeton reçu)
curl -X POST http://localhost:5001/api/tasks \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Ma première tâche","dueDate":"2026-08-15"}'

# Lister ses tâches
curl http://localhost:5001/api/tasks -H 'Authorization: Bearer <token>'

# Changer le statut
curl -X PUT http://localhost:5001/api/tasks/<id> \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"status":"in-progress"}'

# Supprimer
curl -X DELETE http://localhost:5001/api/tasks/<id> \
  -H 'Authorization: Bearer <token>'
```

Toutes les réponses suivent le format `{ "success": true|false, "data"|"message": ... }`.
Les erreurs de validation renvoient un code 400, les ressources introuvables un 404.

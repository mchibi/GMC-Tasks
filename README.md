# GMC Tasks — Application de gestion des tâches (pile MERN)

Application de gestion des tâches développée avec MongoDB, Express.js, React et Node.js.
Les utilisateurs pourront créer, modifier et supprimer des tâches, définir des échéances
et suivre leur progression.

## État d'avancement

- ✅ **Phase 1** : configuration du projet et du backend (structure, dépendances, connexion MongoDB, API CRUD des tâches)
- ⬜ Phase 2+ : frontend React, authentification (inscription/connexion), listes personnalisées par utilisateur

## Structure du projet

```
GMC/
├── backend/
│   ├── config/
│   │   └── db.js                 # Connexion MongoDB (Mongoose)
│   ├── controllers/
│   │   └── taskController.js     # Logique métier CRUD des tâches
│   ├── middleware/
│   │   └── errorHandler.js       # Gestion centralisée des erreurs
│   ├── models/
│   │   └── Task.js               # Schéma Mongoose d'une tâche
│   ├── routes/
│   │   └── taskRoutes.js         # Définition des endpoints /api/tasks
│   ├── .env                      # Variables d'environnement (non versionné)
│   ├── .env.example              # Modèle de configuration
│   ├── package.json
│   └── server.js                 # Point d'entrée Express
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

## API — Endpoints disponibles

| Méthode | Endpoint         | Description                       |
| ------- | ---------------- | --------------------------------- |
| GET     | `/`              | Vérification de l'état de l'API   |
| GET     | `/api/tasks`     | Liste de toutes les tâches        |
| POST    | `/api/tasks`     | Création d'une tâche              |
| GET     | `/api/tasks/:id` | Détail d'une tâche                |
| PUT     | `/api/tasks/:id` | Modification d'une tâche          |
| DELETE  | `/api/tasks/:id` | Suppression d'une tâche           |

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
# Créer une tâche
curl -X POST http://localhost:5001/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Ma première tâche","dueDate":"2026-08-15"}'

# Lister les tâches
curl http://localhost:5001/api/tasks

# Changer le statut
curl -X PUT http://localhost:5001/api/tasks/<id> \
  -H 'Content-Type: application/json' \
  -d '{"status":"in-progress"}'

# Supprimer
curl -X DELETE http://localhost:5001/api/tasks/<id>
```

Toutes les réponses suivent le format `{ "success": true|false, "data"|"message": ... }`.
Les erreurs de validation renvoient un code 400, les ressources introuvables un 404.

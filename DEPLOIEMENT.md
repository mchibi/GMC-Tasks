# Déploiement — GMC Tasks

Application déployée en production : **https://tasks.synaptixonline.com**

## Architecture retenue

```
Internet
   │  HTTPS
   ▼
Cloudflare  ──── tunnel chiffré (aucun port ouvert sur la box) ────┐
                                                                   ▼
                                          Proxmox — conteneur LXC 224 (GMC-Tasks)
                                          192.168.1.224
                                             │
                                          nginx :80   (reverse proxy)
                                             │
                                          Node.js :5001  (Express + build React)
                                             │
                                          MongoDB :27017 (local, non exposé)
```

Le backend Express sert **à la fois l'API et les fichiers React compilés** : une
seule origine, donc aucune configuration CORS nécessaire côté navigateur et une
seule URL à retenir.

## Infrastructure

| Élément | Valeur |
| --- | --- |
| Conteneur | LXC 224, nom `GMC-Tasks`, Debian 12 |
| Ressources | 2 vCPU, 2 Go RAM, 1 Go swap, 12 Go disque (SSD-02) |
| Réseau | 192.168.1.224/24, passerelle 192.168.1.1, bridge vmbr0 |
| Démarrage auto | activé (`onboot: 1`) |
| Node.js | v22 |
| MongoDB | v7.0 (écoute uniquement en local) |
| Chemin | `/opt/gmc-tasks` |

## Sécurité

- **Aucun port ouvert** sur la box : le trafic entre par le tunnel Cloudflare sortant ;
- **HTTPS** et certificat gérés par Cloudflare ;
- **MongoDB n'écoute que sur 127.0.0.1** — la base n'est joignable ni depuis le
  réseau local ni depuis Internet ;
- **Helmet** : en-têtes de sécurité HTTP (HSTS, anti-sniffing, anti-clickjacking) ;
- **Limitation de débit** : 10 tentatives de connexion échouées par quart d'heure
  et par IP (les connexions réussies ne sont pas comptées), 300 requêtes API ;
- **`trust proxy`** activé pour que la limitation identifie la vraie IP cliente
  derrière nginx et Cloudflare ;
- Le fichier `.env` de production (dont le secret JWT, propre au serveur) est en
  permission `600` et n'est pas versionné.

## Services (systemd)

| Service | Rôle |
| --- | --- |
| `gmc-tasks` | Application Node.js, redémarrage automatique en cas d'arrêt |
| `mongod` | Base de données |
| `nginx` | Reverse proxy vers le port 5001 |

```bash
# État et journaux
systemctl status gmc-tasks
journalctl -u gmc-tasks -f
```

## Mettre à jour l'application

Depuis l'hôte Proxmox :

```bash
pct exec 224 -- bash -c 'cd /opt/gmc-tasks && git pull && npm --prefix backend ci --omit=dev && npm --prefix frontend ci && npm --prefix frontend run build && systemctl restart gmc-tasks'
```

## Variables d'environnement de production

Fichier `/opt/gmc-tasks/backend/.env` :

```
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/gmc_tasks
JWT_SECRET=<généré avec openssl rand -hex 32, propre au serveur>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://tasks.synaptixonline.com
```

## Routage Cloudflare

Règle ajoutée dans `/etc/cloudflared/config.yml` sur l'hôte Proxmox (une
sauvegarde datée du fichier a été créée avant modification) :

```yaml
  - hostname: tasks.synaptixonline.com
    service: http://192.168.1.224:80
```

L'enregistrement DNS (CNAME vers le tunnel) a été créé avec :

```bash
cloudflared tunnel route dns synaptix-tunnel tasks.synaptixonline.com
```

## Recette de production

27 tests automatisés exécutés contre l'URL publique — authentification,
autorisation, CRUD complet, filtres, recherche, tri, isolation entre comptes et
routage de l'application React : **27 réussis, 0 échec**.

Le redémarrage complet du conteneur a également été testé : les trois services
repartent automatiquement et l'application répond sans intervention.

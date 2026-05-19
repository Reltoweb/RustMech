# RustMech - Clone de Xblaster

Bienvenue dans le dépôt source de RustMech ! Ce projet est un clone de l'ancien jeu sur navigateur Xblaster, construit avec une architecture moderne.

## Stack Technique

*   **Backend / API / Auth :** Laravel 11
*   **Frontend UI (Hangar, Shop) :** Vue.js 3 + Inertia.js + TailwindCSS
*   **Game Engine (Arène) :** Phaser 3 (intégré dans un composant Vue)
*   **Multijoueur / Temps Réel :** Laravel Reverb (WebSockets) + Laravel Echo
*   **Base de données :** SQLite (par défaut pour le dev) / MySQL / PostgreSQL

---

## 💻 1. Guide d'installation en Local (Développement)

Pour tester le jeu sur votre machine, vous devez avoir installé :
- **PHP** (>= 8.2)
- **Composer**
- **Node.js** (>= 18) et **NPM** (ou Yarn/Bun)
- (Optionnel) Une base de données comme MySQL, mais par défaut le projet utilise SQLite qui ne requiert aucune installation.

### Étape 1 : Cloner et préparer le projet

```bash
git clone https://github.com/Reltoweb/RustMech.git
cd RustMech

# Installer les dépendances PHP
composer install

# Installer les dépendances JavaScript
npm install

# Créer le fichier d'environnement et générer la clé d'application
cp .env.example .env
php artisan key:generate
```

### Étape 2 : Configuration de la Base de données
Par défaut, le fichier `.env` utilise SQLite.
Si vous souhaitez utiliser SQLite, créez le fichier de base de données :
```bash
touch database/database.sqlite
```

Ensuite, exécutez les migrations et les seeders pour pré-remplir la base avec des Mechs et des Armes :
```bash
php artisan migrate --seed
```

*(Note : le seeder crée un utilisateur de test : `test@xblaster.com` avec le mot de passe `password`)*

### Étape 3 : Démarrer les services

Pour faire fonctionner le jeu complet en local, vous avez besoin de faire tourner **3 processus en parallèle** (ouvrez 3 terminaux distincts) :

**Terminal 1 : Le serveur Web Laravel**
```bash
php artisan serve
```

**Terminal 2 : Le serveur WebSocket (Laravel Reverb)**
```bash
php artisan reverb:start
```

**Terminal 3 : Le serveur de développement Frontend (Vite)**
```bash
npm run dev &
```

### Étape 4 : Jouer !
Ouvrez votre navigateur et allez sur `http://localhost:8000`.
Connectez-vous avec :
- Email : `test@xblaster.com`
- Mot de passe : `password`

Vous pouvez ouvrir plusieurs fenêtres/navigateurs (en navigation privée par exemple), créer d'autres comptes, et les faire se rejoindre dans l'arène pour tester le multijoueur !

---

## 🚀 2. Guide de Déploiement en Production

Pour mettre le jeu en ligne, vous aurez besoin d'un serveur (VPS, Serveur Dédié, ou un service comme Laravel Forge / Vapor). L'hébergement mutualisé classique (comme o2switch basique) est souvent insuffisant car il ne permet pas de faire tourner le serveur WebSocket (Reverb) en continu.

### Prérequis Serveur
- PHP >= 8.2
- Nginx ou Apache
- MySQL ou PostgreSQL
- Node.js (pour la compilation des assets)
- Supervisor (pour maintenir Reverb et la Queue en vie)
- Redis (recommandé pour la gestion des événements/queues en production)

### Étapes de déploiement (Générales)

1.  **Récupérer le code et installer les dépendances :**
    ```bash
    git clone https://github.com/Reltoweb/RustMech.git /var/www/rustmech
    cd /var/www/rustmech
    composer install --optimize-autoloader --no-dev
    npm install
    npm run build # Compile les assets pour la production
    ```

2.  **Configuration du `.env` :**
    - Mettez `APP_ENV=production` et `APP_DEBUG=false`.
    - Changez `APP_URL` pour votre vrai nom de domaine (ex: `https://mon-jeu.com`).
    - Configurez vos identifiants de base de données MySQL/PostgreSQL.
    - Assurez-vous que les variables `REVERB_HOST` et `VITE_REVERB_HOST` pointent vers votre nom de domaine (ex: `mon-jeu.com`).
    - Si vous avez un certificat SSL (HTTPS), passez `REVERB_SCHEME` et `VITE_REVERB_SCHEME` à `https`.

3.  **Migrations et Cache :**
    ```bash
    php artisan migrate --force
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

4.  **Configuration du Serveur Web (Nginx) :**
    Faites pointer la racine de votre domaine vers le dossier `/var/www/rustmech/public`.
    Vous devrez aussi configurer un *Reverse Proxy* dans Nginx pour rediriger le trafic WebSocket (port 8080 par défaut) vers le serveur Reverb.
    
    *Exemple de bloc Nginx pour Reverb :*
    ```nginx
    location /app {
        proxy_pass             http://127.0.0.1:8080;
        proxy_read_timeout     60;
        proxy_connect_timeout  60;
        proxy_redirect         off;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    ```

5.  **Maintenir Reverb en vie avec Supervisor :**
    Il ne faut pas lancer `php artisan reverb:start` à la main, car il s'arrêtera si vous fermez le terminal. Utilisez `Supervisor` (ou `systemd`) pour le faire tourner en tâche de fond.

    *Exemple de configuration Supervisor (`/etc/supervisor/conf.d/reverb.conf`) :*
    ```ini
    [program:reverb]
    command=php /var/www/rustmech/artisan reverb:start
    autostart=true
    autorestart=true
    user=www-data
    redirect_stderr=true
    stdout_logfile=/var/www/rustmech/storage/logs/reverb.log
    ```
    Puis : `supervisorctl update` et `supervisorctl start reverb`.

## ⚙️ Architecture du Code (Pour aller plus loin)

- **Vues Vue.js :** `resources/js/Pages/` (Contient Login, Register, Garage, Shop, et le wrapper Arena).
- **Moteur Phaser 3 :** `resources/js/game/`
  - `config.js` : Paramètres de base du jeu.
  - `scenes/ArenaScene.js` : Le coeur du jeu (déplacements, tirs, communication réseau).
  - `entities/` : Les classes des objets du jeu (PlayerMech, OtherMech, Laser, Crate, Portal).
- **Backend Laravel :** 
  - `app/Http/Controllers/` : Logique de l'API et retour des vues Inertia.
  - `routes/channels.php` : Définition des canaux WebSocket (pour l'arène).

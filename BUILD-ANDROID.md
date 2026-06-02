# Build Android — SpherePlan

Votre application web a été réorganisée pour être empaquetée dans une WebView Android via **Capacitor**. Tout le code HTML / CSS / JS existe déjà et n'a pas été modifié (sauf l'injection du bridge).

## Prérequis

| Outil | Version min. |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Android Studio | avec **Android SDK 34** + **Build-Tools 34.x** |
| Java JDK | 17 (recommandé) |

## Installation rapide (première fois)

```bash
# 1. Installer les dépendances Capacitor
npm install

# 2. Initialiser Capacitor (si jamais vous avez supprimé android/ manuellement)
npx cap init

# 3. Ajouter la plateforme Android
npx cap add android

# 4. Synchroniser le code web dans le projet Android
npx cap sync
```

## Développement local

### Option A — Serveur manuel + WebView (recommandé pour le debug)

```bash
# Terminal 1 : serveur de développement
npm run dev:android
# → http://localhost:3000

# Terminal 2 : ouvrir Android Studio
npx cap open android
```

Dans Android Studio, lancez l'app sur un émulateur ou un appareil branché.
Le `webDir` pointe vers le dossier racine (`.`) — aucune étape de build n'est nécessaire.

### Option B — Serveur interne Capacitor

```bash
npx cap run android
```

Capacitor démarre automatiquement un serveur HTTPS local et lance l'app sur l'appareil connecté.

## Workflow classique

```bash
# Après chaque modification du code web :
npx cap sync          # copie les fichiers dans android/

# Puis ouvrir Android Studio pour builder / lancer
npx cap open android
```

## Build release (APK / AAB)

Dans Android Studio :

1. **Build → Generate Signed Bundle / APK**
2. Choisissez **Android App Bundle (AAB)** (pour Google Play) ou **APK** (distrib manuel)
3. Suivez l'assistant de signature

Ou en ligne de commande :

```bash
cd android
./gradlew bundleRelease    # AAB dans app/build/outputs/bundle/release/
# ou
./gradlew assembleRelease  # APK dans app/build/outputs/apk/release/
```

## Mises à jour du schéma Android (SDK, Gradle…)

```bash
npx cap update android
```

## Fichiers ajoutés pour le support Android

| Fichier | Rôle |
|---|---|
| `capacitor.config.json` | Config Capacitor (appId, plugins, serveur) |
| `capacitor.config.ts` | Version TypeScript de la config (pour les IDE) |
| `capacitor-bridge.js` | Polyfill `window.electronAPI` dans WebView Android |
| `android-server.js` | Serveur HTTP local pour le développement |

## Fichiers inchangés

Tout votre code existuel reste intact :
- `main.js` / `preload.js` → toujours fonctionnels pour Electron
- `index.html`, `css/`, `js/`, `assets/` → non modifiés (sauf injection du bridge)

## Différences Electron vs Capacitor

| Fonctionnalité | Electron | Capacitor Android |
|---|---|---|
| Contrôles fenêtre (min/max/close) | IPC natif | No-op (le shell Android gère) |
| Menu application | `Menu.setApplicationMenu()` | N/A (mobile) |
| Stockage | `localStorage` + filesystem | `localStorage` (WebView) |
| API IA | Identique (fetch HTTPS) | Identique (fetch HTTPS) |
| Cloud sync | Identique | Identique |

Le bridge `capacitor-bridge.js` intercepte les appels à `window.electronAPI` et expose en plus :
- `window.electronAPI.capacitor.hideSplash()`
- `window.electronAPI.capacitor.setStatusBarStyle('dark')`
- `window.electronAPI.capacitor.getPlatform()`

## Résoudre les problèmes courants

### "Unable to load WebView" / écran blanc
- Vérifiez que le serveur HTTP tourne (`npm run dev:android`)
- Ouvrez `http://localhost:3000` dans un navigateur pour confirmer que l'app charge

### Erreur de compilation Gradle
- Assurez-vous que JAVA_HOME pointe vers JDK 17
- Exécutez `./gradlew clean` dans le dossier `android/`

### Permissions supplémentaires (camera, storage…)
Ajoutez les permissions dans `android/app/src/main/AndroidManifest.xml`, puis :
```bash
npx cap sync
```

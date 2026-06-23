# AgentBet — Guide de déploiement final
## De GitHub à l'APK installable

---

## CE QUE CONTIENT CE PROJET

Application complète **AgentBet** connectée à de vrais services :
- **Firebase Firestore** — base de données réelle (utilisateurs, transactions, messages)
- **Render** — serveur d'envoi de SMS OTP via Africa's Talking
- **Cloudinary** — stockage des preuves de paiement (images)

Plus de simulation : tout ce que fait l'app est réel et persistant.

---

## ÉTAPE 1 — Préparer Firestore (une seule fois)

Avant de lancer l'app, il faut créer manuellement ton compte admin et le document de paramètres dans Firestore, car la base est actuellement vide.

### 1.1 — Créer le document de paramètres globaux

1. Va sur **console.firebase.google.com** → ton projet → Firestore Database
2. Appuie sur **"Start collection"** (Démarrer une collection)
3. Collection ID : `settings`
4. Document ID : `global`
5. Ajoute un champ :
   - Field : `autoValidation`
   - Type : `boolean`
   - Value : `false`
6. Sauvegarde

### 1.2 — Créer ton compte administrateur

1. Toujours dans Firestore, crée une nouvelle collection : `users`
2. Document ID : laisse Firestore générer un ID automatique (clique sur le bouton dédié)
3. Ajoute ces champs un par un :

| Field | Type | Value |
|---|---|---|
| name | string | Agent AgentBet |
| email | string | mozart@agent.com |
| phone | string | +228 99 00 00 00 |
| password | string | (choisis un vrai mot de passe sécurisé) |
| pin | string | (choisis un code à 4 chiffres) |
| role | string | admin |
| status | string | active |
| balance | number | 0 |

4. Sauvegarde

**Important** : utilise exactement l'email `mozart@agent.com` (ou un des emails déjà listés dans `ADMIN_EMAILS` du code) pour que l'app détecte automatiquement le rôle admin.

### 1.3 — Mettre à jour les règles de sécurité Firestore

1. Va dans l'onglet **"Rules"** de Firestore
2. Remplace tout le contenu par celui du fichier `firestore.rules` fourni précédemment
3. Appuie sur **"Publish"**

---

## ÉTAPE 2 — Déposer le code sur GitHub

1. Va sur **github.com** → connecte-toi
2. Crée un nouveau dépôt : `agentbet-app`
3. Pour chaque fichier du projet (38 fichiers), répète :
   - "Add file" → "Create new file" (ou "Upload files" pour aller plus vite si l'interface mobile le permet pour plusieurs fichiers à la fois)
   - Respecte exactement les noms et chemins de dossiers (ex: `src/screens/auth/LoginScreen.js`)
   - Colle le contenu
   - Commit

**Astuce pour gagner du temps** : GitHub permet de faire un **drag & drop de plusieurs fichiers à la fois** dans "Upload files" si tu peux sélectionner plusieurs fichiers depuis le gestionnaire de fichiers de ton téléphone après avoir extrait le ZIP.

---

## ÉTAPE 3 — Connecter Expo à GitHub

1. Va sur **expo.dev** → connecte-toi
2. Appuie sur **"Create a project"**
3. Choisis d'importer depuis GitHub → sélectionne ton dépôt `agentbet-app`
4. Expo détecte automatiquement que c'est un projet Expo (grâce à `app.json`)

---

## ÉTAPE 4 — Initialiser EAS

Sur la page de ton projet sur expo.dev, cherche une section **"EAS Build"** ou un bouton **"Configure EAS Build"**.

Expo va te demander de confirmer/générer un `projectId` — il remplacera automatiquement la ligne `"projectId": "REMPLACER_APRES_EAS_INIT"` dans ton `app.json`. Si l'interface te le permet, accepte la mise à jour automatique du fichier directement sur GitHub.

Si ce n'est pas automatique, modifie manuellement `app.json` sur GitHub avec l'ID donné par Expo.

---

## ÉTAPE 5 — Lancer le build

1. Toujours sur la page du projet expo.dev, cherche le bouton **"Build"**
2. Choisis :
   - **Platform** : Android
   - **Profile** : `preview` (celui qui génère un `.apk` directement installable, configuré dans `eas.json`)
3. Lance le build
4. Patiente 10 à 20 minutes — tu peux fermer l'onglet, le build continue côté serveur
5. Reviens sur la page, le statut passera à **"Finished"**
6. Un lien de téléchargement `.apk` apparaît

---

## ÉTAPE 6 — Installer et tester

1. Télécharge le `.apk` directement depuis ton téléphone
2. Android va peut-être demander d'autoriser l'installation depuis une "source inconnue" → autorise
3. Installe l'app
4. Teste la connexion avec ton compte admin créé à l'étape 1.2
5. Teste l'inscription d'un nouveau client → vérifie que le SMS arrive bien (mode Sandbox Africa's Talking : uniquement aux numéros ajoutés dans leur simulateur)

---

## CHECKLIST FINALE

```
□ Document settings/global créé dans Firestore
□ Compte admin créé dans Firestore (collection users)
□ Règles de sécurité Firestore publiées
□ Code déposé sur GitHub (38 fichiers)
□ Projet Expo connecté à GitHub
□ EAS Build initialisé (projectId dans app.json)
□ Build Android lancé et terminé
□ APK téléchargé et installé
□ Connexion admin testée
□ Inscription client + SMS testés
```

---

## EN CAS DE PROBLÈME AU BUILD

Si EAS Build échoue, la cause la plus fréquente est une dépendance manquante ou mal versionnée dans `package.json`. Envoie-moi le message d'erreur exact affiché dans les logs du build — je corrige immédiatement.

---

*AgentBet v1.0.0 — Backend réel — Juin 2025*

# Compta GTA RP

Plateforme de comptabilité pour entreprises GTA RP, déployée sur Vercel avec Neon (Postgres) et authentification GitHub via NextAuth.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + Neon (Postgres)
- NextAuth v5 (Auth.js) — provider GitHub uniquement

## Schéma de base

- `User` (NextAuth) — créé automatiquement au premier login GitHub, statut `PENDING` par défaut
- `Company` — les entreprises (Pond Café, Pier 76, …)
- `Membership` — rattache un user à une company avec un rôle (`OWNER`, `MANAGER`, `EMPLOYEE`)

Pour ajouter une nouvelle entreprise, soit ajouter une ligne dans `prisma/seed.ts` et relancer le seed, soit insérer directement via Neon / Prisma Studio.

## Setup local

```bash
# 1. Installer les dépendances
npm install

# 2. Copier les variables d'environnement et les remplir
cp .env.example .env.local
# Renseigne :
#   DATABASE_URL / DATABASE_URL_UNPOOLED → Neon (déjà fournis par l'intégration Vercel)
#   AUTH_SECRET                          → openssl rand -base64 32
#   AUTH_GITHUB_ID / AUTH_GITHUB_SECRET   → GitHub Developer Settings → OAuth Apps

# 3. Pousser le schéma sur Neon + générer le client
npm run db:push

# 4. Seed des 2 entreprises
npm run db:seed

# 5. Lancer en dev
npm run dev
```

Ouvre <http://localhost:3000>.

## Configurer l'OAuth GitHub

1. <https://github.com/settings/developers> → **New OAuth App**
2. Homepage URL : `http://localhost:3000` (puis ton URL Vercel en prod)
3. Authorization callback URL : `http://localhost:3000/api/auth/callback/github`
4. Récupère le Client ID et génère un Client Secret → mets-les dans `.env.local`

En production sur Vercel, crée une **deuxième** OAuth App (ou ajoute un second callback) avec :
- Homepage : `https://ton-app.vercel.app`
- Callback : `https://ton-app.vercel.app/api/auth/callback/github`

## Déploiement Vercel

1. Push le repo sur GitHub.
2. Sur Vercel, importer le repo. Framework détecté : **Next.js**.
3. Variables d'environnement Vercel :
   - `DATABASE_URL` et `DATABASE_URL_UNPOOLED` → injectées automatiquement par l'intégration Neon-Vercel
   - À ajouter à la main : `AUTH_SECRET`, `AUTH_URL` (= ton URL Vercel), `AUTH_TRUST_HOST=true`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
4. Déployer. Le build exécute `prisma generate` (script `postinstall` + `build`).
5. Première fois en prod : pousser le schéma avec `npx prisma db push` depuis ton poste, puis `npx prisma db seed` (avec les vars de prod).

## Promouvoir un patron

Au premier login GitHub d'un patron :

```bash
# via Prisma Studio (UI graphique)
npm run db:studio
```

Puis sur l'utilisateur :
- mettre `isSuperAdmin = true` si c'est l'admin global de la plateforme
- créer un `Membership` reliant le user à sa Company avec `role = OWNER`

Patrons à attribuer manuellement après leur 1ʳᵉ connexion :
- **Pond Café** : Alyarya K Rosell, Lucinda Rosell
- **Pier 76** : Pers1, Pers2

## Prochaines étapes (pas encore implémentées)

- Tableau de bord par entreprise (`/dashboard/[slug]`)
- Module compta (recettes / dépenses / fiches de paie)
- Interface patron pour valider et attribuer les nouveaux comptes
- Page admin pour créer une nouvelle entreprise depuis l'app

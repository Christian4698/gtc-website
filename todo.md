# GTC Website - Conversion Full-Stack TODO

## Phase 1 - Setup BDD et helpers ✅
- [x] Créer schema Drizzle (users, files, leads)
- [x] Appliquer migration SQL
- [x] Ajouter helpers BDD dans server/db.ts (files + leads)
- [x] Vérifier server/storage.ts (storagePut, storageGet, storageGetSignedUrl)

## Phase 2 - Routes tRPC & Upload Express ✅
- [x] Créer routes tRPC dans server/routers.ts
  - [x] files.list (public, avec filtrage catégorie)
  - [x] files.adminList (admin only)
  - [x] files.download (incrémenter compteur + URL signée)
  - [x] files.delete (admin only)
  - [x] leads.submit (public, avec notification owner)
  - [x] leads.list (admin only, avec filtrage statut)
  - [x] leads.updateStatus (admin only)
- [x] Créer endpoint Express POST /api/upload avec multer
- [x] Enregistrer registerUploadRoute dans server/_core/index.ts
- [x] Installer multer et @types/multer
- [x] Tests vitest pour routers (12 tests)

## Phase 3 - Page Admin ✅
- [x] Créer client/src/pages/AdminFiles.tsx
  - [x] Section upload avec drag-drop (ou input file)
  - [x] Liste des fichiers uploadés (titre, catégorie, taille, downloads)
  - [x] Bouton supprimer fichier
  - [x] Liste des leads avec filtrage par statut
  - [x] Dropdown pour changer statut lead
  - [x] Protection admin (redirection si pas admin)
- [x] Ajouter route /admin/files dans App.tsx
- [x] Utiliser DashboardLayout pour l'interface admin

## Phase 4 - Intégration Products ✅
- [x] Mettre à jour client/src/pages/Products.tsx
  - [x] Charger fichiers dynamiquement via trpc.files.list.useQuery()
  - [x] Mapper fichiers BDD vers format produit
  - [x] Bouton "Télécharger" qui appelle trpc.files.download.useMutation()
  - [x] Fallback vers produits statiques si aucun fichier
  - [x] Tracking GA4 (file_downloaded)
  - [x] Gestion état loading/downloading

## Phase 5 - Restauration Pages Publiques ✅
- [x] Vérifier Home.tsx (contenu original préservé)
- [x] Vérifier App.tsx (8 pages + admin route)
- [x] Vérifier toutes les pages publiques (Services, About, Training, Portfolio, Blog, Contact)
- [x] Vérifier FormModalProvider et tracking GA4

## Phase 6 - Tests & Livraison ✅
- [x] Exécuter tous les tests vitest (13 tests passés)
- [x] Vérifier TypeScript (0 erreurs)
- [x] Vérifier que le serveur démarre correctement
- [x] Vérifier les routes tRPC
- [x] Vérifier l'endpoint /api/upload
- [x] Vérifier la page admin /admin/files
- [x] Vérifier la page Products avec chargement dynamique
- [x] Créer checkpoint final

## Fonctionnalités Implémentées

### Backend (Express + tRPC)
- Routes tRPC pour files (CRUD) et leads (submit, list, updateStatus)
- Endpoint Express /api/upload pour multipart file upload
- Intégration S3 via storagePut (fichiers stockés avec clé unique)
- Notification owner via notifyOwner() quand nouveau lead
- Protection admin sur routes sensibles

### Frontend (React + Tailwind)
- Page admin /admin/files avec upload, liste fichiers, gestion leads
- Page Products avec chargement dynamique des fichiers
- Boutons "Télécharger" qui ouvrent URL signée S3
- Tracking GA4 complet (file_downloaded, etc.)
- Fallback vers produits statiques

### Base de Données (MySQL/Drizzle)
- Table files (fileKey, url, title, category, sizeBytes, downloadCount, etc.)
- Table leads (formType, name, email, phone, payload, status, etc.)
- Helpers pour CRUD et filtrage

### Tests
- 12 tests vitest pour routers (files + leads)
- 1 test vitest pour auth.logout
- Total: 13 tests passés ✅

## Architecture

```
/home/ubuntu/gtc-website/
├── client/src/
│   ├── pages/
│   │   ├── Home.tsx (8 pages publiques)
│   │   ├── Products.tsx (intégration tRPC)
│   │   └── AdminFiles.tsx (page admin)
│   ├── App.tsx (routes + admin)
│   └── lib/trpc.ts (client tRPC)
├── server/
│   ├── routers.ts (files + leads routes)
│   ├── db.ts (helpers BDD)
│   ├── storage.ts (S3 helpers)
│   ├── upload.ts (endpoint multipart)
│   └── _core/index.ts (Express setup)
├── drizzle/
│   └── schema.ts (users, files, leads)
└── vitest.config.ts
```

## Prochaines Étapes (Optionnelles — Non-prioritaires)

- [ ] Ajouter paiement Stripe pour fichiers payants (priceCents > 0)
- [ ] Ajouter système de notifications email pour leads
- [ ] Ajouter pagination sur liste leads/fichiers
- [ ] Ajouter recherche/filtrage avancé
- [ ] Ajouter analytics dashboard pour admin
- [ ] Ajouter export CSV des leads
- [ ] Ajouter versioning des fichiers
- [ ] Ajouter système de commentaires/reviews sur produits

## Statut Final

**Conversion full-stack complétée avec succès ✅**

Toutes les fonctionnalités principales de la Phase 2/5 sont implémentées et testées. Le site GTC est maintenant prêt pour la gestion dynamique de fichiers, leads et administration. Les prochaines étapes sont optionnelles et peuvent être ajoutées ultérieurement selon les besoins du client.

# 📊 Référence Google Analytics 4 — Site GTC

**Measurement ID :** `G-E8BJX3SBHF`

Tous les événements ci-dessous sont automatiquement envoyés à GA4. Ils apparaissent dans **GA4 → Rapports → Engagement → Événements** sous 24-48h, et en temps réel dans **GA4 → Rapports → Temps réel**.

---

## 🎯 Liste complète des événements trackés

| Catégorie | Nom de l'événement | Paramètres | Source / Action |
|---|---|---|---|
| **Visites** | `page_view` | `page_path`, `page_title`, `page_location` | Auto sur chaque changement de page (SPA) |
| **WhatsApp** | `whatsapp_click` | `context`, `channel` | Tous les clics WhatsApp (navbar, flottant, sections, footer) |
| **WhatsApp** | `Contact` (Meta) | `context`, `method` | Clic WhatsApp = signal de contact (équivalent Lead) |
| **WhatsApp** | `chat_bubble_shown` | `source` | Bulle de chat WhatsApp affichée (5s) |
| **WhatsApp** | `chat_bubble_clicked` | `source` | Clic sur la bulle de chat WhatsApp |
| **WhatsApp** | `chat_bubble_dismissed` | `source` | Fermeture de la bulle de chat |
| **Formulaires** | `form_open` | `form_type` | Ouverture d'un modal (software/training/data) |
| **Formulaires** | `form_close` | `form_type` | Fermeture d'un modal sans envoi |
| **Formulaires** | `form_submit` | `form_type`, `send_method` | Soumission formulaire (modal ou contact) |
| **Formulaires** | `Lead` (Meta) | `form_type`, `method` | Standard event Meta — équivalent `form_submit` |
| **Lead Magnet** | `lead_popup_shown` | `trigger_source` (timer/exit_intent) | Popup Guide Excel Pro affiché |
| **Lead Magnet** | `lead_popup_dismissed` | `had_email` | Popup fermé |
| **Lead Magnet** | `lead_magnet_submit` | `source` | Formulaire Guide Excel Pro envoyé |
| **Lead Magnet** | `lead_capture` | `source` | Email capturé via lead magnet |
| **CTA** | `cta_click` | `cta_name`, `location` | Clics sur boutons CTA principaux |
| **Vidéo** | `video_play` | `video_name`, `location` | Bouton Play sur la vidéo hero |
| **Produits** | `begin_checkout` | `item_name`, `value` | Clic "Acheter" sur la page Produits |
| **Produits** | `InitiateCheckout` (Meta) | `content_name`, `value` | Standard event Meta |
| **Produits** | `bundle_click` | `offer` | Clic sur l'offre Pack 3 produits -30% |
| **Réseaux** | `social_click` | `network`, `location` | Clic sur Instagram/TikTok/Facebook/YouTube/Twitter/Telegram |
| **Email** | `email_click` | `email_address`, `location` | Clic sur lien `mailto:` |
| **Téléphone** | `phone_click` | `phone_number`, `location` | Clic sur lien `tel:` |

---

## 🏷️ Valeurs possibles pour `context` (WhatsApp)

| Valeur | Signification |
|---|---|
| `general` | Demande générale d'info |
| `software` | Système / application sur mesure |
| `training` | Formation Excel / Sheets / VBA |
| `data` | Analyse de données |
| `consulting` | Consultation gratuite |
| `product` | Achat e-book / template |
| `navbar` | Bouton WhatsApp dans la navigation |
| `floating` | Bouton WhatsApp flottant en bas |

---

## ⚙️ Configuration recommandée dans GA4

### 1. Marquer comme **Conversions** (Admin → Événements → Marquer comme conversion)

Ces événements sont les plus importants pour mesurer le ROI :
- ✅ `whatsapp_click` — chaque contact WhatsApp est un lead chaud
- ✅ `form_submit` — formulaire envoyé
- ✅ `lead_capture` — email récupéré
- ✅ `begin_checkout` — intention d'achat
- ✅ `chat_bubble_clicked` — engagement avec la bulle de chat

### 2. Créer des **Audiences** (Admin → Audiences)

- **Visiteurs intéressés** : ont déclenché `form_open` mais pas `form_submit` (à recibler en pub)
- **Leads chauds** : ont déclenché `whatsapp_click` ou `form_submit`
- **Acheteurs potentiels** : ont déclenché `begin_checkout`

### 3. Créer des **Rapports personnalisés** (Explorer)

Suivre par exemple :
- Quel **contexte WhatsApp** convertit le mieux ? (filter par `context`)
- Quel **type de formulaire** est le plus rempli ? (filter par `form_type`)
- Quel **réseau social** génère le plus de clics ? (filter par `network`)

---

## 🧪 Comment tester

1. **Ouvrir le site en navigation privée**
2. **Aller dans GA4 → Rapports → Temps réel**
3. Cliquer sur les boutons (WhatsApp, formulaire, CTA…) — les événements doivent apparaître en quelques secondes
4. **Astuce dev** : ouvrir la console du navigateur, taper `gtag('event', 'test_event', {test: true})` pour vérifier la connexion

---

## 📈 Méta-données disponibles

Chaque événement est automatiquement enrichi par GA4 avec :
- Source de trafic (organique, direct, social, referral)
- Pays / ville (géolocalisation IP)
- Appareil (mobile / desktop), navigateur, OS
- Page d'entrée et page de sortie
- Durée de session

Pas besoin de tracker manuellement ces dimensions.

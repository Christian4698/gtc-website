# Configuration Paiement GTC

Cette intégration prépare le paiement Mobile Money via Flutterwave ou CinetPay sans exposer les clés secrètes dans le frontend.

## Variables `.env`

Ajoutez les vraies clés du compte marchand sur le serveur de production :

```env
PAYMENT_PROVIDER=flutterwave
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_ENCRYPTION_KEY=
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
PAYMENT_WEBHOOK_SECRET=
PAYMENT_CALLBACK_URL=https://www.generaltechconsult.com/products
```

Pour CinetPay :

```env
PAYMENT_PROVIDER=cinetpay
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
PAYMENT_WEBHOOK_SECRET=
PAYMENT_CALLBACK_URL=https://www.generaltechconsult.com/products
```

## Routes serveur

- `POST /api/payment/create`
  - Reçoit : nom, email, téléphone, produit, mode de réception.
  - Crée une transaction côté serveur.
  - Retourne uniquement une URL de paiement sécurisée.

- `POST /api/payment/webhook`
  - Reçoit les notifications du prestataire.
  - Vérifie le paiement auprès du prestataire côté serveur.
  - Met à jour le statut : `pending`, `successful`, `failed`, `cancelled`.

## Produits configurés

- E-book : `17.5 USD`
- Format papier : `31.5 USD`
- Livraison papier : `6000 CDF` en métadonnée de commande

La livraison est conservée séparément parce que le produit est facturé en USD tandis que la livraison est indiquée en CDF.

## Sécurité

- Ne mettez jamais `FLUTTERWAVE_SECRET_KEY`, `CINETPAY_API_KEY` ou `PAYMENT_WEBHOOK_SECRET` dans le frontend.
- Le frontend ne valide jamais un paiement.
- La confirmation officielle doit venir du webhook et de la vérification serveur.
- Configurez l’URL webhook dans le dashboard du prestataire :

```text
https://www.generaltechconsult.com/api/payment/webhook
```

## Après paiement

Quand le webhook confirme `successful`, le serveur logge :

```text
Paiement réussi. Merci pour votre achat GTC.
```

Étape suivante recommandée : brancher l’envoi automatique email/WhatsApp après ce statut serveur confirmé.

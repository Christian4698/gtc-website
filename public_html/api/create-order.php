<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

gtc_apply_cors('POST');

if (!gtc_origin_is_allowed()) {
    gtc_json_error('Origine non autorisee.', 403);
}

gtc_require_method('POST');

function gtc_read_order_payload(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $raw = file_get_contents('php://input') ?: '';

    if (stripos($contentType, 'application/json') !== false) {
        $payload = json_decode($raw, true);
        if (!is_array($payload)) {
            gtc_json_error('JSON invalide.', 400);
        }
        return $payload;
    }

    return $_POST;
}

function gtc_required_text(array $payload, string $key, int $min, int $max): string
{
    if (!array_key_exists($key, $payload)) {
        gtc_json_error('Champ requis manquant: ' . $key, 422);
    }

    $value = gtc_clean_text($payload[$key], $max);
    $length = gtc_string_length($value);

    if ($length < $min || $length > $max) {
        gtc_json_error('Champ invalide: ' . $key, 422);
    }

    return $value;
}

function gtc_next_order_code(PDO $pdo, int $year): string
{
    $prefix = sprintf('GTC-ORD-%d-', $year);
    $stmt = $pdo->prepare(
        'SELECT order_code
         FROM commandes
         WHERE order_code LIKE :prefix
         ORDER BY CAST(SUBSTRING(order_code, 14) AS UNSIGNED) DESC
         LIMIT 1
         FOR UPDATE'
    );
    $stmt->execute([':prefix' => $prefix . '%']);
    $lastCode = $stmt->fetchColumn();

    $nextNumber = 1;
    if (is_string($lastCode) && preg_match('/^GTC-ORD-\d{4}-(\d+)$/', $lastCode, $matches)) {
        $nextNumber = ((int) $matches[1]) + 1;
    }

    return $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
}

$payload = gtc_read_order_payload();

$nom = gtc_required_text($payload, 'nom', 2, 256);
$email = gtc_required_text($payload, 'email', 5, 320);
$whatsapp = gtc_required_text($payload, 'whatsapp', 6, 64);
$produit = gtc_required_text($payload, 'produit', 2, 256);
$formatProduit = gtc_required_text($payload, 'format_produit', 2, 128);
$modeReception = gtc_required_text($payload, 'mode_reception', 2, 128);
$devise = strtoupper(gtc_required_text($payload, 'devise', 3, 8));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    gtc_json_error('Email invalide.', 422);
}

if (!preg_match('/^[0-9+().\s-]{6,64}$/', $whatsapp)) {
    gtc_json_error('Numero WhatsApp invalide.', 422);
}

if (!preg_match('/^[A-Z]{3,8}$/', $devise)) {
    gtc_json_error('Devise invalide.', 422);
}

if (!array_key_exists('montant', $payload)) {
    gtc_json_error('Champ requis manquant: montant', 422);
}

$montant = (float) str_replace(',', '.', (string) $payload['montant']);
if ($montant <= 0 || $montant > 999999999) {
    gtc_json_error('Montant invalide.', 422);
}

$pdo = null;
$attempts = 3;

for ($attempt = 1; $attempt <= $attempts; $attempt++) {
    try {
        $pdo = gtc_db();
        $pdo->exec('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
        $pdo->beginTransaction();

        $orderCode = gtc_next_order_code($pdo, (int) date('Y'));

        $stmt = $pdo->prepare(
            'INSERT INTO commandes
                (order_code, nom, email, whatsapp, produit, format_produit, mode_reception, montant, devise)
             VALUES
                (:order_code, :nom, :email, :whatsapp, :produit, :format_produit, :mode_reception, :montant, :devise)'
        );
        $stmt->execute([
            ':order_code' => $orderCode,
            ':nom' => $nom,
            ':email' => $email,
            ':whatsapp' => $whatsapp,
            ':produit' => $produit,
            ':format_produit' => $formatProduit,
            ':mode_reception' => $modeReception,
            ':montant' => number_format($montant, 2, '.', ''),
            ':devise' => $devise,
        ]);

        $pdo->commit();

        gtc_json([
            'success' => true,
            'order_code' => $orderCode,
        ], 201);
    } catch (PDOException $exception) {
        if ($pdo instanceof PDO && $pdo->inTransaction()) {
            $pdo->rollBack();
        }

        if ($exception->getCode() === '23000' && $attempt < $attempts) {
            continue;
        }

        error_log('[GTC create-order] ' . $exception->getMessage());
        gtc_json_error('Impossible d enregistrer la commande pour le moment.', 500);
    } catch (Throwable $exception) {
        if ($pdo instanceof PDO && $pdo->inTransaction()) {
            $pdo->rollBack();
        }

        error_log('[GTC create-order] ' . $exception->getMessage());
        gtc_json_error('Erreur serveur temporaire.', 500);
    }
}

gtc_json_error('Impossible d enregistrer la commande pour le moment.', 500);

<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

gtc_apply_cors('GET');
gtc_require_method('GET');

function gtc_normalize_certificate_status($status): string
{
    $value = strtolower(trim((string) $status));

    if (in_array($value, ['valid', 'valide', 'reussi'], true)) {
        return 'valid';
    }

    if (in_array($value, ['revoked', 'revoque'], true)) {
        return 'revoked';
    }

    if (in_array($value, ['expired', 'expire'], true)) {
        return 'expired';
    }

    return $value;
}

function gtc_format_certificate_date($value): string
{
    $text = trim((string) $value);
    if (preg_match('/^\d{4}-\d{2}-\d{2}/', $text, $matches)) {
        return $matches[0];
    }

    return $text;
}

$certificateId = strtoupper(gtc_clean_text($_GET['certificate_id'] ?? '', 64));

if ($certificateId === '' || !preg_match('/^[A-Z0-9._-]{3,64}$/', $certificateId)) {
    gtc_json_error('Parametre certificate_id invalide.', 422);
}

$requiredColumns = [
    'certificate_id',
    'nom_complet',
    'formation',
    'niveau',
    'statut',
    'date_certification',
];

try {
    $pdo = gtc_db();
    $columns = gtc_table_columns($pdo, 'certificats');
    $missingColumns = array_values(array_diff($requiredColumns, $columns));

    if ($columns === []) {
        $debug = gtc_is_debug() ? [
            'debug' => [
                'db' => gtc_db_health($pdo),
                'table' => 'certificats',
                'columns_found' => [],
                'required_columns' => $requiredColumns,
            ],
        ] : [];

        gtc_json_error('Table certificats introuvable.', 500, $debug);
    }

    if ($missingColumns !== []) {
        $debug = gtc_is_debug() ? [
            'debug' => [
                'db' => gtc_db_health($pdo),
                'table' => 'certificats',
                'columns_found' => $columns,
                'missing_columns' => $missingColumns,
                'required_columns' => $requiredColumns,
            ],
        ] : [];

        gtc_json_error('Colonnes manquantes dans la table certificats.', 500, $debug);
    }

    $stmt = $pdo->prepare(
        'SELECT
            `nom_complet`,
            `formation`,
            `niveau`,
            `statut`,
            `date_certification`
         FROM `certificats`
         WHERE `certificate_id` = :certificate_id
         LIMIT 1'
    );
    $stmt->execute([':certificate_id' => $certificateId]);
    $certificate = $stmt->fetch();

    if (!$certificate) {
        $debug = gtc_is_debug() ? [
            'debug' => [
                'db' => gtc_db_health($pdo),
                'table' => 'certificats',
                'certificate_id' => $certificateId,
                'columns_found' => $columns,
            ],
        ] : [];

        gtc_json_error('Certification non reconnue.', 404, array_merge([
            'recognized' => false,
        ], $debug));
    }

    $response = [
        'success' => true,
        'recognized' => true,
        'nom_complet' => trim((string) $certificate['nom_complet']),
        'formation' => trim((string) $certificate['formation']),
        'niveau' => trim((string) $certificate['niveau']),
        'statut' => gtc_normalize_certificate_status($certificate['statut']),
        'date_certification' => gtc_format_certificate_date($certificate['date_certification']),
    ];

    if (gtc_is_debug()) {
        $response['debug'] = [
            'db' => gtc_db_health($pdo),
            'table' => 'certificats',
            'certificate_id' => $certificateId,
            'columns_found' => $columns,
        ];
    }

    gtc_json($response);
} catch (PDOException $exception) {
    error_log('[GTC verify-certificate PDO] ' . gtc_sanitize_debug_text($exception->getMessage()));

    $debug = gtc_is_debug() ? [
        'debug' => [
            'pdo_error' => gtc_exception_debug($exception),
            'db_host' => GTC_DB_HOST,
            'db_name' => GTC_DB_NAME,
            'db_user' => GTC_DB_USER,
            'password_exposed' => false,
        ],
    ] : [];

    gtc_json_error('Erreur PDO MySQL.', 500, $debug);
} catch (Throwable $exception) {
    error_log('[GTC verify-certificate] ' . gtc_sanitize_debug_text($exception->getMessage()));

    $debug = gtc_is_debug() ? [
        'debug' => [
            'error' => gtc_exception_debug($exception),
            'db_host' => GTC_DB_HOST,
            'db_name' => GTC_DB_NAME,
            'password_exposed' => false,
        ],
    ] : [];

    gtc_json_error('Erreur serveur temporaire.', 500, $debug);
}

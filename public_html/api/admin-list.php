<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

gtc_require_admin_password();

function gtc_quote_identifier(string $identifier): string
{
    return '`' . str_replace('`', '``', $identifier) . '`';
}

function gtc_fetch_rows(PDO $pdo, string $table, array $wantedColumns, array $orderCandidates, int $limit = 100): array
{
    if (!in_array($table, ['commandes', 'certificats'], true)) {
        throw new InvalidArgumentException('Table non autorisee.');
    }

    $availableColumns = gtc_table_columns($pdo, $table);
    if ($availableColumns === []) {
        return [
            'missing' => true,
            'columns' => [],
            'rows' => [],
        ];
    }

    $columns = [];
    foreach ($wantedColumns as $column) {
        if (in_array($column, $availableColumns, true)) {
            $columns[] = $column;
        }
    }

    if ($columns === []) {
        return [
            'missing' => false,
            'columns' => [],
            'rows' => [],
        ];
    }

    $orderColumn = null;
    foreach ($orderCandidates as $candidate) {
        if (in_array($candidate, $availableColumns, true)) {
            $orderColumn = $candidate;
            break;
        }
    }

    $sql = 'SELECT ' . implode(', ', array_map('gtc_quote_identifier', $columns))
        . ' FROM ' . gtc_quote_identifier($table);

    if ($orderColumn !== null) {
        $sql .= ' ORDER BY ' . gtc_quote_identifier($orderColumn) . ' DESC';
    }

    $sql .= ' LIMIT ' . (int) $limit;

    return [
        'missing' => false,
        'columns' => $columns,
        'rows' => $pdo->query($sql)->fetchAll(),
    ];
}

function gtc_render_table(string $title, string $tableName, array $dataset): void
{
    echo '<section class="panel">';
    echo '<h2>' . gtc_html($title) . '</h2>';

    if ($dataset['missing']) {
        echo '<p class="muted">Table ' . gtc_html($tableName) . ' introuvable.</p>';
        echo '</section>';
        return;
    }

    if ($dataset['columns'] === [] || $dataset['rows'] === []) {
        echo '<p class="muted">Aucune donnee a afficher.</p>';
        echo '</section>';
        return;
    }

    echo '<div class="table-wrap"><table><thead><tr>';
    foreach ($dataset['columns'] as $column) {
        echo '<th>' . gtc_html($column) . '</th>';
    }
    echo '</tr></thead><tbody>';

    foreach ($dataset['rows'] as $row) {
        echo '<tr>';
        foreach ($dataset['columns'] as $column) {
            echo '<td>' . gtc_html((string) ($row[$column] ?? '')) . '</td>';
        }
        echo '</tr>';
    }

    echo '</tbody></table></div></section>';
}

$error = null;
$orders = ['missing' => false, 'columns' => [], 'rows' => []];
$certificates = ['missing' => false, 'columns' => [], 'rows' => []];

try {
    $pdo = gtc_db();
    $orders = gtc_fetch_rows(
        $pdo,
        'commandes',
        ['order_code', 'nom', 'email', 'whatsapp', 'produit', 'format_produit', 'mode_reception', 'montant', 'devise', 'created_at'],
        ['created_at', 'id', 'order_code']
    );
    $certificates = gtc_fetch_rows(
        $pdo,
        'certificats',
        ['certificate_id', 'nom_complet', 'formation', 'niveau', 'statut', 'date_certification', 'created_at'],
        ['date_certification', 'created_at', 'id', 'certificate_id']
    );
} catch (Throwable $exception) {
    error_log('[GTC admin-list] ' . $exception->getMessage());
    $error = 'Impossible de charger les donnees pour le moment.';
}
?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>GTC Admin temporaire</title>
    <style>
        :root {
            color-scheme: light;
            --ink: #0f172a;
            --muted: #64748b;
            --line: #dbe4ee;
            --panel: #ffffff;
            --page: #f8fafc;
            --brand: #0f6bff;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            background: var(--page);
            color: var(--ink);
            font-family: Arial, Helvetica, sans-serif;
        }
        header {
            padding: 24px;
            border-bottom: 1px solid var(--line);
            background: var(--panel);
        }
        main {
            width: min(1180px, calc(100% - 32px));
            margin: 24px auto 48px;
            display: grid;
            gap: 24px;
        }
        h1, h2 { margin: 0; }
        h1 { font-size: 24px; }
        h2 { font-size: 18px; }
        .hint {
            margin: 8px 0 0;
            color: var(--muted);
            font-size: 14px;
        }
        .panel {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 8px;
            padding: 18px;
        }
        .table-wrap {
            margin-top: 14px;
            overflow-x: auto;
            border: 1px solid var(--line);
            border-radius: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            min-width: 860px;
        }
        th, td {
            padding: 10px 12px;
            border-bottom: 1px solid var(--line);
            text-align: left;
            vertical-align: top;
        }
        th {
            background: #eef4ff;
            color: #12305a;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .04em;
        }
        tr:last-child td { border-bottom: 0; }
        .muted { color: var(--muted); }
        .error {
            border-color: #fecaca;
            background: #fef2f2;
            color: #991b1b;
        }
    </style>
</head>
<body>
    <header>
        <h1>GTC Admin temporaire</h1>
        <p class="hint">Acces protege par mot de passe HTTP Basic Auth. Garder cette page temporaire et non indexee.</p>
    </header>
    <main>
        <?php if ($error !== null): ?>
            <section class="panel error"><?php echo gtc_html($error); ?></section>
        <?php else: ?>
            <?php gtc_render_table('Commandes recentes', 'commandes', $orders); ?>
            <?php gtc_render_table('Certificats', 'certificats', $certificates); ?>
        <?php endif; ?>
    </main>
</body>
</html>

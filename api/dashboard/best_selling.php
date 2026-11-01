<?php
// ==============================================================
// GET /api/dashboard/best_selling.php?limit=5
// រាប់ម្ហូបដែលកម្មង់ច្រើនដងបំផុត ពី order_items ពិតប្រាកដ
// (មិនមែន hardcode ដដែលៗទៀតទេ — គណនាពិតប្រាកដពី database)
// ==============================================================

require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 5;

    $sql = "
        SELECT
            mi.name,
            SUM(oi.quantity) AS total_orders,
            SUM(oi.quantity * oi.price) AS total_revenue
        FROM order_items oi
        JOIN menu_items mi ON mi.id = oi.menu_item_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status != 5
        GROUP BY mi.id
        ORDER BY total_orders DESC
        LIMIT :limit
    ";
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $grandTotalRevenue = array_sum(array_column($rows, 'total_revenue'));

    $bestSelling = array_map(function ($row) use ($grandTotalRevenue) {
        $pct = $grandTotalRevenue > 0
            ? round(($row['total_revenue'] / $grandTotalRevenue) * 100) . '%'
            : '0%';

        return [
            'name' => $row['name'],
            'orders' => (int) $row['total_orders'],
            'revenue' => '$' . number_format((float) $row['total_revenue'], 2),
            'pct' => $pct
        ];
    }, $rows);

    sendJson($bestSelling);
} catch (PDOException $e) {
    sendJson(['error' => $e->getMessage()], 500);
}

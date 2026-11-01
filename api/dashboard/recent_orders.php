<?php
// ==============================================================
// GET /api/dashboard/recent_orders.php?limit=10
// ត្រឡប់ការកម្មង់ថ្មីៗបំផុត — shape ត្រូវនឹង OrdersTable.jsx rows ដេជាក់ស្តែង
// { order_no, table, customer, items, status, amount }
// ==============================================================

require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;

    $sql = "
        SELECT
            o.order_no,
            dt.table_number AS table_name,
            c.name AS customer_name,
            COUNT(oi.id) AS item_count,
            o.status,
            o.total_amount
        FROM orders o
        LEFT JOIN dining_tables dt ON dt.id = o.table_id
        LEFT JOIN customers c ON c.id = o.customer_id
        LEFT JOIN order_items oi ON oi.order_id = o.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT :limit
    ";
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $orders = array_map(function ($row) {
        return [
            'order_no' => $row['order_no'],
            'table' => $row['table_name'] ?? '-',
            'customer' => $row['customer_name'] ?? 'Walk-in',
            'items' => (int) $row['item_count'],
            'status' => (int) $row['status'],
            'amount' => (float) $row['total_amount']
        ];
    }, $rows);

    sendJson($orders);
} catch (PDOException $e) {
    sendJson(['error' => $e->getMessage()], 500);
}

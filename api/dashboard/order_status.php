<?php
// ==============================================================
// GET /api/dashboard/order_status.php
// ត្រឡប់ pending/preparing/completedToday counts + 7-day trend
// (status: 0=Pending, 1=Preparing, 2=Ready, 3=Served, 4=Completed, 5=Cancelled)
// ==============================================================

require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $row = $db->query("
        SELECT
            SUM(status = 0) AS pending,
            SUM(status = 1) AS preparing,
            SUM(status = 4 AND DATE(created_at) = CURDATE()) AS completed_today
        FROM orders
    ")->fetch();

    // ចំនួនការកម្មង់ 7 ថ្ងៃចុងក្រោយ សម្រាប់គូសក្រាហ្វ (ReportAreaChart)
    $trendRows = $db->query("
        SELECT DATE(created_at) AS day, COUNT(*) AS total
        FROM orders
        WHERE created_at >= CURDATE() - INTERVAL 6 DAY
        GROUP BY DATE(created_at)
        ORDER BY day ASC
    ")->fetchAll();

    sendJson([
        'pending' => (int) ($row['pending'] ?? 0),
        'preparing' => (int) ($row['preparing'] ?? 0),
        'completedToday' => (int) ($row['completed_today'] ?? 0),
        'trend' => array_map(function ($r) {
            return ['day' => $r['day'], 'total' => (int) $r['total']];
        }, $trendRows)
    ]);
} catch (PDOException $e) {
    sendJson(['error' => $e->getMessage()], 500);
}

<?php
// ==============================================================
// GET /api/dashboard/revenue.php
// ត្រឡប់ Today's Revenue + Weekly revenue series (គ្រប់ ៧ ថ្ងៃពេញ ប្រើ PHP Logic)
// (មិនរាប់ order ដែល status = 5 / Cancelled ទេ)
// ==============================================================

require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $todaysRevenue = (float) $db->query("
        SELECT COALESCE(SUM(total_amount), 0)
        FROM orders
        WHERE DATE(created_at) = CURDATE() AND status != 5
    ")->fetchColumn();

    // ១. បង្កើត Array សម្រាប់ 7 ថ្ងៃចុងក្រោយ (កំណត់តម្លៃដើម 0 ទាំងអស់)
    $weeklyData = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $weeklyData[$date] = [
            'day' => $date,
            'total' => 0.0
        ];
    }

    // ២. ទាញយកទិន្នន័យលក់ពិតប្រាកដពី Database ក្នុងអំឡុង 7 ថ្ងៃចុងក្រោយ
    $stmt = $db->query("
        SELECT DATE(created_at) AS day, SUM(total_amount) AS total
        FROM orders
        WHERE created_at >= CURDATE() - INTERVAL 6 DAY AND status != 5
        GROUP BY DATE(created_at)
    ");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ៣. យកទិន្នន័យពី Database មកដាក់បញ្ចូលក្នុងថ្ងៃដែលត្រូវគ្នា
    foreach ($rows as $row) {
        $d = $row['day'];
        if (isset($weeklyData[$d])) {
            $weeklyData[$d]['total'] = (float) $row['total'];
        }
    }

    sendJson([
        'todaysRevenue' => $todaysRevenue,
        'weekly' => array_values($weeklyData)
    ]);
} catch (PDOException $e) {
    sendJson(['error' => $e->getMessage()], 500);
}
?>
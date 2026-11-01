<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT
                r.id,
                r.table_id,
                t.table_number AS table_name,
                r.customer_id,
                c.name AS customer_name,
                c.phone,
                r.reservation_date AS date,
                r.reservation_time AS time,
                r.guests,
                r.status
              FROM reservations r
              LEFT JOIN customers c ON r.customer_id = c.id
              LEFT JOIN dining_tables t ON r.table_id = t.id
              ORDER BY r.reservation_date DESC, r.reservation_time DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($reservations as &$r) {
        $r['status'] = $r['status'] ? ucfirst($r['status']) : 'Confirmed';
        $r['customer_name'] = $r['customer_name'] ?? 'Guest';
        $r['phone'] = $r['phone'] ?? '';
        $r['table_name'] = $r['table_name'] ?? 'N/A';
    }
    unset($r); // បំបែក reference ជៀសវាង error

    http_response_code(200);
    echo json_encode($reservations);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php'; 

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // ប្រើ Column total_amount ត្រូវតាម Database របស់អ្នក
    $query = "SELECT id, order_no, table_id, customer_id, status, total_amount, created_at FROM orders ORDER BY id DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $orders = $stmt->fetchAll();
    echo json_encode($orders);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
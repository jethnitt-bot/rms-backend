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

    $query = "SELECT id, category_id, name, price FROM menu_items ORDER BY name ASC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $menu_items = $stmt->fetchAll();
    echo json_encode($menu_items);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
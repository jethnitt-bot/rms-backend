<?php
require_once '../../config/database.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $db = new Database();
    $conn = $db->getConnection();

    $res_stmt = $conn->query("SELECT * FROM restaurant_settings WHERE id = 1");
    $sys_stmt = $conn->query("SELECT * FROM system_settings WHERE id = 1");

    $restaurant = $res_stmt ? $res_stmt->fetch() : null;
    $system = $sys_stmt ? $sys_stmt->fetch() : null;

    echo json_encode([
        "success" => true,
        "restaurant" => $restaurant,
        "system" => $system
    ]);
}
?>
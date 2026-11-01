<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_file = __DIR__ . '/../../config/database.php';

if (!file_exists($db_file)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'រកមិនឃើញ file database.php ឡើយ!'
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

require_once $db_file;

$database = new Database();
$conn = $database->getConnection();

try {
    // 🟢 កែសម្រួល WHERE៖ ទាញយកเฉพาะ Order ណាដែលមិនទាន់បានគិតលុយ 
    // (ឧទាហរណ៍៖ total_amount ស្មើ 0 ឬ មិនទាន់មាន status เป็น 'completed' / 'paid')
    // ឬបើ order_status របស់អ្នកប្រើប្រាស់លេខ 0, 1, 2 សម្រាប់ Kitchen តែមិនទាន់បង់ប្រាក់
    $query = "
        SELECT 
            o.id AS order_id,
            o.table_id,
            t.table_number,
            o.total_amount,
            o.status AS order_status,
            o.created_at
        FROM orders o
        LEFT JOIN dining_tables t ON o.table_id = t.id
        WHERE o.status != 'completed' AND o.status != 'paid'
        ORDER BY o.created_at DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];

    foreach ($orders as $order) {
        $itemQuery = "
            SELECT 
                oi.id AS order_item_id,
                oi.menu_item_id AS item_id,
                oi.quantity,
                oi.price,
                m.name AS item_name,
                m.image
            FROM order_items oi
            LEFT JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE oi.order_id = :order_id
        ";
        $itemStmt = $conn->prepare($itemQuery);
        $itemStmt->execute([':order_id' => $order['order_id']]);
        $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($items)) {
            $order['items'] = $items;
            $result[] = $order;
        }
    }

    echo json_encode([
        'status' => 'success',
        'data' => $result
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
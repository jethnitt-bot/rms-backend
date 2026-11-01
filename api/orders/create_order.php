<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php'; 

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['items'])) {
    try {
        $db = new Database();
        $pdo = $db->getConnection();

        $pdo->beginTransaction();

        $order_no = 'ORD-' . date('Ymd') . '-' . rand(1000, 9999);
        $table_id = !empty($data['table_id']) ? $data['table_id'] : null;
        $customer_id = !empty($data['customer_id']) ? $data['customer_id'] : null;
        $total_amount = $data['total_amount'] ?? $data['grand_total'] ?? 0;

        // 1. Insert ចូលទៅតារាង orders
        $stmt = $pdo->prepare("INSERT INTO orders (order_no, table_id, customer_id, status, total_amount) 
                               VALUES (?, ?, ?, 'Pending', ?)");
        $stmt->execute([$order_no, $table_id, $customer_id, $total_amount]);
        
        $order_id = $pdo->lastInsertId();

        // 2. Insert ចូលទៅតារាង order_items (ដក total_price ចេញ)
        $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, menu_item_id, quantity, price) 
                                   VALUES (?, ?, ?, ?)");

        foreach ($data['items'] as $item) {
            $unit_price = $item['unit_price'] ?? $item['price'] ?? 0;
            $qty = $item['quantity'] ?? $item['qty'] ?? 1;

            $stmtItem->execute([
                $order_id,
                $item['menu_item_id'],
                $qty,
                $unit_price
            ]);
        }

        $pdo->commit();
        echo json_encode([
            "status" => "success", 
            "message" => "Order created successfully", 
            "order_id" => $order_id,
            "order_no" => $order_no
        ]);

    } catch (Exception $e) {
        if (isset($pdo) && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "fail", "message" => "Cart is empty"]);
}
?>
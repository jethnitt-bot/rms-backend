<?php
// ១. បន្ថែម Header CORS ឱ្យគ្រប់គ្រាន់
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// ២. ឆ្លើយតប Preflight OPTIONS Request ភ្លាមៗ
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Query ទាញយក Orders ដែលមិនទាន់ completed ឬ cancelled
    $query = "SELECT 
                o.id AS order_id, 
                o.status AS order_status, 
                o.created_at,
                dt.table_number
              FROM orders o
              LEFT JOIN dining_tables dt ON o.table_id = dt.id
              WHERE LOWER(o.status) NOT IN ('completed', 'cancelled')
              ORDER BY o.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];

    foreach ($orders as $order) {
        $itemQuery = "SELECT 
                        oi.id AS item_id, 
                        oi.quantity, 
                        oi.notes, 
                        oi.status AS item_status,
                        COALESCE(mi.name, 'Unknown Item') AS item_name
                      FROM order_items oi
                      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
                      WHERE oi.order_id = :order_id";

        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->bindParam(':order_id', $order['order_id']);
        $itemStmt->execute();
        $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

        $order['items'] = $items ? $items : [];
        $result[] = $order;
    }

    // បញ្ជូន JSON Array ចេញទៅ React
    echo json_encode($result);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database Error: " . $e->getMessage()));
}
?>
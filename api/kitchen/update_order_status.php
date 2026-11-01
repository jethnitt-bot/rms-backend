<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->order_id) && isset($data->status)) {
    try {
        $order_id = intval($data->order_id);
        $status_input = strtolower(trim((string)$data->status));

        // 🟢 បំប្លែង String ទៅជាលេខ INT សម្រាប់ Database
        $status_num = 0;
        if ($status_input === 'preparing' || $status_input === '1') {
            $status_num = 1;
        } else if ($status_input === 'ready' || $status_input === '2') {
            $status_num = 2;
        } else if ($status_input === 'completed' || $status_input === '3') {
            $status_num = 3;
        }

        $query = "UPDATE orders SET status = :status WHERE id = :order_id";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':status', $status_num, PDO::PARAM_INT);
        $stmt->bindParam(':order_id', $order_id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("status" => "success", "message" => "Order status updated successfully."));
        } else {
            http_response_code(500);
            echo json_encode(array("status" => "error", "message" => "Unable to update status."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => "Database Error: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Incomplete data."));
}
?>
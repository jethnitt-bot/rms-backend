<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php'; // ពិនិត្យ Path រៀបចំឱ្យត្រូវជាមួយ Database Config របស់អ្នក

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->order_id) && !empty($data->status)) {
    try {
        // កែប្រែឈ្មោះ Column ឱ្យត្រូវនឹង Database (ឧទាហរណ៍៖ order_status ឬ status, order_id ឬ id)
        $query = "UPDATE orders SET order_status = :status WHERE order_id = :order_id";
        
        $stmt = $conn->prepare($query); // ឬប្រើ $db ទៅតាម Variable ក្នុង file database.php របស់អ្នក
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':order_id', $data->order_id);

        if ($stmt->execute()) {
            echo json_encode(array("status" => "success", "message" => "Order status updated successfully."));
        } else {
            echo json_encode(array("status" => "error", "message" => "Unable to update order status."));
        }
    } catch (PDOException $e) {
        echo json_encode(array("status" => "error", "message" => "Database error: " . $e->getMessage()));
    }
} else {
    echo json_encode(array("status" => "error", "message" => "Incomplete data provided. Need order_id and status."));
}
?>
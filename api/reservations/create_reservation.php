<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->table_id) && !empty($data->date) && !empty($data->time) && !empty($data->guests)) {
    try {
        $database = new Database();
        $db = $database->getConnection();

        $customer_id = null;

        // បើសិនជាមានឈ្មោះភ្ញៀវ -> រកមើល ឬបង្កើត Customer ថ្មី
        if (!empty($data->customer_name)) {
            $phone = !empty($data->phone) ? $data->phone : '';

            if (!empty($phone)) {
                $checkCust = $db->prepare("SELECT id FROM customers WHERE phone = :phone LIMIT 1");
                $checkCust->bindParam(":phone", $phone);
                $checkCust->execute();
                if ($row = $checkCust->fetch(PDO::FETCH_ASSOC)) {
                    $customer_id = $row['id'];
                }
            }

            if (!$customer_id) {
                $insCust = $db->prepare("INSERT INTO customers (name, phone) VALUES (:name, :phone)");
                $insCust->bindParam(":name", $data->customer_name);
                $insCust->bindParam(":phone", $phone);
                $insCust->execute();
                $customer_id = $db->lastInsertId();
            }
        }

        // បញ្ចូលទិន្នន័យការកក់
        $query = "INSERT INTO reservations (table_id, customer_id, reservation_date, reservation_time, guests, status) 
                  VALUES (:table_id, :customer_id, :reservation_date, :reservation_time, :guests, :status)";

        $stmt = $db->prepare($query);

        $status = !empty($data->status) ? strtolower($data->status) : 'confirmed';

        $stmt->bindParam(":table_id", $data->table_id);
        $stmt->bindParam(":customer_id", $customer_id);
        $stmt->bindParam(":reservation_date", $data->date);
        $stmt->bindParam(":reservation_time", $data->time);
        $stmt->bindParam(":guests", $data->guests);
        $stmt->bindParam(":status", $status);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Reservation created successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Unable to create reservation."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Incomplete data."]);
}
?>
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

if (!empty($data->id)) {
    try {
        $database = new Database();
        $db = $database->getConnection();

        $query = "UPDATE reservations 
                  SET table_id = COALESCE(:table_id, table_id), 
                      reservation_date = COALESCE(:reservation_date, reservation_date), 
                      reservation_time = COALESCE(:reservation_time, reservation_time), 
                      guests = COALESCE(:guests, guests), 
                      status = COALESCE(:status, status) 
                  WHERE id = :id";

        $stmt = $db->prepare($query);

        $status = !empty($data->status) ? strtolower($data->status) : null;
        $table_id = !empty($data->table_id) ? $data->table_id : null;
        $date = !empty($data->date) ? $data->date : null;
        $time = !empty($data->time) ? $data->time : null;
        $guests = !empty($data->guests) ? $data->guests : null;

        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":table_id", $table_id);
        $stmt->bindParam(":reservation_date", $date);
        $stmt->bindParam(":reservation_time", $time);
        $stmt->bindParam(":guests", $guests);
        $stmt->bindParam(":status", $status);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Reservation updated successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Unable to update reservation."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing reservation ID."]);
}
?>
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

if (!empty($data->id) && !empty($data->name) && !empty($data->capacity)) {
    try {
        $database = new Database();
        $db = $database->getConnection();

        $query = "UPDATE dining_tables 
                  SET table_number = :table_number, capacity = :capacity, status = :status 
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);

        $status = !empty($data->status) ? strtolower($data->status) : 'available';

        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":table_number", $data->name);
        $stmt->bindParam(":capacity", $data->capacity);
        $stmt->bindParam(":status", $status);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Table updated successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Unable to update table."]);
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
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        $id = intval($data->id);
        $query = "DELETE FROM suppliers WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            echo json_encode(array("status" => "success", "message" => "លុបបានជោគជ័យ"));
        } else {
            echo json_encode(array("status" => "error", "message" => "មិនអាចលុបទិន្នន័យបានទេ"));
        }
    } catch (PDOException $e) {
        echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    }
} else {
    echo json_encode(array("status" => "error", "message" => "ID មិនត្រឹមត្រូវ"));
}
?>
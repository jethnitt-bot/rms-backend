<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->request_code)) {
    $query = "DELETE FROM inventory_requests WHERE request_code = :request_code";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':request_code', $data->request_code);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Request deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Unable to delete request']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Incomplete data']);
}
?>
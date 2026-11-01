<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->item) && !empty($data->qty)) {
    // បង្កើត Request Code ស្វ័យប្រវត្តិ
    $countQuery = "SELECT COUNT(*) as total FROM inventory_requests";
    $stmtCount = $db->prepare($countQuery);
    $stmtCount->execute();
    $row = $stmtCount->fetch(PDO::FETCH_ASSOC);
    $requestCode = 'REQ-' . str_pad($row['total'] + 1, 3, '0', STR_PAD_LEFT);

    $query = "INSERT INTO inventory_requests 
              (request_code, item, qty, unit, price, supplier, requested_by, note, status, request_date) 
              VALUES (:request_code, :item, :qty, :unit, :price, :supplier, :requested_by, :note, 'Pending', CURDATE())";

    $stmt = $db->prepare($query);

    $stmt->bindParam(':request_code', $requestCode);
    $stmt->bindParam(':item', $data->item);
    $stmt->bindParam(':qty', $data->qty);
    $stmt->bindParam(':unit', $data->unit);
    $stmt->bindParam(':price', $data->price);
    $stmt->bindParam(':supplier', $data->supplier);
    $stmt->bindParam(':requested_by', $data->requestedBy);
    $stmt->bindParam(':note', $data->note);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Request added successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Unable to add request']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Incomplete data']);
}
?>
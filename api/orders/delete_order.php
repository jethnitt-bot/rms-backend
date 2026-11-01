<?php
// ១. អនុញ្ញាតឱ្យ React (Cross-Origin) អាច call DELETE method បាន
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// ប្រសិនបើជា Preflight request (OPTIONS) ឱ្យ return OK ភ្លាមៗ
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php'; // សូមពិនិត្យមើល Path ភ្ជាប់ Database របស់អ្នកឱ្យត្រូវ

// ភ្ជាប់ Database
$database = new Database();
$db = $database->getConnection();

// ទាញយក ID តាមរយៈ URL Query Parameter ឬ Request Body
$id = isset($_GET['id']) ? $_GET['id'] : die(json_encode(["status" => "error", "message" => "Missing Order ID"]));

try {
    // ផ្តើម Transaction
    $db->beginTransaction();

    // ក- លុបចោលនូវ Items ទាំងឡាយណាដែលនៅក្នុង Order នោះជាមុនសិន (ដើម្បីកុំឱ្យជាប់ Foreign Key Constraint)
    $queryItems = "DELETE FROM order_items WHERE order_id = :id";
    $stmtItems = $db->prepare($queryItems);
    $stmtItems->bindParam(":id", $id);
    $stmtItems->execute();

    // ខ- បន្ទាប់មកទើបលុប Order ធំ
    $queryOrder = "DELETE FROM orders WHERE id = :id";
    $stmtOrder = $db->prepare($queryOrder);
    $stmtOrder->bindParam(":id", $id);
    $stmtOrder->execute();

    // បញ្ចប់ Transaction
    $db->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Order deleted successfully."
    ]);
} catch (Exception $e) {
    // ប្រសិនបើមាន Error ត្រូវ Rollback វិញ
    $db->rollBack();
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Unable to delete order: " . $e->getMessage()
    ]);
}

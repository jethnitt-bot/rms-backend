<?php
// --- ១. CORS Headers ---
header("Access-Control-Allow-Origin: http://localhost:3003");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- ២. Connection ទៅកាន់ Database ---
$host = "localhost";
$db_name = "rms_db"; 
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->id)) {
        $query = "DELETE FROM users WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $data->id);

        if ($stmt->execute()) {
            echo json_encode(array("status" => "success", "message" => "លុប User បានជោគជ័យ!"));
        } else {
            echo json_encode(array("status" => "error", "message" => "មិនអាចលុបបានទេ!"));
        }
    } else {
        echo json_encode(array("status" => "error", "message" => "រកមិនឃើញ ID សម្រាប់លុបទេ!"));
    }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => "Database error: " . $e->getMessage()));
}
?>
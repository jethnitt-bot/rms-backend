<?php
// --- ១. CORS Headers (ដោះស្រាយបញ្ហា CORS Error) ---
header("Access-Control-Allow-Origin: http://localhost:3003");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- ២. Connection ទៅកាន់ Database ---
// សូមកែប្រែ db_name, username, password តាម Server របស់អ្នក
$host = "localhost";
$db_name = "rms_db"; 
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // --- ៣. Query ទាញយក Users ---
    $query = "SELECT id, fullname, username, email, role, status, created_at FROM users ORDER BY id DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($users);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection error: " . $e->getMessage()));
}
?>
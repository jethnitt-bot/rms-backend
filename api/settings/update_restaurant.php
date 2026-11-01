<?php
// បើកការបង្ហាញ Error សម្រាប់ការ Debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    // ទទួលទិន្នន័យផ្ញើមកពី Frontend ឱ្យចំឈ្មោះ Column ក្នុង Database
    $name = $data['name'] ?? $data['restaurant_name'] ?? '';
    $phone = $data['phone'] ?? '';
    $email = $data['email'] ?? '';
    $address = $data['address'] ?? '';
    $website = $data['website'] ?? '';

    try {
        $db = new Database();
        $conn = $db->getConnection();

        if ($conn instanceof PDO) {
            // ពិនិត្យមើលថាតើមាន id = 1 ស្រាប់ឬនៅ
            $check = $conn->query("SELECT COUNT(*) FROM restaurant_settings WHERE id = 1");
            $exists = $check->fetchColumn();

            if ($exists > 0) {
                // Update ទិន្នន័យ
                $sql = "UPDATE restaurant_settings SET name = ?, phone = ?, email = ?, address = ?, website = ?, updated_at = NOW() WHERE id = 1";
                $stmt = $conn->prepare($sql);
                $stmt->execute([$name, $phone, $email, $address, $website]);
            } else {
                // Insert ប្រសិនបើទើបតែបង្កើតថ្មី
                $sql = "INSERT INTO restaurant_settings (id, name, phone, email, address, website, updated_at) VALUES (1, ?, ?, ?, ?, ?, NOW())";
                $stmt = $conn->prepare($sql);
                $stmt->execute([$name, $phone, $email, $address, $website]);
            }

            echo json_encode(["status" => "success", "message" => " Restaurant settings updated successfully."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Database connection type not supported."]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "API នេះទទួលយកតែ POST Request ប៉ុណ្ណោះ!"]);
}
?>
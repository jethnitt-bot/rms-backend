<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // រៀបចំ Mapping ឈ្មោះ columns ឱ្យត្រូវជាមួយ React Frontend
    $query = "SELECT 
                id, 
                table_number AS name, 
                capacity, 
                status 
              FROM dining_tables 
              ORDER BY id ASC";
              
    $stmt = $db->prepare($query);
    $stmt->execute();

    $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // កែប្រែ Capitalize លើ Status ឱ្យត្រូវជាមួយ Frontend (ឧ. available -> Available)
    foreach ($tables as &$t) {
        $t['status'] = ucfirst($t['status']);
        $t['zone'] = 'Main Floor'; // តម្លៃ Default ប្រសិនបើមិនទាន់មាន Column zone
    }

    http_response_code(200);
    echo json_encode($tables);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
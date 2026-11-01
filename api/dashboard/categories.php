<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // ទាញចេញពី Table categories
        $query = "SELECT * FROM categories ORDER BY id DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit();
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!empty($data['dish_name'])) {
            // បញ្ចូលទៅក្នុង Table categories
            $sql = "INSERT INTO categories (category_name, origin, description, image_url) 
                    VALUES (:category_name, :origin, :description, :image_url)";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':category_name' => $data['dish_name'],
                ':origin'        => $data['origin'] ?? '',
                ':description'   => $data['description'] ?? '',
                ':image_url'     => $data['image_url'] ?? ''
            ]);

            echo json_encode(["status" => "success", "message" => "បញ្ចូល Category ជោគជ័យ!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "សូមបញ្ចូលឈ្មោះ!"]);
        }
        exit();
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>
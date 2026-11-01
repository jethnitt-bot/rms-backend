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

    if (!empty($data->id) && !empty($data->fullname)) {
        
        // ប្រសិនបើមានបញ្ចូល Password ថ្មី
        if (!empty($data->password)) {
            $query = "UPDATE users SET fullname = :fullname, email = :email, password = :password, role = :role, status = :status WHERE id = :id";
            $stmt = $conn->prepare($query);
            $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);
            $stmt->bindParam(":password", $hashed_password);
        } else {
            // ប្រសិនបើមិនប្តូរ Password ទេ
            $query = "UPDATE users SET fullname = :fullname, email = :email, role = :role, status = :status WHERE id = :id";
            $stmt = $conn->prepare($query);
        }

        $stmt->bindParam(":fullname", $data->fullname);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":role", $data->role);
        $stmt->bindParam(":status", $data->status);
        $stmt->bindParam(":id", $data->id);

        if ($stmt->execute()) {
            echo json_encode(array("status" => "success", "message" => "កែប្រែទិន្នន័យបានជោគជ័យ!"));
        } else {
            echo json_encode(array("status" => "error", "message" => "មិនអាចកែប្រែទិន្នន័យបានទេ!"));
        }
    } else {
        echo json_encode(array("status" => "error", "message" => "ទិន្នន័យមិនគ្រប់គ្រាន់!"));
    }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => "Database error: " . $e->getMessage()));
}
?>
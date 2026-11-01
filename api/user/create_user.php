<?php
// --- ១. CORS Headers (កែសម្រួលឱ្យត្រូវនឹង Port 3003 របស់ React) ---
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

    // ទទួល Data ជា JSON ពី React
    $data = json_decode(file_get_contents("php://input"));

    // ពិនិត្យមើល Field សំខាន់ៗចាំបាច់ត្រូវតែមាន
    if (!empty($data->username) && !empty($data->fullname) && !empty($data->password)) {

        // Check ថាមាន Username ហ្នឹងហើយឬនៅ
        $checkQuery = "SELECT id FROM users WHERE username = :username";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->bindParam(":username", $data->username);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            echo json_encode(array("status" => "error", "message" => "Username នេះមានរួចហើយ!"));
            exit();
        }

        // កំណត់តម្លៃ Default ក្រែងលោ phía React មិនបានផ្ញើមកជាមួយ
        $email = isset($data->email) ? $data->email : '';
        $role = isset($data->role) ? $data->role : 'staff';
        $status = isset($data->status) ? $data->status : 'active';

        // Insert User ថ្មី
        $query = "INSERT INTO users (username, fullname, email, password, role, status) VALUES (:username, :fullname, :email, :password, :role, :status)";
        $stmt = $conn->prepare($query);

        // Hash password មុននឹង រក្សាទុក
        $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);

        $stmt->bindParam(":username", $data->username);
        $stmt->bindParam(":fullname", $data->fullname);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":role", $role);
        $stmt->bindParam(":status", $status);

        if ($stmt->execute()) {
            echo json_encode(array("status" => "success", "message" => "បង្កើត User បានជោគជ័យ!"));
        } else {
            echo json_encode(array("status" => "error", "message" => "មិនអាចបង្កើត User បានទេ!"));
        }
    } else {
        echo json_encode(array("status" => "error", "message" => "សូមបំពេញព័ត៌មាន Username, Fullname និង Password ឱ្យបានគ្រប់គ្រាន់!"));
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => "Database error: " . $e->getMessage()));
}

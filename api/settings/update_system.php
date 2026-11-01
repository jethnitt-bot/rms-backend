<?php
// បើកការបង្ហាញ Error សម្រាប់ការ Debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if ($data) {
        try {
            $tax = floatval($data['taxPercentage'] ?? 10);
            $service = floatval($data['serviceCharge'] ?? 5);

            // ករណី database.php ប្រើ PDO
            if (isset($conn) && $conn instanceof PDO) {
                $sql = "UPDATE system_settings SET currency=?, date_format=?, time_format=?, language=?, timezone=?, tax_percentage=?, service_charge=? WHERE id=1";
                $stmt = $conn->prepare($sql);
                $stmt->execute([
                    $data['currency'] ?? 'USD',
                    $data['dateFormat'] ?? 'Y-m-d',
                    $data['timeFormat'] ?? 'H:i',
                    $data['language'] ?? 'en',
                    $data['timezone'] ?? 'Asia/Phnom_Penh',
                    $tax,
                    $service
                ]);
                echo json_encode(["success" => true, "message" => "រក្សាទុក System Settings បានជោគជ័យ!"]);
            } 
            // ករណី database.php ប្រើ MySQLi
            else if (isset($conn) && $conn instanceof mysqli) {
                $stmt = $conn->prepare("UPDATE system_settings SET currency=?, date_format=?, time_format=?, language=?, timezone=?, tax_percentage=?, service_charge=? WHERE id=1");
                $currency = $data['currency'] ?? 'USD';
                $dateFormat = $data['dateFormat'] ?? 'Y-m-d';
                $timeFormat = $data['timeFormat'] ?? 'H:i';
                $language = $data['language'] ?? 'en';
                $timezone = $data['timezone'] ?? 'Asia/Phnom_Penh';

                $stmt->bind_param("sssssdd", $currency, $dateFormat, $timeFormat, $language, $timezone, $tax, $service);
                $stmt->execute();
                echo json_encode(["success" => true, "message" => "រក្សាទុក System Settings បានជោគជ័យ!"]);
            }
            else {
                // ប្រសិនបើប្រើ class Database() ដូចកូដ PDO ដំបូង
                $db = new Database();
                $pdoConn = $db->getConnection();
                
                $sql = "UPDATE system_settings SET currency=?, date_format=?, time_format=?, language=?, timezone=?, tax_percentage=?, service_charge=? WHERE id=1";
                $stmt = $pdoConn->prepare($sql);
                $stmt->execute([
                    $data['currency'] ?? 'USD',
                    $data['dateFormat'] ?? 'Y-m-d',
                    $data['timeFormat'] ?? 'H:i',
                    $data['language'] ?? 'en',
                    $data['timezone'] ?? 'Asia/Phnom_Penh',
                    $tax,
                    $service
                ]);
                echo json_encode(["success" => true, "message" => "រក្សាទុក System Settings បានជោគជ័យ!"]);
            }
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "ពុំមានទិន្នន័យត្រូវបានផ្ញើមកទេ!"]);
    }
} else {
    // បង្ហាញ Message នេះពេលបើកមើលលើ Browser ដោយផ្ទាល់ (GET Request)
    echo json_encode([
        "success" => false,
        "message" => "API នេះទទួលយកតែ POST Request ប៉ុណ្ណោះ!"
    ]);
}
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->contact) && !empty($data->phone)) {
    try {
        $name = $data->name;
        $contact = $data->contact;
        $phone = $data->phone;
        $email = isset($data->email) ? $data->email : '';
        $address = isset($data->address) ? $data->address : '';
        $status = isset($data->status) ? $data->status : 'Active';

        if (!empty($data->id)) {
            // UPDATE
            $id = intval($data->id);
            $query = "UPDATE suppliers SET name = :name, contact = :contact, phone = :phone, email = :email, address = :address, status = :status WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);
        } else {
            // INSERT
            $query = "INSERT INTO suppliers (name, contact, phone, email, address, status) VALUES (:name, :contact, :phone, :email, :address, :status)";
            $stmt = $db->prepare($query);
        }

        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':contact', $contact);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':status', $status);

        if ($stmt->execute()) {
            echo json_encode(array("status" => "success", "message" => "រក្សាទុកបានជោគជ័យ"));
        } else {
            echo json_encode(array("status" => "error", "message" => "មិនអាចរក្សាទុកទិន្នន័យបានទេ"));
        }
    } catch (PDOException $e) {
        echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    }
} else {
    echo json_encode(array("status" => "error", "message" => "សូមបំពេញព័ត៌មានដែលចាំបាច់"));
}
?>
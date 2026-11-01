<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

if (!function_exists('string_clean')) {
    function string_clean(?string $data): string
    {
        if ($data === null) return '';
        return htmlspecialchars(strip_tags(trim($data)));
    }
}

try {
    $database = new Database();
    $conn = $database->getConnection();

    if (!$conn) {
        throw new Exception("មិនអាចភ្ជាប់ទៅកាន់ Database បានទេ");
    }

    $inputRaw = file_get_contents("php://input");
    $data = json_decode($inputRaw);

    if (!$data || !isset($data->order_id) || !isset($data->table_id)) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "ទិន្នន័យមិនគ្រប់គ្រាន់ (ត្រូវមាន order_id និង table_id)"
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $order_id        = intval($data->order_id);
    $table_id        = intval($data->table_id);
    $payment_method  = isset($data->payment_method) ? string_clean((string)$data->payment_method) : 'cash';
    $total_amount    = isset($data->total_amount) ? floatval($data->total_amount) : 0.00;
    $subtotal        = isset($data->subtotal) ? floatval($data->subtotal) : $total_amount;
    $tax             = isset($data->tax) ? floatval($data->tax) : 0.00;
    $service_charge  = isset($data->service_charge) ? floatval($data->service_charge) : 0.00;
    $discount        = isset($data->discount) ? floatval($data->discount) : 0.00;
    $amount_received = isset($data->amount_received) ? floatval($data->amount_received) : $total_amount;
    $change_amount   = isset($data->change_amount) ? floatval($data->change_amount) : 0.00;
    $note            = isset($data->note) ? string_clean((string)$data->note) : '';

    $conn->beginTransaction();

    // 🟢 1. Update ព័ត៌មានទូទាត់ និងប្តូរ status ទៅជា 'completed' ដើម្បីឱ្យវាលុបចេញពី Active Orders
    $updateOrderQuery = "UPDATE orders 
                         SET status = 'completed',
                             payment_method = :payment_method, 
                             subtotal = :subtotal,
                             tax = :tax,
                             service_charge = :service_charge,
                             discount = :discount,
                             total_amount = :total_amount, 
                             amount_received = :amount_received,
                             change_amount = :change_amount,
                             note = :note,
                             paid_at = NOW() 
                         WHERE id = :order_id";

    $stmtOrder = $conn->prepare($updateOrderQuery);
    $stmtOrder->execute([
        ':payment_method'  => $payment_method,
        ':subtotal'        => $subtotal,
        ':tax'             => $tax,
        ':service_charge'  => $service_charge,
        ':discount'        => $discount,
        ':total_amount'    => $total_amount,
        ':amount_received' => $amount_received,
        ':change_amount'   => $change_amount,
        ':note'            => $note,
        ':order_id'        => $order_id
    ]);

    // 🟢 2. Update status តុក្នុង dining_tables ឱ្យទៅជា 'available' វិញ
    $updateTableQuery = "UPDATE dining_tables SET status = 'available' WHERE id = :table_id";
    $stmtTable = $conn->prepare($updateTableQuery);
    $stmtTable->execute([':table_id' => $table_id]);

    $conn->commit();

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "ការទូទាត់ជោគជ័យ និងបានដោះលែងតុរួចរាល់!"
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Server Error: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
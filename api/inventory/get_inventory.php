<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php'; // សម្រួល path តាម Folder structure ជាក់ស្តែងរបស់អ្នក

$database = new Database();
$db = $database->getConnection();

// 1. Get Ingredients
$queryIngredients = "SELECT * FROM inventory_ingredients ORDER BY id ASC";
$stmt1 = $db->prepare($queryIngredients);
$stmt1->execute();
$ingredients = $stmt1->fetchAll(PDO::FETCH_ASSOC);

// Formatted Ingredients
$formattedIngredients = array_map(function($item) {
    return [
        'id' => (int)$item['id'],
        'name' => $item['name'],
        'unit' => $item['unit'],
        'qty' => (float)$item['qty'],
        'price' => (float)$item['price'],
        'supplier' => $item['supplier'],
        'status' => $item['status'],
        'image' => $item['image']
    ];
}, $ingredients);

// 2. Get Requests
$queryRequests = "SELECT * FROM inventory_requests ORDER BY id DESC";
$stmt2 = $db->prepare($queryRequests);
$stmt2->execute();
$requests = $stmt2->fetchAll(PDO::FETCH_ASSOC);

$formattedRequests = array_map(function($req) {
    return [
        'id' => $req['request_code'],
        'db_id' => (int)$req['id'],
        'item' => $req['item'],
        'qty' => (float)$req['qty'],
        'unit' => $req['unit'],
        'price' => (float)$req['price'],
        'supplier' => $req['supplier'],
        'requestedBy' => $req['requested_by'],
        'date' => date('d M Y', strtotime($req['request_date'])),
        'status' => $req['status'],
        'note' => $req['note']
    ];
}, $requests);

echo json_encode([
    'status' => 'success',
    'ingredients' => $formattedIngredients,
    'requests' => $formattedRequests
]);
?>
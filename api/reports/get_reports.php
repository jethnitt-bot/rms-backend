<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// 1. Fetch Orders
$queryOrders = "SELECT * FROM orders ORDER BY created_at DESC";
$stmtOrders = $db->prepare($queryOrders);
$stmtOrders->execute();
$orders = $stmtOrders->fetchAll(PDO::FETCH_ASSOC);

// 2. Fetch Recent Transactions
$queryBills = "SELECT o.id as no, o.created_at as date, t.table_number as table_name, o.total_amount as amount, o.payment_method as pay, o.status 
               FROM orders o 
               LEFT JOIN dining_tables t ON o.table_id = t.id 
               ORDER BY o.created_at DESC LIMIT 10";
$stmtBills = $db->prepare($queryBills);
$stmtBills->execute();
$billsList = $stmtBills->fetchAll(PDO::FETCH_ASSOC);

$bills = array_map(function($b) {
    return [
        'no' => $b['no'],
        'date' => date('Y-m-d H:i', strtotime($b['date'])),
        'table' => $b['table_name'] ?? 'N/A',
        'amount' => (float)$b['amount'],
        'pay' => $b['pay'] ?? 'Cash',
        'status' => $b['status'] ?? 'Completed'
    ];
}, $billsList);

// 3. Fetch Top Selling Items (ដក m.image_url ចេញ ឬជំនួសដោយ m.image ប្រសិនបើមាន)
$queryTop = "SELECT m.name, c.name as category, SUM(oi.quantity) as qty, SUM(oi.quantity * oi.price) as revenue, '' as img 
             FROM order_items oi 
             JOIN menu_items m ON oi.menu_item_id = m.id 
             LEFT JOIN categories c ON m.category_id = c.id 
             GROUP BY oi.menu_item_id 
             ORDER BY qty DESC LIMIT 5";
$stmtTop = $db->prepare($queryTop);
$stmtTop->execute();
$topSelling = $stmtTop->fetchAll(PDO::FETCH_ASSOC);

// 4. Sales Overview (By Date)
$querySales = "SELECT DATE_FORMAT(created_at, '%d %b') as label, SUM(total_amount) as revenue, COUNT(id) as orderCounts 
               FROM orders GROUP BY DATE(created_at) ORDER BY created_at ASC LIMIT 7";
$stmtSales = $db->prepare($querySales);
$stmtSales->execute();
$salesData = $stmtSales->fetchAll(PDO::FETCH_ASSOC);

$labels = array_column($salesData, 'label');
$revenue = array_map('floatval', array_column($salesData, 'revenue'));
$orderCounts = array_map('intval', array_column($salesData, 'orderCounts'));

// 5. Sales by Payment Method
$queryPay = "SELECT payment_method as name, SUM(total_amount) as amt FROM orders GROUP BY payment_method";
$stmtPay = $db->prepare($queryPay);
$stmtPay->execute();
$paymentMethods = $stmtPay->fetchAll(PDO::FETCH_ASSOC);

// 6. Sales by Category
$queryCat = "SELECT c.name, SUM(oi.quantity * oi.price) as amt 
             FROM order_items oi 
             JOIN menu_items m ON oi.menu_item_id = m.id 
             JOIN categories c ON m.category_id = c.id 
             GROUP BY c.id";
$stmtCat = $db->prepare($queryCat);
$stmtCat->execute();
$categorySales = $stmtCat->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'status' => 'success',
    'orders' => $orders,
    'bills' => $bills,
    'topSelling' => $topSelling,
    'salesOverview' => [
        'labels' => $labels,
        'revenue' => $revenue,
        'orderCounts' => $orderCounts
    ],
    'paymentMethods' => $paymentMethods,
    'categorySales' => $categorySales
]);
?>
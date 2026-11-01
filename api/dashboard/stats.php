<?php
// ==============================================================
// GET /api/dashboard/stats.php
// ត្រឡប់លេខសម្រាប់ Stat Cards ទាំង 6 នៅលើ Dashboard
// ==============================================================

require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $totalMenuItems = (int) $db->query("SELECT COUNT(*) FROM menu_items")->fetchColumn();
    $totalCategories = (int) $db->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    $totalCustomers = (int) $db->query("SELECT COUNT(*) FROM customers")->fetchColumn();

    $todaysOrders = (int) $db->query(
        "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()"
    )->fetchColumn();

    $todaysReservations = (int) $db->query(
        "SELECT COUNT(*) FROM reservations WHERE reservation_date = CURDATE()"
    )->fetchColumn();

    $availableTables = (int) $db->query(
        "SELECT COUNT(*) FROM dining_tables WHERE status = 'available'"
    )->fetchColumn();

    sendJson([
        'totalMenuItems' => $totalMenuItems,
        'totalCategories' => $totalCategories,
        'totalCustomers' => $totalCustomers,
        'todaysOrders' => $todaysOrders,
        'todaysReservations' => $todaysReservations,
        'availableTables' => $availableTables
    ]);
} catch (PDOException $e) {
    sendJson(['error' => $e->getMessage()], 500);
}

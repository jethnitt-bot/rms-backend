<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // ១. ទិន្នន័យថ្ងៃនេះ (Today) - បែងចែកតាមម៉ោង (ឧទាហរណ៍: ផ្អែកលើตาราง orders ដែលមាន created_at និង total_amount)
    $todayQuery = "SELECT DATE_FORMAT(created_at, '%H:00') as label, SUM(total_amount) as value 
                   FROM orders 
                   WHERE DATE(created_at) = CURDATE() 
                   GROUP BY HOUR(created_at) 
                   ORDER BY HOUR(created_at) ASC";
    $stmt = $conn->prepare($todayQuery);
    $stmt->execute();
    $todayData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // បើគ្មានទិន្នន័យថ្ងៃនេះ អាចទុករបស់ទទេ ឬបង្ហាញ Array ដើម
    if (empty($todayData)) {
        $todayData = [];
    }

    // ២. ទិន្នន័យខែនេះ (This Month) - បែងចែកតាមសប្តាហ៍
    $monthQuery = "SELECT 
                    CONCAT('Week ', FLOOR((DAY(created_at) - 1) / 7) + 1) as label, 
                    SUM(total_amount) as value 
                   FROM orders 
                   WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) 
                   GROUP BY FLOOR((DAY(created_at) - 1) / 7) 
                   ORDER BY created_at ASC";
    $stmt = $conn->prepare($monthQuery);
    $stmt->execute();
    $monthData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($monthData)) {
        $monthData = [];
    }

    // ៣. ទិន្នន័យឆ្នាំនេះ (This Year) - បែងចែកតាមខែ
    $yearQuery = "SELECT DATE_FORMAT(created_at, '%b') as label, SUM(total_amount) as value 
                  FROM orders 
                  WHERE YEAR(created_at) = YEAR(CURDATE()) 
                  GROUP BY MONTH(created_at) 
                  ORDER BY MONTH(created_at) ASC";
    $stmt = $conn->prepare($yearQuery);
    $stmt->execute();
    $yearData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($yearData)) {
        $yearData = [];
    }

    // បញ្ជូនទិន្នន័យជា JSON ត្រឡប់ទៅ Frontend វិញ
    echo json_encode([
        "today" => $todayData,
        "month" => $monthData,
        "year" => $yearData
    ]);

} catch (Exception $e) {
    echo json_encode([
        "today" => [],
        "month" => [],
        "year" => []
    ]);
}
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

try {
    // ត្រៀមទិន្នន័យตัวอย่างសម្រាប់បង្ហាញលើ Chart (Monthly និង Weekly)
    // អ្នកអាចប្តូរយកទិន្នន័យពិតចេញពី Database របស់អ្នកតាមក្រោយ
    $monthly = [
        [ "label" => "Jan", "value" => 45 ],
        [ "label" => "Feb", "value" => 52 ],
        [ "label" => "Mar", "value" => 38 ],
        [ "label" => "Apr", "value" => 65 ],
        [ "label" => "May", "value" => 80 ],
        [ "label" => "Jun", "value" => 95 ]
    ];

    $weekly = [
        [ "label" => "Sun", "value" => 12 ],
        [ "label" => "Mon", "value" => 18 ],
        [ "label" => "Tue", "value" => 25 ],
        [ "label" => "Wed", "value" => 30 ],
        [ "label" => "Thu", "value" => 22 ],
        [ "label" => "Fri", "value" => 35 ],
        [ "label" => "Sat", "value" => 40 ]
    ];

    echo json_encode([
        "monthly" => $monthly,
        "weekly" => $weekly
    ]);

} catch (Exception $e) {
    echo json_encode([
        "monthly" => [],
        "weekly" => []
    ]);
}
?>
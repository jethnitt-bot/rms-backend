<?php
// ==============================================================
// បញ្ចូលឯកសារនេះនៅដើមគ្រប់ api/*.php ទាំងអស់
// គ្រប់គ្រង CORS (ឱ្យ React frontend ហៅមកបាន) + JSON response helper
// ==============================================================

// TODO (production): ប្តូរ '*' ទៅជា URL ពិតប្រាកដរបស់ frontend
// ឧទាហរណ៍៖ header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

// Browser ខ្លះផ្ញើ OPTIONS request មុន (preflight) — ត្រូវឆ្លើយតបទទេ
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * ផ្ញើ JSON response ត្រឡប់ទៅ React ហើយបញ្ឈប់ script
 */
function sendJson($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

<?php
// ==============================================================
// GET  /api/categories/categories.php          -> list categories
// POST /api/categories/categories.php           -> create/update category
//      form-data fields: name (required), image (file, optional), id (optional -> update)
// ==============================================================

require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// -------------------- GET: list all categories --------------------
if ($method === 'GET') {
    try {
        $stmt = $db->query("SELECT id, name, image, created_at FROM categories ORDER BY id DESC");
        sendJson($stmt->fetchAll());
    } catch (PDOException $e) {
        sendJson(['error' => $e->getMessage()], 500);
    }
}

// -------------------- POST: create or update --------------------
if ($method === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $id = (!empty($_POST['id'])) ? (int) $_POST['id'] : null;

    if ($name === '') {
        sendJson(['message' => 'ត្រូវការឈ្មោះ Category (name is required).'], 400);
    }

    $imagePath = null; // នៅតែ null បើមិនមាន file ថ្មី upload មក

    // ---- ដំណើរការ Upload File (បើមាន) ----
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 2 * 1024 * 1024; // 2MB

        $fileType = mime_content_type($_FILES['image']['tmp_name']);
        $fileSize = $_FILES['image']['size'];

        if (!in_array($fileType, $allowedTypes)) {
            sendJson(['message' => 'ប្រភេទរូបភាពមិនត្រឹមត្រូវ (JPG, PNG, GIF, WEBP ប៉ុណ្ណោះ).'], 400);
        }
        if ($fileSize > $maxSize) {
            sendJson(['message' => 'ទំហំរូបភាពធំពេក (អតិបរមា 2MB).'], 400);
        }

        // uploads/categories/ ស្ថិតនៅកម្រិត root នៃ rms_backend
        $uploadDir = __DIR__ . '/../../uploads/categories/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $filename = uniqid('cat_', true) . '.' . $ext;
        $destination = $uploadDir . $filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $destination)) {
            $imagePath = 'uploads/categories/' . $filename; // path ដែលរក្សាទុកក្នុង DB
        } else {
            sendJson(['message' => 'Upload រូបភាពមិនជោគជ័យ (សូមពិនិត្យ folder permissions).'], 500);
        }
    }

    try {
        if ($id) {
            // ---- UPDATE ----
            if ($imagePath) {
                // លុប file រូបភាពចាស់ចោល (បើមាន) ដើម្បីកុំឱ្យ folder ពេញ file ចាស់
                $old = $db->prepare("SELECT image FROM categories WHERE id = :id");
                $old->execute([':id' => $id]);
                $oldImage = $old->fetchColumn();

                $stmt = $db->prepare("UPDATE categories SET name = :name, image = :image WHERE id = :id");
                $stmt->execute([':name' => $name, ':image' => $imagePath, ':id' => $id]);

                if ($oldImage && file_exists(__DIR__ . '/../../' . $oldImage)) {
                    unlink(__DIR__ . '/../../' . $oldImage);
                }
            } else {
                // Edit ដោយមិនប្តូររូបភាព (រក្សា image ចាស់)
                $stmt = $db->prepare("UPDATE categories SET name = :name WHERE id = :id");
                $stmt->execute([':name' => $name, ':id' => $id]);
            }
            sendJson(['message' => 'Category ត្រូវបានកែប្រែជោគជ័យ!']);
        } else {
            // ---- CREATE ----
            $stmt = $db->prepare("INSERT INTO categories (name, image) VALUES (:name, :image)");
            $stmt->execute([':name' => $name, ':image' => $imagePath]);
            sendJson(['message' => 'Category ត្រូវបានបង្កើតជោគជ័យ!']);
        }
    } catch (PDOException $e) {
        sendJson(['error' => $e->getMessage()], 500);
    }
}

sendJson(['message' => 'Method not allowed'], 405);

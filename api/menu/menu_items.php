<?php
// ==============================================================
// CORS Headers (អនុញ្ញាតឱ្យ React fetch ទិន្នន័យបាន)
// ==============================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ==============================================================
// GET    /api/menu/menu_items.php          -> list menu items
// POST   /api/menu/menu_items.php          -> create/update menu item
// DELETE /api/menu/menu_items.php?id=5      -> delete a menu item
// ==============================================================

require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// -------------------- GET: list all menu items --------------------
if ($method === 'GET') {
    try {
        $sql = "
            SELECT 
                mi.id,
                mi.category_id,
                c.name AS category_name,
                mi.name,
                mi.price,
                mi.image,
                mi.is_available,
                mi.created_at
            FROM menu_items mi
            LEFT JOIN categories c ON c.id = mi.category_id
            ORDER BY mi.id DESC
        ";
        $rows = $db->query($sql)->fetchAll();

        // ប្តូរ shape ឱ្យស្រួលប្រើនៅ React
        $items = array_map(function ($row) {
            return [
                'id' => (int) $row['id'],
                'category_id' => $row['category_id'] ? (int) $row['category_id'] : null,
                'category' => $row['category_name'] ?? 'Uncategorized',
                'name' => $row['name'],
                'price' => (float) $row['price'],
                'image' => $row['image'],
                'is_available' => (int) $row['is_available'],
                'status' => ((int) $row['is_available'] === 1) ? 'Available' : 'Unavailable',
                'created_at' => $row['created_at']
            ];
        }, $rows);

        sendJson($items);
    } catch (PDOException $e) {
        sendJson(['error' => $e->getMessage()], 500);
    }
}

// -------------------- POST: create or update --------------------
if ($method === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $categoryId = (!empty($_POST['category_id'])) ? (int) $_POST['category_id'] : null;
    $price = isset($_POST['price']) ? (float) $_POST['price'] : 0;
    $status = $_POST['status'] ?? $_POST['is_available'] ?? '1';
    
    // បង្កើតការឆែក Status ទាំងជា Text ('Available') ឬជា លេខ ('1'/1)
    $isAvailable = ($status === 'Available' || $status === '1' || $status === 1) ? 1 : 0;
    $id = (!empty($_POST['id'])) ? (int) $_POST['id'] : null;

    if ($name === '') {
        sendJson(['message' => 'ត្រូវការឈ្មោះ Menu (name is required).'], 400);
    }
    if (!$categoryId) {
        sendJson(['message' => 'ត្រូវជ្រើសរើស Category.'], 400);
    }

    $imagePath = null;

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

        $uploadDir = __DIR__ . '/../../uploads/menu/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $filename = uniqid('menu_', true) . '.' . $ext;
        $destination = $uploadDir . $filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $destination)) {
            $imagePath = 'uploads/menu/' . $filename;
        } else {
            sendJson(['message' => 'Upload រូបភាពមិនជោគជ័យ.'], 500);
        }
    }

    try {
        if ($id) {
            // ---- UPDATE ----
            if ($imagePath) {
                $old = $db->prepare("SELECT image FROM menu_items WHERE id = :id");
                $old->execute([':id' => $id]);
                $oldImage = $old->fetchColumn();

                $stmt = $db->prepare("
                    UPDATE menu_items 
                    SET name = :name, category_id = :category_id, price = :price, image = :image, is_available = :is_available 
                    WHERE id = :id
                ");
                $stmt->execute([
                    ':name' => $name,
                    ':category_id' => $categoryId,
                    ':price' => $price,
                    ':image' => $imagePath,
                    ':is_available' => $isAvailable,
                    ':id' => $id
                ]);

                if ($oldImage && file_exists(__DIR__ . '/../../' . $oldImage)) {
                    unlink(__DIR__ . '/../../' . $oldImage);
                }
            } else {
                $stmt = $db->prepare("
                    UPDATE menu_items 
                    SET name = :name, category_id = :category_id, price = :price, is_available = :is_available 
                    WHERE id = :id
                ");
                $stmt->execute([
                    ':name' => $name,
                    ':category_id' => $categoryId,
                    ':price' => $price,
                    ':is_available' => $isAvailable,
                    ':id' => $id
                ]);
            }
            sendJson(['message' => 'Menu ត្រូវបានកែប្រែជោគជ័យ!']);
        } else {
            // ---- CREATE ----
            $stmt = $db->prepare("
                INSERT INTO menu_items (name, category_id, price, image, is_available) 
                VALUES (:name, :category_id, :price, :image, :is_available)
            ");
            $stmt->execute([
                ':name' => $name,
                ':category_id' => $categoryId,
                ':price' => $price,
                ':image' => $imagePath,
                ':is_available' => $isAvailable
            ]);
            sendJson(['message' => 'Menu ត្រូវបានបង្កើតជោគជ័យ!']);
        }
    } catch (PDOException $e) {
        sendJson(['error' => $e->getMessage()], 500);
    }
}

// -------------------- DELETE: remove a menu item --------------------
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : null;

    if (!$id) {
        sendJson(['message' => 'ត្រូវការ id ដើម្បីលុប.'], 400);
    }

    try {
        $old = $db->prepare("SELECT image FROM menu_items WHERE id = :id");
        $old->execute([':id' => $id]);
        $oldImage = $old->fetchColumn();

        $stmt = $db->prepare("DELETE FROM menu_items WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($oldImage && file_exists(__DIR__ . '/../../' . $oldImage)) {
            unlink(__DIR__ . '/../../' . $oldImage);
        }

        sendJson(['message' => 'Menu ត្រូវបានលុបជោគជ័យ!']);
    } catch (PDOException $e) {
        sendJson(['error' => $e->getMessage()], 500);
    }
}

sendJson(['message' => 'Method not allowed'], 405);
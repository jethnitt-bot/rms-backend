<?php
// ==============================================================
// Database connection (PDO) - TiDB Cloud
// ==============================================================

class Database
{
    private $host = 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com';
    private $port = '4000';
    private $db_name = 'rms_db';
    private $username = 'T4zopEKeeRkvh3n.root';
    private $password = '71aXhe3InIIIktFj';
    public $conn;

    public function getConnection()
    {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }

        return $this->conn;
    }
}
?>
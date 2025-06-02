<?php
// Database connection handler for Paper Stock Management System
// Supports both SQLite and MySQL configurations using PDO

class Database {
    private $pdo;
    private $db_type;

    public function __construct() {
        $this->connect();
    }

    private function connect() {
        // Check if config file exists
        if (!file_exists(__DIR__ . '/../config.php')) {
            throw new Exception('Database configuration not found. Please run install.php');
        }

        // Include configuration
        require_once __DIR__ . '/../config.php';

        // The config.php file is expected to set a $pdo variable
        // which is a PDO instance.

        if (!isset($pdo) || !($pdo instanceof PDO)) {
             throw new Exception('Invalid database configuration: PDO connection not found in config.php');
        }

        $this->pdo = $pdo;

        // Determine database type (optional, but useful if logic depends on it)
        $driver = $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'sqlite') {
            $this->db_type = 'sqlite';
        } elseif ($driver === 'mysql') {
            $this->db_type = 'mysql';
        } else {
            // Handle other potential drivers if necessary, or default
            $this->db_type = $driver; // Or 'unknown'
        }

        // Set error mode to exceptions for easier debugging
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        // Set default fetch mode to associative arrays
        $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    }

    public function getPDO() {
        return $this->pdo;
    }

    public function getType() {
        return $this->db_type;
    }

    // Prepare a statement
    public function prepare($query) {
        return $this->pdo->prepare($query);
    }

    // Execute a simple query (use prepare/execute for parameterized queries)
    public function query($query) {
        return $this->pdo->query($query);
    }

    // Execute a prepared statement with parameters
    public function execute($query, $params = []) {
        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        return $stmt; // Return the statement object for fetching results
    }

    // Fetch all results from a statement
    public function fetchAll($stmt) {
        if (!($stmt instanceof PDOStatement)) {
             throw new Exception('Invalid argument: Expected PDOStatement');
        }
        return $stmt->fetchAll();
    }

    // Fetch single result from a statement
    public function fetchOne($stmt) {
         if (!($stmt instanceof PDOStatement)) {
             throw new Exception('Invalid argument: Expected PDOStatement');
        }
        return $stmt->fetch();
    }

    // Get the ID of the last inserted row
    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }

    // PDO handles escaping automatically with prepared statements,
    // but providing an escape method for consistency if needed for non-prepared queries (use with caution)
    public function escape($string) {
         // Note: Using prepared statements is the recommended way to prevent SQL injection.
         // This method is less safe and should be avoided if possible.
         // A simple casting or validation might be more appropriate depending on context.
         // For basic string escaping outside of prepared statements (rarely needed with PDO),
         // you might use quote, but it adds quotes which might not be desired.
         // A safer approach is to just rely on prepared statements.
         // For demonstration, returning the string as is, emphasizing prepared statements.
         error_log("Warning: Using Database::escape() is not recommended. Use prepared statements.");
         return $string; // Rely on prepared statements for safety
    }

    // Close connection (PDO connections are persistent by default, close is often not needed)
    public function close() {
        // PDO connections are typically persistent and managed by PHP.
        // Setting the internal PDO instance to null can help, but isn't a true "close" like mysqli.
        $this->pdo = null;
    }
}
?>

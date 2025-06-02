<?php
// Database connection handler for Paper Stock Management System
// Supports both SQLite and MySQL configurations

class Database {
    private $connection;
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
        
        // Detect database type and set connection
        // Detect database type and set connection
        // Check for PDO connection from config.php
        if (isset($pdo) && $pdo instanceof PDO) {
            $this->db_type = 'mysql_pdo'; // Using a new type to distinguish PDO
            $this->connection = $pdo;
        } elseif (isset($connection) && $connection instanceof SQLite3) {
            $this->db_type = 'sqlite';
            $this->connection = $connection;
        } elseif (isset($connection) && is_resource($connection)) {
            // This case is for mysqli procedural style, which config.php doesn't currently use
            $this->db_type = 'mysql_mysqli';
            $this->connection = $connection;
        } else {
            throw new Exception('Invalid database configuration or connection type not supported by db.php');
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function getType() {
        return $this->db_type;
    }
    
    // PDO uses prepare and query methods directly on the connection object
    public function prepare($query) {
        return $this->connection->prepare($query);
    }
    
    public function query($query) {
        return $this->connection->query($query);
    }
    
    public function lastInsertId() {
        // PDO method for last insert ID
        return $this->connection->lastInsertId();
    }
    
    public function escape($string) {
        // PDO uses prepared statements, escaping is generally not needed for values
        // For identifiers, you might need quoting, but direct escaping is not a standard PDO method
        // This method might need rethinking depending on usage, but for now, return the string
        // or throw an error if used incorrectly with PDO.
        // For now, let's assume it's used for identifiers or cases where PDO doesn't handle it.
        // A better approach for identifiers is quoting: $this->connection->quote($string)
        // However, the original mysqli_real_escape_string is for values in non-prepared statements.
        // Given the context, this method might be vestigial if only prepared statements are used.
        // If needed for identifiers, use quote. If for values, use prepared statements.
        // Let's add a basic check or warning if used with PDO for values.
        error_log("Warning: Database::escape() called with PDO connection. Use prepared statements for values.");
        return $string; // Or throw an exception
    }
    
    public function close() {
        // With PDO, closing is often not explicitly needed as the connection is closed when the object is unset
        // or goes out of scope. Setting the connection to null can explicitly close it.
        $this->connection = null;
    }
    
    // Execute query with parameters (universal method)
    public function execute($query, $params = []) {
        try {
            if ($this->db_type === 'sqlite') {
                $stmt = $this->connection->prepare($query);
                if (!$stmt) {
                    throw new Exception('Failed to prepare statement: ' . $this->connection->lastErrorMsg());
                }
                
                foreach ($params as $index => $value) {
                    $stmt->bindValue($index + 1, $value);
                }
                
                $result = $stmt->execute();
                if (!$result) {
                    throw new Exception('Failed to execute statement: ' . $this->connection->lastErrorMsg());
                }
                
                return $result;
            } elseif ($this->db_type === 'mysql_pdo') {
                $stmt = $this->connection->prepare($query);
                if (!$stmt) {
                    // PDO prepare errors throw exceptions by default with ERRMODE_EXCEPTION
                    // This block might be redundant if ERRMODE_EXCEPTION is set, but kept for safety
                    throw new Exception('Failed to prepare statement (PDO)');
                }
                
                // PDO bindValue uses 1-based indexing for positional parameters
                // or parameter names for named parameters. Assuming positional here.
                foreach ($params as $index => $value) {
                    // PDO bindValue requires explicit type, but can often infer.
                    // For simplicity, let PDO infer or use default string type.
                    // For more robustness, determine type and use bindValue(index+1, value, PDO::PARAM_*)
                    $stmt->bindValue($index + 1, $value);
                }
                
                if (!$stmt->execute()) {
                    // PDO execute errors throw exceptions by default with ERRMODE_EXCEPTION
                    // This block might be redundant if ERRMODE_EXCEPTION is set, but kept for safety
                    throw new Exception('Failed to execute statement (PDO)');
                }
                
                // For SELECT queries, execute returns true/false. To get results, you fetch from the statement.
                // This method should return the statement object for fetching results.
                return $stmt; // Return the statement object
            } else { // mysql_mysqli case (if ever used)
                 $stmt = mysqli_prepare($this->connection, $query);
                if (!$stmt) {
                    throw new Exception('Failed to prepare statement: ' . mysqli_error($this->connection));
                }
                
                if (!empty($params)) {
                    $types = '';
                    foreach ($params as $param) {
                        if (is_int($param)) {
                            $types .= 'i';
                        } elseif (is_float($param)) {
                            $types .= 'd';
                        } else {
                            $types .= 's';
                        }
                    }
                    mysqli_stmt_bind_param($stmt, $types, ...$params);
                }
                
                if (!mysqli_stmt_execute($stmt)) {
                    throw new Exception('Failed to execute statement: ' . mysqli_stmt_error($stmt));
                }
                
                return mysqli_stmt_get_result($stmt);
            }
        } catch (Exception $e) {
            error_log("Database error: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Fetch all results as associative array
    public function fetchAll($result) {
        // $result is now a statement object for PDO
        if ($this->db_type === 'sqlite') {
            $rows = [];
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $rows[] = $row;
            }
            return $rows;
        } elseif ($this->db_type === 'mysql_pdo') {
            // PDO fetchAll method
            return $result->fetchAll(PDO::FETCH_ASSOC);
        } else { // mysql_mysqli case
            $rows = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $rows[] = $row;
            }
            return $rows;
        }
    }
    
    // Fetch single result as associative array
    public function fetchOne($result) {
        // $result is now a statement object for PDO
        if ($this->db_type === 'sqlite') {
            return $result->fetchArray(SQLITE3_ASSOC);
        } elseif ($this->db_type === 'mysql_pdo') {
            // PDO fetch method
            return $result->fetch(PDO::FETCH_ASSOC);
        } else { // mysql_mysqli case
            return mysqli_fetch_assoc($result);
        }
    }
}
?>

<?php
// MySQL database configuration - PDO connection
$host = 'localhost';           // Change this to your MySQL server IP
$dbname = 'bappa';       // Change this to your database name
$username = 'root';            // Change this to your MySQL username
$password = 'root';                // Change this to your MySQL password

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (\PDOException $e) {
    // Log the error or handle it appropriately
    error_log("Database connection failed: " . $e->getMessage());
    // Depending on your application, you might want to show a user-friendly error page
    die("Database connection failed: " . $e->getMessage());
}

// Note: Table creation logic might need to be moved elsewhere if using PDO consistently
// The create_table logic from the mysqli version is removed here.
// You might run setup_database.sql separately or implement PDO-based table creation.

?>
    status VARCHAR(50) DEFAULT 'Stock',
    originalroll VARCHAR(100),
    date_added DATETIME DEFAULT CURRENT_TIMESTAMP
)";

mysqli_query($connection, $create_table);
?>
<?php
// Database configuration - PDO connection for MySQL

// Option 2: MySQL
$host = 'sql101.infinityfree.com';
$username = 'if0_39085666';
$password = 'OR2McjtktWJg';
$database = 'if0_39085666_shreelabelpaperstock';

$dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (\PDOException $e) {
    // Log the error instead of displaying it directly in a production environment
    error_log("Database connection failed: " . $e->getMessage());
    // Display a generic error message to the user
    die("Database connection failed. Please check your configuration.");
}

?>

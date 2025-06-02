<?php
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
header('Content-Type: application/json');

try {
    // MySQL database connection
    require_once 'config.php';

    // Use the PDO connection object provided by config.php
    // The $pdo variable is set in config.php

    // Prepare and execute the SQL query using PDO
    $stmt = $pdo->prepare("SELECT * FROM rolls ORDER BY (rollnumber = '123456') DESC, id DESC");
    $stmt->execute();

    // Fetch all results as an associative array
    $rolls = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($rolls);
} catch(\PDOException $e) { // Catch PDOException specifically
    // Display the specific PDO error message
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch(Exception $e) { // Catch other exceptions
    echo json_encode(['error' => 'An unexpected error occurred: ' . $e->getMessage()]);
}
?>

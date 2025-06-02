<?php
require_once 'config.php';

header('Content-Type: application/json'); // Use JSON for API response

// Check if required POST parameters are set
if (!isset($_POST['rollNumber']) || !isset($_POST['newStatus'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters (rollNumber or newStatus).']);
    exit;
}

$rollNumber = $_POST['rollNumber'];
$newStatus = $_POST['newStatus'];

// Basic validation (you might want more robust validation)
if (empty($rollNumber) || empty($newStatus)) {
    echo json_encode(['success' => false, 'message' => 'Parameters cannot be empty.']);
    exit;
}

try {
    // Check if roll exists (optional, but good practice)
    $stmt = $pdo->prepare("SELECT rollnumber FROM rolls WHERE rollnumber = ?");
    $stmt->execute([$rollNumber]);
    $roll = $stmt->fetch();

    if (!$roll) {
        echo json_encode(['success' => false, 'message' => "Roll number {$rollNumber} not found."]);
        exit;
    }

    // Update roll status
    $stmt = $pdo->prepare("UPDATE rolls SET status = ? WHERE rollnumber = ?");
    $result = $stmt->execute([$newStatus, $rollNumber]);

    if ($result) {
        echo json_encode(['success' => true, 'message' => "Successfully updated status for roll {$rollNumber} to '{$newStatus}'."]);
    } else {
        // Check for PDO errors if execute failed
        $errorInfo = $stmt->errorInfo();
        echo json_encode(['success' => false, 'message' => "Failed to update status for roll {$rollNumber}. Database error: " . $errorInfo[2]]);
    }

} catch (PDOException $e) {
    // Catch PDO exceptions specifically for database errors
    error_log("Update roll status PDO error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    // Catch any other exceptions
    error_log("Update roll status general error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => "An unexpected error occurred: " . $e->getMessage()]);
}
?>

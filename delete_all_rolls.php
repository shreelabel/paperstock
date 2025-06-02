<?php
// Disable error display to ensure clean JSON output
ini_set('display_errors', 0);
error_reporting(0);

include 'db.php'; // Includes config.php and initializes $pdo
include 'check_admin.php'; // Checks if user is admin and redirects if not

header('Content-Type: application/json');

// check_admin.php should handle the redirection if not admin,
// but we'll add an extra check here for clarity and safety in the JSON response context.
if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access. Admin privileges required.']);
    exit;
}

try {
    // Prepare and execute the DELETE query
    $stmt = $pdo->prepare("DELETE FROM rolls");
    $stmt->execute();

    // Check if any rows were affected (optional, but good practice)
    $deleted_count = $stmt->rowCount();

    echo json_encode(['success' => true, 'message' => "Successfully deleted {$deleted_count} rolls."]);

} catch (\PDOException $e) {
    // Log the error and return a generic error message
    error_log("Error deleting all rolls: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: Could not delete rolls.']);
}

?>

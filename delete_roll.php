<?php
header('Content-Type: application/json');
require_once 'config.php';

// Handle both web requests and CLI execution
$request_method = $_SERVER['REQUEST_METHOD'] ?? 'POST';
if ($request_method !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['rollNumber'])) {
    echo json_encode(['success' => false, 'message' => 'Roll number is required']);
    exit;
}

try {
    // Start transaction using PDO
    $pdo->beginTransaction();
    
    // Get the roll to be deleted using PDO
    $stmt = $pdo->prepare("SELECT * FROM rolls WHERE rollnumber = ?");
    $stmt->execute([$input['rollNumber']]);
    $roll = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$roll) {
        echo json_encode(['success' => false, 'message' => 'Roll not found']);
        exit;
    }

    // Prevent deletion of the default roll
    if ($roll['rollnumber'] === '123456') {
        echo json_encode(['success' => false, 'message' => 'This default roll cannot be deleted.']);
        exit;
    }

    // If this is a main roll, delete all related child rolls using PDO
    if ($roll['rolltype'] === 'Main Roll') {
        $stmt = $pdo->prepare("DELETE FROM rolls WHERE mainrollnumber = ?");
        $stmt->execute([$roll['rollnumber']]);
    } else {
        // If this is a child roll, just delete this specific roll using PDO
        $stmt = $pdo->prepare("DELETE FROM rolls WHERE rollnumber = ?");
        $stmt->execute([$input['rollNumber']]);
    }
    
    $pdo->commit(); // Commit transaction using PDO
    echo json_encode(['success' => true, 'message' => 'Roll deleted successfully']);
    
} catch(\PDOException $e) { // Catch PDOException specifically
    $pdo->rollBack(); // Rollback transaction using PDO
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch(Exception $e) { // Catch other exceptions
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred: ' . $e->getMessage()]);
}
?>

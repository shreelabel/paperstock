<?php
header('Content-Type: application/json');
require_once 'mysql_config.php';

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
    // Start transaction
    $pdo->beginTransaction();
    
    // Get the roll to be deleted
    $stmt = $pdo->prepare("SELECT * FROM rolls WHERE rollnumber = ?");
    $stmt->execute([$input['rollNumber']]);
    $roll = $stmt->fetch();
    
    if (!$roll) {
        echo json_encode(['success' => false, 'message' => 'Roll not found']);
        exit;
    }
    
    // If this is a main roll, delete all related child rolls
    if ($roll['rolltype'] === 'Main Roll') {
        $stmt = $pdo->prepare("DELETE FROM rolls WHERE mainrollnumber = ?");
        $stmt->execute([$roll['rollnumber']]);
    } else {
        // If this is a child roll, just delete this specific roll
        $stmt = $pdo->prepare("DELETE FROM rolls WHERE rollnumber = ?");
        $stmt->execute([$input['rollNumber']]);
    }
    
    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Roll deleted successfully']);
    
} catch(PDOException $e) {
    $pdo->rollback();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
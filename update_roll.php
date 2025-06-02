<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['rollNumber'])) {
    echo json_encode(['success' => false, 'message' => 'Roll number is required']);
    exit;
}

try {
    // Check if roll exists
    $stmt = $pdo->prepare("SELECT * FROM rolls WHERE rollnumber = ?");
    $stmt->execute([$input['rollNumber']]);
    $roll = $stmt->fetch();
    
    if (!$roll) {
        echo json_encode(['success' => false, 'message' => 'Roll not found']);
        exit;
    }

    // Prevent editing of the default roll
    if ($input['rollNumber'] === '123456') {
        echo json_encode(['success' => false, 'message' => 'This default roll cannot be edited.']);
        exit;
    }

    // Update roll
    $stmt = $pdo->prepare("UPDATE rolls SET
        material = ?, papercompany = ?, gsm = ?, width = ?, length = ?,
        weight = ?, lotno = ?, status = ?, jobname = ?, jobno = ?, jobsize = ?
        WHERE rollnumber = ?");

    $result = $stmt->execute([
        $input['material'] ?? $roll['material'],
        $input['paperCompany'] ?? $roll['papercompany'],
        $input['gsm'] ?? $roll['gsm'],
        $input['width'] ?? $roll['width'],
        $input['length'] ?? $roll['length'],
        $input['weight'] ?? $roll['weight'],
        $input['lotNo'] ?? $roll['lotno'],
        $input['status'] ?? $roll['status'], // Added status field
        $input['jobName'] ?? $roll['jobname'],
        $input['jobNo'] ?? $roll['jobno'],
        $input['jobSize'] ?? $roll['jobsize'],
        $input['rollNumber']
    ]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Roll updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update roll']);
    }
    
} catch (Exception $e) {
    error_log("Update roll error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>

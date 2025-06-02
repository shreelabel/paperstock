<?php
header('Content-Type: application/json');
require_once 'mysql_config.php';

$request_method = $_SERVER['REQUEST_METHOD'] ?? 'POST';
if ($request_method !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['currentPassword']) || !isset($input['newPassword'])) {
    echo json_encode(['success' => false, 'message' => 'Current password and new password are required']);
    exit;
}

try {
    // Check current password (simple hardcoded check for now)
    if ($input['currentPassword'] !== 'admin123') {
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        exit;
    }
    
    // For this demo, we'll just simulate password change
    // In a real application, you would update the password in a secure way
    echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
    
} catch(Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error changing password: ' . $e->getMessage()]);
}
?>
<?php
// Disable error display to ensure clean JSON output
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
header('Content-Type: application/json');

try {
    // MySQL database connection
    require_once 'config.php';
    
    $request_method = $_SERVER['REQUEST_METHOD'] ?? 'POST';
    if ($request_method !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        exit;
    }

    // Validate required fields - check both rollNumber and rollnumber
    $rollNumber = $input['rollNumber'] ?? $input['rollnumber'] ?? null;
    $material = $input['material'] ?? null;
    $paperCompany = $input['paperCompany'] ?? $input['papercompany'] ?? null;
    $gsm = $input['gsm'] ?? null;
    $width = $input['width'] ?? null;
    $length = $input['length'] ?? null;
    $weight = $input['weight'] ?? null;
    $lotNo = $input['lotNo'] ?? $input['lotno'] ?? null;

    if (!$rollNumber || !$material || !$paperCompany || !$gsm || !$width || !$length || !$weight || !$lotNo) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }

    // Check if roll number already exists using PDO
    $stmt = $pdo->prepare("SELECT id FROM rolls WHERE rollnumber = ?");
    $stmt->execute([$rollNumber]);
    $existingRoll = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingRoll) {
        echo json_encode(['success' => false, 'message' => 'Roll number already exists']);
        exit;
    }
    
    // Calculate square meter
    $squareMeter = ($width * $length) / 1000;
    
    // Insert new roll using PDO
    $stmt = $pdo->prepare("
        INSERT INTO rolls (
            rollnumber, material, papercompany, gsm, width, length, weight, 
            lotno, squaremeter, mainrollnumber, rolltype, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Main Roll', 'Stock')
    ");
    
    $success = $stmt->execute([
        $rollNumber,
        $material,
        $paperCompany,
        $gsm,
        $width,
        $length,
        $weight,
        $lotNo,
        $squareMeter,
        $rollNumber // mainrollnumber same as rollnumber for new rolls
    ]);
    
    if ($success) {
        echo json_encode(['success' => true, 'message' => 'Roll added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add roll']);
    }
    
} catch(\PDOException $e) { // Catch PDOException specifically
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch(Exception $e) { // Catch other exceptions
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred: ' . $e->getMessage()]);
}
?>

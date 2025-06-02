<?php
header('Content-Type: application/json');

try {
    // SQLite database connection
    $pdo = new PDO('sqlite:paper_stock.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
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

    // Check if roll number already exists
    $stmt = $pdo->prepare("SELECT id FROM rolls WHERE rollnumber = ?");
    $stmt->execute([$rollNumber]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Roll number already exists']);
        exit;
    }
    
    // Calculate square meter
    $squareMeter = ($width * $length) / 1000;
    
    // Insert new roll
    $stmt = $pdo->prepare("
        INSERT INTO rolls (
            rollnumber, material, papercompany, gsm, width, length, weight, 
            lotno, squaremeter, mainrollnumber, rolltype, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Main Roll', 'Stock')
    ");
    
    $result = $stmt->execute([
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
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Roll added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add roll']);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
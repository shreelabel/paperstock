<?php
header('Content-Type: application/json');

try {
    // Include database configuration
    if (!file_exists('config.php')) {
        echo json_encode(['success' => false, 'message' => 'System not installed. Please run install.php']);
        exit;
    }
    require_once 'config.php';

$request_method = $_SERVER['REQUEST_METHOD'] ?? 'POST';
if ($request_method !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Debug logging
error_log("Received input: " . json_encode($input));

if (!$input || (!isset($input['rollNumber']) && !isset($input['originalRollNumber'])) || !isset($input['slits'])) {
    echo json_encode(['success' => false, 'message' => 'Roll number and slits data are required']);
    exit;
}

// Debug logging
error_log("Processing " . count($input['slits']) . " slits");

    // Get the original roll
    $rollNumber = isset($input['originalRollNumber']) ? $input['originalRollNumber'] : $input['rollNumber'];
    $query = "SELECT * FROM rolls WHERE rollnumber = ?";
    $stmt = $connection->prepare($query);
    $stmt->bindValue(1, $rollNumber);
    $result = $stmt->execute();
    $originalRoll = $result->fetchArray(SQLITE3_ASSOC);
    
    if (!$originalRoll) {
        echo json_encode(['success' => false, 'message' => 'Roll not found']);
        exit;
    }
    
    $isMultiSlit = isset($input['isMultiSlit']) && $input['isMultiSlit'];
    
    foreach ($input['slits'] as $index => $slit) {
        if (!isset($slit['width']) || !isset($slit['length'])) continue;
        
        // Debug logging
        error_log("Processing slit $index: " . json_encode($slit));
        
        // Generate new roll number based on slitting type
        if ($isMultiSlit) {
            // Multi-slit uses letter suffixes (-A, -B, -C)
            $suffix = isset($slit['suffix']) ? $slit['suffix'] : chr(65 + $index);
            $newRollNumber = $originalRoll['rollnumber'] . '-' . $suffix;
        } else {
            // Edit modal slitting uses numbered suffixes (-1, -2)
            $newRollNumber = $originalRoll['rollnumber'] . '-' . ($index + 1);
        }
        
        // Calculate square meter for slit (width in mm, length in m)
        $squareMeter = ($slit['width'] * $slit['length']) / 1000;
        
        // Insert new slit roll
        $stmt = $pdo->prepare("
            INSERT INTO rolls (
                rollnumber, material, papercompany, gsm, width, length, weight,
                lotno, squaremeter, mainrollnumber, rolltype, status, jobname, jobno, jobsize
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Slit Roll', ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([
            $newRollNumber,
            $originalRoll['material'],
            $originalRoll['papercompany'],
            $originalRoll['gsm'],
            $slit['width'],
            $slit['length'],
            $originalRoll['weight'], // Keep original weight for reference
            $originalRoll['lotno'],
            $squareMeter,
            $originalRoll['mainrollnumber'],
            $slit['status'],
            $slit['jobname'] ?? $originalRoll['jobname'] ?? '',
            $slit['jobno'] ?? $originalRoll['jobno'] ?? '',
            $slit['jobsize'] ?? $originalRoll['jobsize'] ?? ''
        ]);
        
        // Debug logging
        if ($result) {
            error_log("Successfully inserted slit roll: $newRollNumber");
        } else {
            error_log("Failed to insert slit roll: $newRollNumber");
        }
    }
    
    // Update original roll status to Original (but keep it visible)
    $stmt = $pdo->prepare("UPDATE rolls SET status = 'Original' WHERE rollnumber = ?");
    $stmt->execute([$input['rollNumber']]);
    
    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Roll slit successfully']);
    
} catch(PDOException $e) {
    $pdo->rollback();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
<?php
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
header('Content-Type: application/json');
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

try { // Added try block
    // Debug logging
    error_log("Processing " . count($input['slits']) . " slits");

    // Get the original roll using PDO
    $rollNumber = isset($input['originalRollNumber']) ? $input['originalRollNumber'] : $input['rollNumber'];
    $query = "SELECT * FROM rolls WHERE rollnumber = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$rollNumber]);
    $originalRoll = $stmt->fetch(PDO::FETCH_ASSOC);
        
    if (!$originalRoll) {
        echo json_encode(['success' => false, 'message' => 'Roll not found']);
        exit;
    }
    
    $isMultiSlit = isset($input['isMultiSlit']) && $input['isMultiSlit'];
    
    // Start transaction for multiple inserts/updates
    $pdo->beginTransaction();

    try {
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
            
            // Insert new slit roll using PDO
            $stmt = $pdo->prepare("
                INSERT INTO rolls (
                    rollnumber, material, papercompany, gsm, width, length, weight,
                    lotno, squaremeter, mainrollnumber, rolltype, status, jobname, jobno, jobsize
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Slit Roll', ?, ?, ?, ?)
            ");
            
            $success = $stmt->execute([
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
            if ($success) {
                error_log("Successfully inserted slit roll: $newRollNumber");
            } else {
                error_log("Failed to insert slit roll: $newRollNumber");
                // If an insert fails, rollback the transaction and throw an exception
                $pdo->rollBack();
                throw new Exception("Failed to insert slit roll: $newRollNumber");
            }
        }
        
        // Determine the new status for the original roll based on its type
        $newOriginalRollStatus = ($originalRoll['rolltype'] === 'Slit Roll') ? 'Used' : 'Original';

        // Update original roll status using PDO
        $stmt = $pdo->prepare("UPDATE rolls SET status = ? WHERE rollnumber = ?");
        $stmt->execute([$newOriginalRollStatus, $input['rollNumber']]);
        
        // Commit the transaction if all inserts/updates were successful
        $pdo->commit();
        
        echo json_encode(['success' => true, 'message' => 'Roll slit successfully']);
        
    } catch (\PDOException $e) {
        // Rollback transaction on PDO error
        $pdo->rollBack();
        throw $e; // Re-throw the exception to be caught by the outer catch block
    } catch (Exception $e) {
        // Rollback transaction on other errors
        $pdo->rollBack();
        throw $e; // Re-throw the exception to be caught by the outer catch block
    }
    
} catch(\PDOException $e) { // Catch PDOException specifically
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch(Exception $e) { // Catch other exceptions
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred: ' . $e->getMessage()]);
}
?>

<?php
header('Content-Type: application/json');
require_once 'mysql_config.php';

try {

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid JSON input');
        }

        // Log received data for debugging
        error_log("Received data: " . json_encode($input));
        
        // Validate required fields - more lenient validation
        if (!isset($input['id']) || !isset($input['rollNumber'])) {
            throw new Exception("Missing required fields: id or rollNumber");
        }

        // Handle slitting if enabled
        if (isset($input['slits']) && !empty($input['slits'])) {
            // Process slitting (numbered suffixes for edit modal)
            $originalRollId = $input['id'];
            
            // First, mark original roll as "Original"
            $updateOriginal = $pdo->prepare("
                UPDATE rolls 
                SET status = 'Original', 
                    rolltype = 'Main Roll'
                WHERE id = ?
            ");
            $updateOriginal->execute([$originalRollId]);
            
            // Create slit rolls
            foreach ($input['slits'] as $index => $slit) {
                $newRollNumber = $input['rollNumber'] . '-' . ($index + 1);
                
                $stmt = $pdo->prepare("
                    INSERT INTO rolls (
                        rollnumber, material, papercompany, gsm, width, length, weight, 
                        lotno, status, datetime, squaremeter, rolltype, mainrollnumber,
                        jobname, jobno, jobsize
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, 'Slit Roll', ?, ?, ?, ?)
                ");
                
                $squareMeter = ($slit['width'] * $slit['length']) / 1000;
                
                $stmt->execute([
                    $newRollNumber,
                    $input['material'],
                    $input['paperCompany'],
                    $input['gsm'],
                    $slit['width'],
                    $slit['length'],
                    $input['weight'],
                    $input['lotNo'],
                    $slit['status'],
                    $squareMeter,
                    $input['rollNumber'],
                    isset($slit['jobname']) ? $slit['jobname'] : '',
                    isset($slit['jobno']) ? $slit['jobno'] : '',
                    isset($slit['jobsize']) ? $slit['jobsize'] : ''
                ]);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Roll updated and slitted successfully'
            ]);
        } else {
            // Regular update without slitting
            $stmt = $pdo->prepare("
                UPDATE rolls 
                SET material = ?, papercompany = ?, gsm = ?, width = ?, length = ?, 
                    weight = ?, lotno = ?, status = ?, 
                    squaremeter = ?, jobname = ?, jobno = ?, jobsize = ?
                WHERE id = ?
            ");
            
            $squareMeter = ($input['width'] * $input['length']) / 1000;
            
            $stmt->execute([
                $input['material'],
                $input['paperCompany'],
                $input['gsm'],
                $input['width'],
                $input['length'],
                $input['weight'],
                $input['lotNo'],
                $input['status'],
                $squareMeter,
                isset($input['jobName']) ? $input['jobName'] : '',
                isset($input['jobNo']) ? $input['jobNo'] : '',
                isset($input['jobSize']) ? $input['jobSize'] : '',
                $input['id']
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Roll updated successfully'
            ]);
        }
    } else {
        throw new Exception('Only POST method allowed');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
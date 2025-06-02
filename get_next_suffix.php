<?php
header('Content-Type: application/json');

try {
    // Include database configuration
    if (!file_exists('../config.php')) {
        echo json_encode(['success' => false, 'message' => 'System not installed. Please run install.php']);
        exit;
    }
    require_once '../config.php';

    $request_method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($request_method !== 'GET' && $request_method !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }

    // Get roll number from request
    $rollNumber = $_GET['rollNumber'] ?? $_POST['rollNumber'] ?? '';
    $slitType = $_GET['slitType'] ?? $_POST['slitType'] ?? 'multi'; // 'multi' or 'edit'

    if (empty($rollNumber)) {
        echo json_encode(['success' => false, 'message' => 'Roll number is required']);
        exit;
    }

    // Get existing slit rolls for this main roll
    if ($connection instanceof SQLite3) {
        // SQLite query
        $query = "SELECT rollnumber FROM rolls WHERE rollnumber LIKE ? AND rollnumber != ? ORDER BY rollnumber";
        $stmt = $connection->prepare($query);
        $stmt->bindValue(1, $rollNumber . '-%');
        $stmt->bindValue(2, $rollNumber);
        $result = $stmt->execute();
        
        $existingRolls = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $existingRolls[] = $row['rollnumber'];
        }
    } else {
        // MySQL query
        $query = "SELECT rollnumber FROM rolls WHERE rollnumber LIKE ? AND rollnumber != ? ORDER BY rollnumber";
        $stmt = mysqli_prepare($connection, $query);
        $searchPattern = $rollNumber . '-%';
        mysqli_stmt_bind_param($stmt, 'ss', $searchPattern, $rollNumber);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $existingRolls = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $existingRolls[] = $row['rollnumber'];
        }
    }

    // Extract existing suffixes
    $existingSuffixes = [];
    foreach ($existingRolls as $existingRoll) {
        $parts = explode('-', $existingRoll);
        if (count($parts) > 1) {
            $suffix = end($parts);
            $existingSuffixes[] = $suffix;
        }
    }

    // Generate next suffix based on slit type
    $nextSuffix = '';
    
    if ($slitType === 'multi') {
        // Multi-slit uses letter suffixes (A, B, C, ...)
        $letterSuffixes = array_filter($existingSuffixes, function($suffix) {
            return preg_match('/^[A-Z]$/', $suffix);
        });
        
        if (empty($letterSuffixes)) {
            $nextSuffix = 'A';
        } else {
            // Find the next available letter
            $lastLetter = max($letterSuffixes);
            $nextSuffix = chr(ord($lastLetter) + 1);
            
            // Check if we've gone past Z
            if (ord($nextSuffix) > ord('Z')) {
                $nextSuffix = 'AA'; // Start double letters if needed
            }
        }
    } else {
        // Edit modal slitting uses numbered suffixes (1, 2, 3, ...)
        $numberSuffixes = array_filter($existingSuffixes, function($suffix) {
            return is_numeric($suffix);
        });
        
        if (empty($numberSuffixes)) {
            $nextSuffix = '1';
        } else {
            $maxNumber = max(array_map('intval', $numberSuffixes));
            $nextSuffix = strval($maxNumber + 1);
        }
    }

    // Return available suffixes and suggested next suffix
    echo json_encode([
        'success' => true,
        'rollNumber' => $rollNumber,
        'slitType' => $slitType,
        'existingSuffixes' => $existingSuffixes,
        'nextSuffix' => $nextSuffix,
        'existingRolls' => $existingRolls,
        'suggestedRollNumber' => $rollNumber . '-' . $nextSuffix
    ]);

} catch (Exception $e) {
    error_log("Error in get_next_suffix.php: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
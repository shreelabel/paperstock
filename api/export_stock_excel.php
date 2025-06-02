<?php
// Script to export stock data to CSV

// Include database configuration
require_once __DIR__ . '/../config.php';

// Ensure the $pdo variable is set by config.php
if (!isset($pdo) || !($pdo instanceof PDO)) {
    // If running via cron/task scheduler, errors might not be visible.
    // Log the error or output to a file for debugging.
    error_log("Database connection not established in config.php");
    // Exit gracefully if database connection fails
    exit("Database connection error.");
}

try {
    // Query the rolls table
    $stmt = $pdo->prepare("SELECT * FROM rolls ORDER BY id DESC");
    $stmt->execute();
    $rolls = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($rolls)) {
        // No data to export
        error_log("No data found in rolls table for export.");
        exit("No data to export.");
    }

    // --- Generate CSV Content ---
    $csv_data = '';

    // Get headers from the first row keys
    $headers = array_keys($rolls[0]);
    $csv_data .= '"' . implode('","', $headers) . '"' . "\n";

    // Add data rows
    foreach ($rolls as $row) {
        $data = [];
        foreach ($headers as $header) {
            // Escape double quotes by doubling them
            $data[] = str_replace('"', '""', $row[$header]);
        }
        $csv_data .= '"' . implode('","', $data) . '"' . "\n";
    }

    // --- Determine Output Method ---
    // If run from web, download as file.
    // If run from CLI (e.g., task scheduler), save to a file in the 'exports' directory.

    // Check if the script is run from CLI
    if (php_sapi_name() === 'cli') {
        $export_dir = __DIR__ . '/../exports/';
        // Create exports directory if it doesn't exist
        if (!is_dir($export_dir)) {
            mkdir($export_dir, 0777, true);
        }

        $filename = 'stock_export_' . date('Ymd_His') . '.csv';
        $filepath = $export_dir . $filename;

        if (file_put_contents($filepath, $csv_data) !== false) {
            echo "Stock data exported successfully to: " . $filepath . "\n";
        } else {
            error_log("Failed to write CSV data to file: " . $filepath);
            exit("Failed to write CSV data to file.");
        }

    } else {
        // If run from web, trigger download
        $filename = 'stock_export_' . date('Ymd') . '.csv';
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');
        echo $csv_data;
    }

} catch (\PDOException $e) {
    error_log('Database error during export: ' . $e->getMessage());
    if (php_sapi_name() === 'cli') {
        exit('Database error during export: ' . $e->getMessage());
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error during export.']);
    }
} catch (Exception $e) {
    error_log('An unexpected error occurred during export: ' . $e->getMessage());
    if (php_sapi_name() === 'cli') {
        exit('An unexpected error occurred during export: ' . $e->getMessage());
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'An unexpected error occurred during export.']);
    }
}
?>

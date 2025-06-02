<?php
include 'config.php';

// Set headers for download
header('Content-Type: application/sql');
header('Content-Disposition: attachment; filename="backup_' . date('Y-m-d_H-i-s') . '.sql"');
header('Pragma: no-cache');
header('Expires: 0');

// Database credentials from config.php
$host = $host;
$username = $username;
$password = $password;
$database = $database;

// Command to execute mysqldump
// Use shell_exec to run the command and capture output
// Command to execute mysqldump with full path for XAMPP on Windows
$mysqldump_path = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
$command = "\"{$mysqldump_path}\" --opt -h {$host} -u {$username} -p{$password} {$database}";

// Execute the command and output the result
$output = shell_exec($command);

if ($output === null) {
    // Handle error if shell_exec fails
    http_response_code(500);
    echo "Error executing mysqldump command.";
    error_log("mysqldump command failed for database: {$database}");
} else {
    // Output the database dump
    echo $output;
}

?>

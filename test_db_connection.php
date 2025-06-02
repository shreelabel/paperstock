<?php

$host = 'sql101.infinityfree.com';
$username = 'if0_39085666';
$password = 'OR2McjtktWJg';
$database = 'if0_39085666_paperstock';

// Attempt to connect to MySQL database
$connection = mysqli_connect($host, $username, $password, $database);

// Check connection
if ($connection === false) {
    die("Database connection failed: " . mysqli_connect_error());
}

echo "Database connection successful!";

// Close connection
mysqli_close($connection);

?>

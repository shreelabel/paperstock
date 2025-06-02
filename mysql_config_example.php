<?php
// MySQL Database Configuration
// Rename this file to config.php and edit the values below

$host = 'localhost';          // Your MySQL host
$username = 'root';           // Your MySQL username  
$password = '';               // Your MySQL password
$database = 'paper_stock';    // Your database name

// Create MySQL connection
$connection = mysqli_connect($host, $username, $password, $database);
if (!$connection) {
    die('MySQL Connection failed: ' . mysqli_connect_error());
}

// Create tables for MySQL
mysqli_query($connection, "CREATE TABLE IF NOT EXISTS rolls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rollnumber VARCHAR(100) NOT NULL,
    mainrollnumber VARCHAR(100),
    material VARCHAR(100),
    papercompany VARCHAR(100),
    gsm INT,
    width INT,
    length INT,
    weight DECIMAL(10,2),
    lotno VARCHAR(100),
    squaremeter DECIMAL(10,2),
    rolltype VARCHAR(50) DEFAULT 'Main Roll',
    status VARCHAR(50) DEFAULT 'Stock',
    originalroll VARCHAR(100),
    jobname VARCHAR(100),
    jobno VARCHAR(100),
    jobsize VARCHAR(100),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

mysqli_query($connection, "CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
)");

// Create default admin user
$result = mysqli_query($connection, "SELECT * FROM admin WHERE username = 'admin'");
if (mysqli_num_rows($result) == 0) {
    $hashed_password = password_hash('admin123', PASSWORD_DEFAULT);
    $username_escaped = mysqli_real_escape_string($connection, 'admin');
    $password_escaped = mysqli_real_escape_string($connection, $hashed_password);
    mysqli_query($connection, "INSERT INTO admin (username, password) VALUES ('$username_escaped', '$password_escaped')");
}
?>
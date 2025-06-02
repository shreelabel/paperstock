<?php
header('Content-Type: application/json');

require_once '../database/db.php';

$materials = [];
$companies = [];

try {
    $db = new Database();
    $conn = $db->getConnection(); // Get the underlying connection (PDO object)

    // Fetch distinct materials
    $sql_materials = "SELECT DISTINCT material FROM rolls ORDER BY material";
    $result_materials = $db->query($sql_materials); // Use the Database class query method
    
    // Use fetchAll to get all results
    $material_rows = $db->fetchAll($result_materials);
    foreach ($material_rows as $row) {
        $materials[] = $row['material'];
    }

    // Fetch distinct paper companies
    $sql_companies = "SELECT DISTINCT papercompany FROM rolls ORDER BY papercompany";
    $result_companies = $db->query($sql_companies); // Use the Database class query method

    // Use fetchAll to get all results
    $company_rows = $db->fetchAll($result_companies);
    foreach ($company_rows as $row) {
        $companies[] = $row['papercompany'];
    }

    // The Database class handles closing the connection when the object goes out of scope or explicitly with close()
    // $db->close(); // Explicit close is optional with PDO

    echo json_encode([
        'materials' => $materials,
        'companies' => $companies
    ]);

} catch (Exception $e) {
    // Log the error and return a JSON error response
    error_log("Error in get_materials_companies.php: " . $e->getMessage());
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'An error occurred while fetching data.']);
}
?>

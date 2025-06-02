<?php
header('Content-Type: application/json');

try {
    // SQLite database connection
    $pdo = new PDO('sqlite:paper_stock.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS rolls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rollnumber TEXT NOT NULL,
        mainrollnumber TEXT,
        material TEXT,
        papercompany TEXT,
        gsm INTEGER,
        width INTEGER,
        length INTEGER,
        weight REAL,
        lotno TEXT,
        squaremeter REAL,
        rolltype TEXT DEFAULT 'Main Roll',
        status TEXT DEFAULT 'Stock',
        originalroll TEXT,
        date_added DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    $stmt = $pdo->prepare("SELECT * FROM rolls ORDER BY id DESC");
    $stmt->execute();
    $rolls = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($rolls);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
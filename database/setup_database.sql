-- Paper Stock Management Database Setup
-- This file contains SQL commands for MySQL setup

-- Create database (run this first)
CREATE DATABASE IF NOT EXISTS paper_stock;
USE paper_stock;

-- Create rolls table
CREATE TABLE IF NOT EXISTS rolls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rollnumber VARCHAR(100) NOT NULL UNIQUE,
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
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rollnumber (rollnumber),
    INDEX idx_material (material),
    INDEX idx_company (papercompany),
    INDEX idx_status (status),
    INDEX idx_rolltype (rolltype)
);

-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT IGNORE INTO admin (username, password) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
-- Default password is 'admin123'

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rolls_main ON rolls(mainrollnumber);
CREATE INDEX IF NOT EXISTS idx_rolls_date ON rolls(date_added);
CREATE INDEX IF NOT EXISTS idx_rolls_gsm ON rolls(gsm);
CREATE INDEX IF NOT EXISTS idx_rolls_width ON rolls(width);
CREATE INDEX IF NOT EXISTS idx_rolls_length ON rolls(length);
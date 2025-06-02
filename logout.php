<?php
session_start();

// Clear all session data
session_unset();
session_destroy();

// Clear any authentication cookies if they exist
if (isset($_COOKIE['paper_stock_auth'])) {
    setcookie('paper_stock_auth', '', time() - 3600, '/');
}

// Return JSON response for AJAX requests
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    exit;
}

// For regular requests, redirect to login page
header('Location: ../index.html?logged_out=1');
exit;
?>
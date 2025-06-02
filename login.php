<?php
// Start the session
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Include database connection
include 'db.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'Invalid request.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? ''; // In a real app, use password hashing!

    if (empty($username) || empty($password)) {
        $response['message'] = 'Please enter username and password.';
    } else {
        try {
            // Prepare and execute the query to find the user
            // WARNING: This is a basic example. Passwords should be hashed and verified securely.
            $stmt = $pdo->prepare("SELECT id, username, is_admin FROM users WHERE username = :username AND password = :password LIMIT 1");
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':password', $password); // Insecure for production!
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // User found and credentials match (insecurely)
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['is_admin'] = (bool)$user['is_admin']; // Cast to boolean

                $response['success'] = true;
                $response['message'] = 'Login successful.';
                // In a real application, you might redirect here instead of returning JSON
                // header('Location: index.html');
                // exit;

            } else {
                // User not found or credentials don't match
                $response['message'] = 'Invalid username or password.';
            }

        } catch (\PDOException $e) {
            // Log the error and return a generic error message
            error_log("Login error: " . $e->getMessage());
            $response['message'] = 'Database error during login.';
        }
    }
}

echo json_encode($response);

?>

<?php
// Start the session if it hasn't been started already
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Note: A more complete check_admin.php would typically verify user login status
// and potentially query the database to confirm admin privileges, setting $_SESSION['is_admin'].
// Since the original file was missing and its exact logic is unknown,
// this minimal version ensures the session is active, allowing subsequent checks
// in the including script (like delete_all_rolls.php) to function without include errors.

// If the original check_admin.php handled redirection, that logic is not included here.
// The calling script (e.g., delete_all_rolls.php) is expected to handle unauthorized access responses.

?>

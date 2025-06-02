# Paper Stock Management System

A comprehensive web-based inventory management system for paper stock with advanced slitting capabilities.

## Database Options

### Option 1: SQLite (Default - Recommended)
- **Current Setup**: Ready to use out of the box
- **Advantages**: No database server required, portable, easy setup
- **Files**: Uses `config.php` (already configured)
- **Login**: admin / admin123

### Option 2: MySQL Setup
**Step 1: Prepare MySQL Database**
```sql
CREATE DATABASE paper_stock;
```

**Step 2: Configure Database Connection**
- Rename `mysql_config_example.php` to `config.php`
- Edit database credentials:
```php
$host = 'localhost';          // Your MySQL host
$username = 'your_username';  // Your MySQL username  
$password = 'your_password';  // Your MySQL password
$database = 'paper_stock';    // Your database name
```

**Step 3: Access Application**
- Open application in browser
- Tables will be created automatically
- Default login: admin / admin123

## Installation Methods

### Method 1: Direct Setup (Current)
1. Extract files to web server directory
2. For SQLite: Access application directly
3. For MySQL: Follow MySQL setup steps above
4. Login with admin / admin123

### Method 2: Installation Wizard
1. Delete existing `config.php` file
2. Access `install.php` in browser
3. Follow installation wizard
4. Choose database type and set credentials

## File Structure
```
/your-website-folder/
├── config.php                  (SQLite - ready to use)
├── mysql_config_example.php    (MySQL template)
├── install.php                 (Installation wizard)
├── index.html                  (Main application)
├── script.js                   (Application logic)
├── styles.css                  (UI styling)
├── get_rolls.php               (API: Get inventory)
├── add_roll.php                (API: Add rolls)
├── update_roll.php             (API: Update rolls)
├── delete_roll.php             (API: Delete rolls)
├── slit_roll.php               (API: Slitting operations)
└── change_password.php         (API: Password management)
```

## Features

### Inventory Management
- Add, edit, delete paper rolls
- Complete specifications tracking
- Filter and search capabilities
- Sort by any column

### Slitting Operations
- **Multi-Slit**: Create multiple pieces (A, B, C suffixes)
- **Edit-Slit**: Slit from edit modal (numbered suffixes)
- Automatic remaining calculation
- Parent-child relationship tracking

### Reports & Export
- Print individual rolls or complete stock
- Export to Excel/CSV
- Generate material/company reports
- Professional report formatting

### Security & Settings
- Secure admin authentication
- Password change functionality
- Database backup/restore
- Session management

## Quick Start

### For SQLite (Immediate Use)
1. Upload files to web server
2. Access `index.html` in browser
3. Login: admin / admin123
4. Start managing inventory

### For MySQL
1. Create MySQL database
2. Copy `mysql_config_example.php` to `config.php`
3. Edit database credentials
4. Access application
5. Login: admin / admin123

## System Requirements
- Web server (Apache/Nginx)
- PHP 7.4 or higher
- SQLite extension (built-in) OR MySQL server
- Modern web browser

## Hosting Compatibility
- **Shared Hosting**: Use SQLite option
- **VPS/Dedicated**: Choose SQLite or MySQL
- **Local Development**: Both options work with XAMPP/WAMP

## Default Credentials
- **Username**: admin
- **Password**: admin123
- **Note**: Change these after first login in Settings

## Troubleshooting

### Database Connection Issues
- **SQLite**: Check file permissions
- **MySQL**: Verify database credentials and server status

### Permission Errors
- Set folder permissions to 755
- Set file permissions to 644
- Ensure database file is writable

### Blank Page or Errors
- Check PHP error logs
- Verify PHP version (7.4+)
- Ensure all files uploaded correctly

## Support
- Review this README for setup instructions
- Check PHP error logs for detailed error messages
- Verify system requirements and file permissions
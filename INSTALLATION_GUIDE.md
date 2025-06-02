# Paper Stock Management System - Installation Guide

## System Requirements
- Web server (Apache/Nginx)
- PHP 7.4 or higher
- SQLite extension (built-in) OR MySQL database
- Web browser (Chrome, Firefox, Edge, Safari)

## Installation Methods

### Method 1: Automatic Installation (Recommended)
1. **Upload Files**
   - Extract all files to your web server directory
   - Ensure proper file permissions (755 for folders, 644 for files)

2. **Run Installation Wizard**
   - Open browser: `http://your-domain.com/install.php`
   - Follow 3-step installation process:

   **Step 1: Database Configuration**
   - Choose SQLite (recommended) or MySQL
   - For MySQL: Enter host, database name, username, password
   - Click "Next"

   **Step 2: Admin Account Setup**
   - Set admin username (default: admin)
   - Create strong password
   - Confirm password
   - Click "Next"

   **Step 3: Complete Installation**
   - Review configuration
   - Click "Install Now"
   - Wait for installation to complete

3. **Launch Application**
   - Click "Launch Application" button
   - Login with your admin credentials
   - Start managing your paper stock inventory

### Method 2: Manual Configuration
1. **Upload Files**
   - Extract all files to web server directory

2. **Configure Database**
   - Edit `config.php` file:
   ```php
   // For SQLite (recommended)
   $database_file = 'paper_stock.db';
   $connection = new SQLite3($database_file);
   
   // For MySQL (uncomment and edit)
   /*
   $host = 'localhost';
   $username = 'your_username';
   $password = 'your_password';
   $database = 'paper_stock';
   $connection = mysqli_connect($host, $username, $password, $database);
   */
   ```

3. **Access Application**
   - Open: `http://your-domain.com/index.html`
   - Default login: admin / admin123

## File Structure
```
/your-website-folder/
├── install.php          (Installation wizard)
├── index.html          (Main application)
├── script.js           (Application functionality)
├── styles.css          (User interface styling)
├── config.php          (Database configuration)
├── get_rolls.php       (Get inventory data)
├── add_roll.php        (Add new rolls)
├── update_roll.php     (Update roll information)
├── delete_roll.php     (Delete rolls)
├── slit_roll.php       (Slitting operations)
├── change_password.php (Password management)
└── paper_stock.db      (SQLite database - auto-created)
```

## Database Options

### SQLite (Recommended)
- **Advantages**: No database server required, portable, easy setup
- **Requirements**: PHP SQLite extension (built-in)
- **File**: paper_stock.db (auto-created)

### MySQL
- **Advantages**: Traditional database, scalable
- **Requirements**: MySQL server, database credentials
- **Setup**: Create database 'paper_stock' before installation

## Features Overview

### Inventory Management
- Add new paper rolls with complete specifications
- View and search complete stock inventory
- Filter by material, company, GSM, dimensions
- Sort by any column

### Slitting Operations
- **Multi-Slit**: Create multiple pieces from original roll (A, B, C suffixes)
- **Edit-Slit**: Slit rolls from edit modal (numbered suffixes -1, -2)
- Automatic remaining material calculation
- Parent-child relationship tracking

### Reports & Export
- Print individual roll details
- Print complete stock report
- Export inventory to Excel/CSV
- Generate material-wise reports
- Company-wise analysis

### Settings & Security
- Change admin password
- Database backup and restore
- Secure login system
- Session management

## Hosting Compatibility

### Shared Hosting (InfinityFree, 000webhost, etc.)
- Upload via FTP or File Manager
- Use SQLite database option
- No additional server configuration needed

### VPS/Dedicated Server
- Full control over server configuration
- Can use MySQL or SQLite
- Enable SSL for secure access

### Local Development (XAMPP/WAMP/MAMP)
- Copy files to htdocs folder
- Access via localhost
- SQLite works out of the box

## Troubleshooting

### Common Issues
1. **"System not installed" error**
   - Run install.php first
   - Check if config.php exists

2. **Database connection failed**
   - Verify database credentials
   - Check file permissions (SQLite)
   - Ensure database exists (MySQL)

3. **Permission denied errors**
   - Set folder permissions to 755
   - Set file permissions to 644
   - Ensure web server can write to database file

4. **Blank page or errors**
   - Check PHP error logs
   - Ensure PHP version is 7.4+
   - Verify all files uploaded correctly

### PHP Extensions Required
- SQLite3 (for SQLite database)
- MySQLi (for MySQL database)
- JSON (for API responses)
- Session (for login management)

## Security Recommendations

1. **Change Default Credentials**
   - Use strong admin password
   - Change default username if needed

2. **File Permissions**
   - Restrict database file access
   - Secure config.php file

3. **SSL Certificate**
   - Use HTTPS for secure access
   - Protect login credentials

4. **Regular Backups**
   - Use built-in backup feature
   - Keep external database copies

## Support & Updates

### Getting Help
- Check this installation guide
- Review PHP error logs
- Verify system requirements

### System Updates
- Backup database before updates
- Replace application files
- Keep config.php unchanged
- Test functionality after update

## Default Login Credentials
- **Username**: admin
- **Password**: admin123
- **Note**: Change these immediately after first login

## Quick Start Guide
1. Upload files to web server
2. Run install.php in browser
3. Choose SQLite database
4. Set admin credentials
5. Click "Launch Application"
6. Login and start managing inventory

---

**Note**: This system is designed to be universal and work on any PHP-enabled hosting environment. The installation wizard automatically handles database setup and configuration for maximum compatibility.
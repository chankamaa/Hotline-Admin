# Settings Module - Database Schema

## System Configuration Tables

### 1. system_settings
Global system configuration and general settings.

```sql
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NULL,
  setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
  category VARCHAR(50) NOT NULL,
  description TEXT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  updated_by VARCHAR(50) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_setting_key (setting_key)
);
```

### 2. company_information
Company details, branding, and business information.

```sql
CREATE TABLE company_information (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(200) NOT NULL,
  company_logo_url VARCHAR(500) NULL,
  business_address TEXT NOT NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  zip_code VARCHAR(20) NULL,
  country VARCHAR(100) NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(100) NULL,
  website VARCHAR(200) NULL,
  tax_id_number VARCHAR(100) NULL,
  gst_number VARCHAR(100) NULL,
  vat_number VARCHAR(100) NULL,
  business_hours_start TIME DEFAULT '09:00:00',
  business_hours_end TIME DEFAULT '18:00:00',
  business_days JSON DEFAULT '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. store_locations
Multi-location store configuration.

```sql
CREATE TABLE store_locations (
  id VARCHAR(50) PRIMARY KEY,
  store_name VARCHAR(200) NOT NULL,
  store_code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT NULL,
  city VARCHAR(100) NULL,
  phone VARCHAR(50) NULL,
  manager_id VARCHAR(50) NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  opening_time TIME DEFAULT '09:00:00',
  closing_time TIME DEFAULT '18:00:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_store_code (store_code),
  INDEX idx_is_active (is_active)
);
```

### 4. currency_settings
Currency and number formatting configuration.

```sql
CREATE TABLE currency_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  currency_code VARCHAR(3) NOT NULL,
  currency_name VARCHAR(50) NOT NULL,
  currency_symbol VARCHAR(10) NOT NULL,
  symbol_position ENUM('before', 'after') DEFAULT 'before',
  decimal_places INT DEFAULT 2,
  thousand_separator VARCHAR(1) DEFAULT ',',
  decimal_separator VARCHAR(1) DEFAULT '.',
  is_default BOOLEAN DEFAULT FALSE,
  exchange_rate DECIMAL(15,6) DEFAULT 1.000000,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 5. tax_configuration
Tax system settings and rates.

```sql
CREATE TABLE tax_configuration (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tax_system VARCHAR(50) NOT NULL,
  tax_name VARCHAR(100) NOT NULL,
  tax_rate DECIMAL(5,2) NOT NULL,
  is_inclusive BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  applies_to VARCHAR(50) DEFAULT 'all',
  location_id VARCHAR(50) NULL,
  effective_from DATE NULL,
  effective_to DATE NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tax_system (tax_system),
  INDEX idx_location_id (location_id)
);
```

### 6. receipt_settings
Receipt customization and formatting.

```sql
CREATE TABLE receipt_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_id VARCHAR(50) NULL,
  header_message TEXT NULL,
  footer_message TEXT NULL,
  paper_size VARCHAR(20) DEFAULT '80mm',
  show_tax BOOLEAN DEFAULT TRUE,
  show_discount BOOLEAN DEFAULT TRUE,
  show_barcode BOOLEAN DEFAULT TRUE,
  show_qr_code BOOLEAN DEFAULT FALSE,
  logo_position ENUM('center', 'left', 'right') DEFAULT 'center',
  font_size ENUM('small', 'medium', 'large') DEFAULT 'medium',
  print_copies INT DEFAULT 1,
  auto_cut BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES store_locations(id)
);
```

### 7. notification_settings
Email and notification configuration.

```sql
CREATE TABLE notification_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) NULL,
  notification_type VARCHAR(50) NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT FALSE,
  frequency VARCHAR(20) DEFAULT 'realtime',
  email_address VARCHAR(100) NULL,
  phone_number VARCHAR(50) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_notification_type (notification_type)
);
```

### 8. low_stock_thresholds
Product-specific and global low stock alert thresholds.

```sql
CREATE TABLE low_stock_thresholds (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NULL,
  location_id VARCHAR(50) NULL,
  threshold_quantity INT NOT NULL,
  critical_quantity INT NULL,
  is_global_default BOOLEAN DEFAULT FALSE,
  alert_frequency VARCHAR(20) DEFAULT 'daily',
  last_alert_sent TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_product_location (product_id, location_id),
  INDEX idx_product_id (product_id),
  INDEX idx_location_id (location_id)
);
```

### 9. display_preferences
Date, time, and number format preferences.

```sql
CREATE TABLE display_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) NULL,
  date_format VARCHAR(50) DEFAULT 'DD/MM/YYYY',
  date_separator VARCHAR(1) DEFAULT '/',
  time_format ENUM('12-hour', '24-hour') DEFAULT '24-hour',
  show_seconds BOOLEAN DEFAULT FALSE,
  timezone VARCHAR(100) DEFAULT 'America/New_York',
  first_day_of_week ENUM('sunday', 'monday', 'saturday') DEFAULT 'monday',
  language_code VARCHAR(5) DEFAULT 'en',
  enable_multi_language BOOLEAN DEFAULT FALSE,
  secondary_languages JSON NULL,
  compact_numbers BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);
```

### 10. backup_configuration
Automated backup settings and schedules.

```sql
CREATE TABLE backup_configuration (
  id INT PRIMARY KEY AUTO_INCREMENT,
  backup_enabled BOOLEAN DEFAULT TRUE,
  backup_schedule VARCHAR(20) DEFAULT 'daily',
  backup_time TIME DEFAULT '02:00:00',
  retention_days INT DEFAULT 730,
  backup_location VARCHAR(200) DEFAULT '/var/backups/pos-admin',
  compress_backups BOOLEAN DEFAULT TRUE,
  encrypt_backups BOOLEAN DEFAULT TRUE,
  cloud_backup_enabled BOOLEAN DEFAULT FALSE,
  cloud_provider VARCHAR(50) NULL,
  cloud_bucket_name VARCHAR(200) NULL,
  cloud_access_key TEXT NULL,
  cloud_secret_key TEXT NULL,
  notify_on_completion BOOLEAN DEFAULT TRUE,
  notify_on_failure BOOLEAN DEFAULT TRUE,
  last_backup_at TIMESTAMP NULL,
  next_backup_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 11. backup_history
Log of all backup operations.

```sql
CREATE TABLE backup_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  backup_id VARCHAR(100) UNIQUE NOT NULL,
  backup_type ENUM('Automated', 'Manual') NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  duration_seconds INT NULL,
  file_size_mb DECIMAL(10,2) NULL,
  file_path VARCHAR(500) NULL,
  status ENUM('In Progress', 'Success', 'Failed') DEFAULT 'In Progress',
  error_message TEXT NULL,
  tables_backed_up JSON NULL,
  triggered_by VARCHAR(50) NULL,
  INDEX idx_backup_id (backup_id),
  INDEX idx_status (status),
  INDEX idx_backup_type (backup_type),
  INDEX idx_start_time (start_time)
);
```

### 12. export_history
Data export operation logs.

```sql
CREATE TABLE export_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  export_id VARCHAR(100) UNIQUE NOT NULL,
  export_type ENUM('Full', 'Selective') NOT NULL,
  export_format ENUM('SQL', 'JSON', 'Excel', 'CSV') NOT NULL,
  tables_exported JSON NULL,
  record_count INT NULL,
  file_size_mb DECIMAL(10,2) NULL,
  file_path VARCHAR(500) NULL,
  status ENUM('In Progress', 'Completed', 'Failed') DEFAULT 'In Progress',
  error_message TEXT NULL,
  exported_by VARCHAR(50) NULL,
  exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_export_id (export_id),
  INDEX idx_status (status),
  INDEX idx_exported_at (exported_at)
);
```

### 13. hardware_configuration
Hardware device settings.

```sql
CREATE TABLE hardware_configuration (
  id INT PRIMARY KEY AUTO_INCREMENT,
  device_type ENUM('Receipt Printer', 'Barcode Scanner', 'Label Printer', 'Cash Drawer') NOT NULL,
  location_id VARCHAR(50) NULL,
  device_name VARCHAR(100) NOT NULL,
  connection_type ENUM('Network', 'USB', 'Bluetooth') NOT NULL,
  ip_address VARCHAR(45) NULL,
  port INT NULL,
  usb_port VARCHAR(50) NULL,
  configuration_json JSON NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  last_tested_at TIMESTAMP NULL,
  test_status ENUM('Success', 'Failed', 'Not Tested') DEFAULT 'Not Tested',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_device_type (device_type),
  INDEX idx_location_id (location_id)
);
```

### 14. integration_credentials
Third-party service credentials (encrypted).

```sql
CREATE TABLE integration_credentials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  integration_type ENUM('Payment Gateway', 'Email Service', 'SMS Gateway', 'Cloud Storage') NOT NULL,
  provider_name VARCHAR(100) NOT NULL,
  api_key TEXT NULL,
  secret_key TEXT NULL,
  additional_config JSON NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  test_mode BOOLEAN DEFAULT FALSE,
  last_tested_at TIMESTAMP NULL,
  test_status ENUM('Success', 'Failed', 'Not Tested') DEFAULT 'Not Tested',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_integration_type (integration_type),
  INDEX idx_provider_name (provider_name)
);
```

### 15. scheduled_tasks
Scheduled automation tasks.

```sql
CREATE TABLE scheduled_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_type VARCHAR(50) NOT NULL,
  task_name VARCHAR(100) NOT NULL,
  schedule_type ENUM('Hourly', 'Daily', 'Weekly', 'Monthly') NOT NULL,
  schedule_time TIME NULL,
  schedule_day INT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP NULL,
  next_run_at TIMESTAMP NULL,
  last_run_status ENUM('Success', 'Failed', 'Skipped') NULL,
  configuration_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_task_type (task_type),
  INDEX idx_next_run_at (next_run_at)
);
```

---

## Data Relationships

### Primary Relationships
- `receipt_settings.location_id` → `store_locations.id`
- `low_stock_thresholds.product_id` → `products.id`
- `low_stock_thresholds.location_id` → `store_locations.id`
- `tax_configuration.location_id` → `store_locations.id`
- `hardware_configuration.location_id` → `store_locations.id`
- `notification_settings.user_id` → `users.id`
- `display_preferences.user_id` → `users.id`

### Settings Hierarchy
1. **Global Settings** → Apply to all locations/users
2. **Location-Specific Settings** → Override global for specific stores
3. **User-Specific Settings** → Override global/location for individual users

---

## Indexes and Performance

### Critical Indexes
```sql
-- Frequently accessed settings by key
CREATE INDEX idx_settings_key_category ON system_settings(setting_key, category);

-- Active locations lookup
CREATE INDEX idx_locations_active ON store_locations(is_active, store_code);

-- User preferences lookup
CREATE INDEX idx_user_preferences ON display_preferences(user_id, language_code);

-- Notification settings by type
CREATE INDEX idx_notifications_type_active ON notification_settings(notification_type, is_active);

-- Backup history by date
CREATE INDEX idx_backup_history_date ON backup_history(start_time DESC, status);
```

---

## Data Security

### Encrypted Fields
The following fields contain sensitive data and should be encrypted at rest:
- `integration_credentials.api_key`
- `integration_credentials.secret_key`
- `backup_configuration.cloud_access_key`
- `backup_configuration.cloud_secret_key`
- All password fields in hardware/integration configs

### Encryption Strategy
```sql
-- Use AES-256 encryption for sensitive data
-- Store encryption key in secure environment variable
-- Implement key rotation policy every 90 days
```

---

## Default Data Initialization

### Required Default Records
```sql
-- Default company information
INSERT INTO company_information (company_name, business_address, country)
VALUES ('Your Company Name', 'Default Address', 'United States');

-- Default currency (USD)
INSERT INTO currency_settings (currency_code, currency_name, currency_symbol, is_default)
VALUES ('USD', 'US Dollar', '$', TRUE);

-- Default tax configuration
INSERT INTO tax_configuration (tax_system, tax_name, tax_rate, is_default)
VALUES ('GST', 'Goods and Services Tax', 18.00, TRUE);

-- Default backup configuration
INSERT INTO backup_configuration (backup_enabled, backup_schedule, backup_time)
VALUES (TRUE, 'daily', '02:00:00');

-- Default global low stock threshold
INSERT INTO low_stock_thresholds (threshold_quantity, critical_quantity, is_global_default)
VALUES (10, 5, TRUE);
```

---

## Audit Trail

All configuration changes should be logged in the audit_logs table:
```sql
-- Log configuration changes
INSERT INTO audit_logs (
  action, module, entity_type, entity_id,
  performed_by, changes
) VALUES (
  'Update', 'Settings', 'Company Information', '1',
  'admin_user_id', 
  JSON_ARRAY(
    JSON_OBJECT('field', 'company_name', 'old_value', 'Old Name', 'new_value', 'New Name')
  )
);
```

---

## Backup & Restore Considerations

### Tables to Always Include in Backups
- `company_information` (critical business data)
- `store_locations` (multi-location setup)
- `tax_configuration` (compliance data)
- `integration_credentials` (encrypted, but necessary for restore)

### Tables for Selective Export
- `backup_history` (historical data, optional)
- `export_history` (logs, optional)
- `audit_logs` (can be large, selective export recommended)

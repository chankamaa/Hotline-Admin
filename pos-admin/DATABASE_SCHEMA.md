# Database Schema Documentation

## Attendance & Session Management

### 1. attendance_records
Main table for daily attendance records.

```sql
CREATE TABLE attendance_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  clock_in DATETIME NULL,
  clock_out DATETIME NULL,
  total_hours DECIMAL(5,2) DEFAULT 0,
  status ENUM('Present', 'Absent', 'Late', 'Half Day', 'On Leave') DEFAULT 'Absent',
  late_by_minutes INT DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  location VARCHAR(100) DEFAULT 'Main Office',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_employee_date (employee_id, date),
  INDEX idx_employee_id (employee_id),
  INDEX idx_date (date),
  INDEX idx_status (status)
);
```

### 2. attendance_sessions
Tracks individual clock-in/clock-out sessions (supports multiple sessions per day).

```sql
CREATE TABLE attendance_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  attendance_record_id BIGINT NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  session_number INT DEFAULT 1,
  clock_in DATETIME NOT NULL,
  clock_out DATETIME NULL,
  session_duration DECIMAL(5,2) DEFAULT 0,
  location VARCHAR(100) DEFAULT 'Main Office',
  ip_address VARCHAR(45) NULL,
  device_info VARCHAR(255) NULL,
  break_duration DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id) ON DELETE CASCADE,
  INDEX idx_employee_session (employee_id, session_number),
  INDEX idx_clock_in (clock_in),
  INDEX idx_clock_out (clock_out)
);
```

### 3. leave_requests
Manages employee leave applications.

```sql
CREATE TABLE leave_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  leave_type ENUM('Sick Leave', 'Casual Leave', 'Paid Leave', 'Unpaid Leave', 'Maternity Leave', 'Paternity Leave', 'Emergency Leave') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT NOT NULL,
  reason TEXT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by VARCHAR(50) NULL,
  approved_at TIMESTAMP NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_date_range (start_date, end_date)
);
```

### 4. working_hours_config
Configuration for working hours by location/branch.

```sql
CREATE TABLE working_hours_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_id VARCHAR(50) NOT NULL UNIQUE,
  location_name VARCHAR(100) NOT NULL,
  standard_start_time TIME DEFAULT '09:00:00',
  standard_end_time TIME DEFAULT '18:00:00',
  standard_hours DECIMAL(5,2) DEFAULT 8.00,
  grace_period_minutes INT DEFAULT 15,
  late_threshold_minutes INT DEFAULT 15,
  half_day_threshold_hours DECIMAL(5,2) DEFAULT 4.00,
  overtime_threshold_hours DECIMAL(5,2) DEFAULT 8.00,
  break_duration_minutes INT DEFAULT 60,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_location_id (location_id)
);
```

### 5. monthly_attendance_summary
Pre-calculated monthly summaries for performance.

```sql
CREATE TABLE monthly_attendance_summary (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  total_working_days INT NOT NULL,
  days_present INT DEFAULT 0,
  days_absent INT DEFAULT 0,
  days_on_leave INT DEFAULT 0,
  days_late INT DEFAULT 0,
  days_half_day INT DEFAULT 0,
  total_hours_worked DECIMAL(8,2) DEFAULT 0,
  expected_hours DECIMAL(8,2) DEFAULT 0,
  overtime_hours DECIMAL(8,2) DEFAULT 0,
  average_hours_per_day DECIMAL(5,2) DEFAULT 0,
  attendance_rate DECIMAL(5,2) DEFAULT 0,
  punctuality_rate DECIMAL(5,2) DEFAULT 0,
  late_count INT DEFAULT 0,
  earliest_clock_in TIME NULL,
  latest_clock_out TIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_employee_month (employee_id, year, month),
  INDEX idx_year_month (year, month),
  INDEX idx_employee_id (employee_id)
);
```

### 6. employees
Basic employee information (if not already exists).

```sql
CREATE TABLE employees (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NULL,
  department VARCHAR(100) NULL,
  designation VARCHAR(100) NULL,
  location VARCHAR(100) DEFAULT 'Main Office',
  reporting_manager VARCHAR(50) NULL,
  date_of_joining DATE NOT NULL,
  status ENUM('Active', 'Inactive', 'On Leave', 'Terminated') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_department (department),
  INDEX idx_location (location),
  INDEX idx_status (status)
);
```

---

## Stock Management

### 7. stock_entries
Records all incoming stock.

```sql
CREATE TABLE stock_entries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  entry_number VARCHAR(50) UNIQUE NOT NULL,
  product_id BIGINT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  sku VARCHAR(100) NULL,
  category VARCHAR(100) NULL,
  supplier_id BIGINT NULL,
  supplier_name VARCHAR(200) NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  batch_number VARCHAR(100) NULL,
  expiry_date DATE NULL,
  location VARCHAR(100) NOT NULL,
  status ENUM('Pending', 'Verified', 'Completed') DEFAULT 'Pending',
  entry_date DATE NOT NULL,
  verified_by VARCHAR(50) NULL,
  verified_at TIMESTAMP NULL,
  notes TEXT NULL,
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_supplier_id (supplier_id),
  INDEX idx_batch_number (batch_number),
  INDEX idx_expiry_date (expiry_date),
  INDEX idx_entry_date (entry_date),
  INDEX idx_status (status)
);
```

### 8. stock_adjustments
Records stock corrections and adjustments.

```sql
CREATE TABLE stock_adjustments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  adjustment_number VARCHAR(50) UNIQUE NOT NULL,
  product_id BIGINT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  location VARCHAR(100) NOT NULL,
  adjustment_type ENUM('Increase', 'Decrease') NOT NULL,
  quantity INT NOT NULL,
  reason_type ENUM(
    'Damaged Stock',
    'Expired Items',
    'Theft/Loss',
    'Counting Error',
    'System Correction',
    'Return from Customer',
    'Quality Issue',
    'Found Stock',
    'Breakage',
    'Other'
  ) NOT NULL,
  reason_description TEXT NULL,
  adjusted_by VARCHAR(50) NOT NULL,
  adjustment_date DATE NOT NULL,
  approved_by VARCHAR(50) NULL,
  approved_at TIMESTAMP NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_adjustment_type (adjustment_type),
  INDEX idx_adjustment_date (adjustment_date),
  INDEX idx_reason_type (reason_type)
);
```

### 9. stock_transfers
Manages stock movement between locations.

```sql
CREATE TABLE stock_transfers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  transfer_number VARCHAR(50) UNIQUE NOT NULL,
  product_id BIGINT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  from_location VARCHAR(100) NOT NULL,
  to_location VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'In Transit', 'Completed', 'Cancelled') DEFAULT 'Pending',
  requested_by VARCHAR(50) NOT NULL,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by VARCHAR(50) NULL,
  approved_at TIMESTAMP NULL,
  dispatched_by VARCHAR(50) NULL,
  dispatched_at TIMESTAMP NULL,
  received_by VARCHAR(50) NULL,
  received_at TIMESTAMP NULL,
  rejection_reason TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_from_location (from_location),
  INDEX idx_to_location (to_location),
  INDEX idx_status (status),
  INDEX idx_requested_at (requested_at)
);
```

### 10. stock_movements
Unified log of all stock transactions.

```sql
CREATE TABLE stock_movements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  movement_type ENUM(
    'Entry',
    'Adjustment Increase',
    'Adjustment Decrease',
    'Transfer Out',
    'Transfer In',
    'Sale',
    'Return'
  ) NOT NULL,
  reference_number VARCHAR(50) NOT NULL,
  product_id BIGINT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  location VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  quantity_change INT NOT NULL,
  balance_after INT NOT NULL,
  performed_by VARCHAR(50) NOT NULL,
  movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT NULL,
  INDEX idx_movement_type (movement_type),
  INDEX idx_product_id (product_id),
  INDEX idx_location (location),
  INDEX idx_movement_date (movement_date),
  INDEX idx_reference_number (reference_number)
);
```

### 11. audit_logs
Complete audit trail for all operations.

```sql
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action ENUM('Create', 'Update', 'Delete', 'Approve', 'Reject', 'Verify', 'Complete') NOT NULL,
  module VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50) NOT NULL,
  entity_name VARCHAR(200) NULL,
  performed_by VARCHAR(50) NOT NULL,
  user_role VARCHAR(50) NULL,
  ip_address VARCHAR(45) NULL,
  changes JSON NULL,
  description TEXT NULL,
  INDEX idx_module (module),
  INDEX idx_entity_type (entity_type),
  INDEX idx_entity_id (entity_id),
  INDEX idx_performed_by (performed_by),
  INDEX idx_timestamp (timestamp)
);
```

---

## Relationships

### Attendance Module Relationships
- `attendance_sessions.attendance_record_id` → `attendance_records.id`
- `attendance_records.employee_id` → `employees.id`
- `leave_requests.employee_id` → `employees.id`
- `monthly_attendance_summary.employee_id` → `employees.id`

### Stock Module Relationships
- `stock_entries.product_id` → `products.id` (external table)
- `stock_entries.supplier_id` → `suppliers.id` (external table)
- `stock_adjustments.product_id` → `products.id`
- `stock_transfers.product_id` → `products.id`
- `stock_movements.product_id` → `products.id`

---

## Indexes Strategy

### Performance Optimization
1. **Composite Indexes**: Used for common query patterns
   - `(employee_id, date)` for daily attendance queries
   - `(year, month)` for monthly reports
   - `(product_id, location)` for stock location queries

2. **Date Indexes**: Critical for time-based filtering
   - All date columns indexed for range queries
   - Timestamp columns for audit trails

3. **Foreign Key Indexes**: Ensure referential integrity
   - All FK columns indexed automatically

4. **Status Indexes**: For filtering by workflow states
   - Enable fast status-based queries

---

## Data Integrity Rules

### Constraints
1. **Unique Constraints**
   - One attendance record per employee per day
   - Unique entry/adjustment/transfer numbers
   - One monthly summary per employee per month

2. **Check Constraints** (if supported)
   ```sql
   ALTER TABLE attendance_records
   ADD CONSTRAINT chk_hours CHECK (total_hours >= 0 AND total_hours <= 24);
   
   ALTER TABLE stock_entries
   ADD CONSTRAINT chk_quantity CHECK (quantity > 0);
   ```

3. **Referential Integrity**
   - CASCADE DELETE for dependent records
   - RESTRICT DELETE for critical references

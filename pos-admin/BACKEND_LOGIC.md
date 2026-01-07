# Backend Logic Documentation

## Attendance & Session Management

### 1. Clock-In Logic

#### Process Flow
```javascript
async function clockIn(employeeId, location, deviceInfo, ipAddress) {
  const currentDateTime = new Date();
  const currentDate = formatDate(currentDateTime);
  const currentTime = formatTime(currentDateTime);
  
  // Step 1: Get working hours configuration for location
  const config = await getWorkingHoursConfig(location);
  
  // Step 2: Check if attendance record exists for today
  let attendanceRecord = await getAttendanceRecord(employeeId, currentDate);
  
  if (!attendanceRecord) {
    // Create new attendance record
    attendanceRecord = await createAttendanceRecord({
      employee_id: employeeId,
      date: currentDate,
      clock_in: currentDateTime,
      status: 'Present',
      location: location
    });
  } else {
    // Update existing record with clock-in time
    attendanceRecord = await updateAttendanceRecord(attendanceRecord.id, {
      clock_in: currentDateTime,
      status: determineStatus(currentDateTime, config)
    });
  }
  
  // Step 3: Create session record
  const sessionNumber = await getNextSessionNumber(attendanceRecord.id);
  await createAttendanceSession({
    attendance_record_id: attendanceRecord.id,
    employee_id: employeeId,
    session_number: sessionNumber,
    clock_in: currentDateTime,
    location: location,
    ip_address: ipAddress,
    device_info: deviceInfo
  });
  
  // Step 4: Log audit trail
  await createAuditLog({
    action: 'Create',
    module: 'Attendance',
    entity_type: 'Clock-In',
    entity_id: attendanceRecord.id,
    performed_by: employeeId,
    description: `Employee clocked in at ${location}`,
    ip_address: ipAddress
  });
  
  return {
    success: true,
    attendanceRecordId: attendanceRecord.id,
    clockInTime: currentDateTime
  };
}
```

#### Late Detection Logic
```javascript
function determineStatus(clockInTime, config) {
  const scheduledStartTime = parseTime(config.standard_start_time);
  const graceMinutes = config.grace_period_minutes;
  const lateThresholdMinutes = config.late_threshold_minutes;
  
  const minutesLate = getMinutesDifference(scheduledStartTime, clockInTime);
  
  if (minutesLate <= graceMinutes) {
    return 'Present';
  } else if (minutesLate > graceMinutes && minutesLate <= lateThresholdMinutes) {
    return 'Late';
  } else {
    return 'Late';
  }
}
```

---

### 2. Clock-Out Logic

#### Process Flow
```javascript
async function clockOut(employeeId, location, notes) {
  const currentDateTime = new Date();
  const currentDate = formatDate(currentDateTime);
  
  // Step 1: Get attendance record for today
  const attendanceRecord = await getAttendanceRecord(employeeId, currentDate);
  
  if (!attendanceRecord || !attendanceRecord.clock_in) {
    throw new Error('No clock-in record found for today');
  }
  
  // Step 2: Get active session
  const activeSession = await getActiveSession(attendanceRecord.id);
  
  if (!activeSession) {
    throw new Error('No active session found');
  }
  
  // Step 3: Calculate session duration
  const sessionDuration = calculateHoursDifference(
    activeSession.clock_in,
    currentDateTime
  );
  
  // Step 4: Update session record
  await updateAttendanceSession(activeSession.id, {
    clock_out: currentDateTime,
    session_duration: sessionDuration
  });
  
  // Step 5: Get working hours config
  const config = await getWorkingHoursConfig(location);
  
  // Step 6: Calculate total hours worked (all sessions)
  const allSessions = await getAllSessionsForRecord(attendanceRecord.id);
  const totalHours = allSessions.reduce(
    (sum, session) => sum + (session.session_duration || 0),
    0
  );
  
  // Step 7: Subtract break duration
  const breakHours = config.break_duration_minutes / 60;
  const netHours = Math.max(0, totalHours - breakHours);
  
  // Step 8: Calculate overtime
  const overtimeHours = calculateOvertime(netHours, config);
  
  // Step 9: Determine final status
  const finalStatus = determineFinalStatus(
    netHours,
    attendanceRecord.clock_in,
    config
  );
  
  // Step 10: Update attendance record
  await updateAttendanceRecord(attendanceRecord.id, {
    clock_out: currentDateTime,
    total_hours: netHours,
    overtime_hours: overtimeHours,
    status: finalStatus,
    notes: notes
  });
  
  // Step 11: Log audit trail
  await createAuditLog({
    action: 'Update',
    module: 'Attendance',
    entity_type: 'Clock-Out',
    entity_id: attendanceRecord.id,
    performed_by: employeeId,
    description: `Employee clocked out. Total hours: ${netHours}`,
    changes: [{
      field: 'clock_out',
      new_value: currentDateTime
    }]
  });
  
  return {
    success: true,
    totalHours: netHours,
    overtimeHours: overtimeHours,
    status: finalStatus
  };
}
```

#### Working Hours Calculation
```javascript
function calculateHoursDifference(startTime, endTime) {
  const milliseconds = endTime - startTime;
  const hours = milliseconds / (1000 * 60 * 60);
  return parseFloat(hours.toFixed(2));
}

function calculateOvertime(totalHours, config) {
  const standardHours = config.standard_hours;
  const overtimeThreshold = config.overtime_threshold_hours;
  
  if (totalHours > overtimeThreshold) {
    return parseFloat((totalHours - overtimeThreshold).toFixed(2));
  }
  
  return 0;
}
```

#### Final Status Determination
```javascript
function determineFinalStatus(totalHours, clockInTime, config) {
  const scheduledStartTime = parseTime(config.standard_start_time);
  const halfDayThreshold = config.half_day_threshold_hours;
  const lateThresholdMinutes = config.late_threshold_minutes;
  
  const minutesLate = getMinutesDifference(scheduledStartTime, clockInTime);
  
  // Check if half-day
  if (totalHours < halfDayThreshold) {
    return 'Half Day';
  }
  
  // Check if late
  if (minutesLate > lateThresholdMinutes) {
    return 'Late';
  }
  
  return 'Present';
}
```

---

### 3. Monthly Summary Generation

#### Scheduled Job (Run at end of month)
```javascript
async function generateMonthlySummaries(year, month) {
  const employees = await getAllActiveEmployees();
  const workingDays = calculateWorkingDays(year, month);
  
  for (const employee of employees) {
    // Get all attendance records for the month
    const records = await getMonthlyAttendanceRecords(
      employee.id,
      year,
      month
    );
    
    // Calculate statistics
    const daysPresent = records.filter(r => r.status === 'Present').length;
    const daysAbsent = records.filter(r => r.status === 'Absent').length;
    const daysLate = records.filter(r => r.status === 'Late').length;
    const daysHalfDay = records.filter(r => r.status === 'Half Day').length;
    const daysOnLeave = records.filter(r => r.status === 'On Leave').length;
    
    const totalHours = records.reduce(
      (sum, r) => sum + (r.total_hours || 0),
      0
    );
    
    const overtimeHours = records.reduce(
      (sum, r) => sum + (r.overtime_hours || 0),
      0
    );
    
    const config = await getWorkingHoursConfig(employee.location);
    const expectedHours = workingDays * config.standard_hours;
    
    const avgHoursPerDay = daysPresent > 0
      ? parseFloat((totalHours / daysPresent).toFixed(2))
      : 0;
    
    const attendanceRate = workingDays > 0
      ? parseFloat(((daysPresent / workingDays) * 100).toFixed(2))
      : 0;
    
    const punctualityRate = daysPresent > 0
      ? parseFloat((((daysPresent - daysLate) / daysPresent) * 100).toFixed(2))
      : 0;
    
    const earliestClockIn = getEarliestTime(records.map(r => r.clock_in));
    const latestClockOut = getLatestTime(records.map(r => r.clock_out));
    
    // Create or update summary
    await upsertMonthlySummary({
      employee_id: employee.id,
      employee_name: employee.name,
      year: year,
      month: month,
      total_working_days: workingDays,
      days_present: daysPresent,
      days_absent: daysAbsent,
      days_on_leave: daysOnLeave,
      days_late: daysLate,
      days_half_day: daysHalfDay,
      total_hours_worked: totalHours,
      expected_hours: expectedHours,
      overtime_hours: overtimeHours,
      average_hours_per_day: avgHoursPerDay,
      attendance_rate: attendanceRate,
      punctuality_rate: punctualityRate,
      late_count: daysLate,
      earliest_clock_in: earliestClockIn,
      latest_clock_out: latestClockOut
    });
  }
  
  console.log(`Monthly summaries generated for ${year}-${month}`);
}
```

---

### 4. Report Generation

#### Daily Report
```javascript
async function generateDailyReport(date, filters = {}) {
  let query = `
    SELECT 
      ar.employee_id,
      ar.employee_name,
      ar.clock_in,
      ar.clock_out,
      ar.total_hours,
      ar.status,
      ar.late_by_minutes,
      ar.overtime_hours,
      ar.location,
      ar.notes
    FROM attendance_records ar
    WHERE ar.date = ?
  `;
  
  const params = [date];
  
  // Apply filters
  if (filters.location) {
    query += ' AND ar.location = ?';
    params.push(filters.location);
  }
  
  if (filters.status) {
    query += ' AND ar.status = ?';
    params.push(filters.status);
  }
  
  if (filters.employeeId) {
    query += ' AND ar.employee_id = ?';
    params.push(filters.employeeId);
  }
  
  query += ' ORDER BY ar.employee_name';
  
  const records = await db.query(query, params);
  
  // Calculate summary stats
  const summary = {
    totalEmployees: records.length,
    present: records.filter(r => r.status === 'Present').length,
    absent: records.filter(r => r.status === 'Absent').length,
    late: records.filter(r => r.status === 'Late').length,
    onLeave: records.filter(r => r.status === 'On Leave').length,
    totalHours: records.reduce((sum, r) => sum + (r.total_hours || 0), 0),
    avgHours: records.length > 0
      ? (records.reduce((sum, r) => sum + (r.total_hours || 0), 0) / records.length).toFixed(2)
      : 0
  };
  
  return {
    date: date,
    summary: summary,
    records: records
  };
}
```

#### Weekly Report
```javascript
async function generateWeeklyReport(startDate, endDate, employeeId = null) {
  let query = `
    SELECT 
      ar.date,
      ar.employee_id,
      ar.employee_name,
      ar.status,
      ar.total_hours,
      ar.overtime_hours
    FROM attendance_records ar
    WHERE ar.date BETWEEN ? AND ?
  `;
  
  const params = [startDate, endDate];
  
  if (employeeId) {
    query += ' AND ar.employee_id = ?';
    params.push(employeeId);
  }
  
  query += ' ORDER BY ar.employee_id, ar.date';
  
  const records = await db.query(query, params);
  
  // Group by employee
  const employeeData = {};
  
  records.forEach(record => {
    if (!employeeData[record.employee_id]) {
      employeeData[record.employee_id] = {
        employeeId: record.employee_id,
        employeeName: record.employee_name,
        dailyRecords: [],
        totalDays: 0,
        daysPresent: 0,
        daysAbsent: 0,
        totalHours: 0,
        overtimeHours: 0
      };
    }
    
    const empData = employeeData[record.employee_id];
    empData.dailyRecords.push(record);
    empData.totalDays++;
    
    if (record.status === 'Present' || record.status === 'Late') {
      empData.daysPresent++;
    } else if (record.status === 'Absent') {
      empData.daysAbsent++;
    }
    
    empData.totalHours += (record.total_hours || 0);
    empData.overtimeHours += (record.overtime_hours || 0);
  });
  
  return {
    startDate: startDate,
    endDate: endDate,
    employees: Object.values(employeeData)
  };
}
```

#### Monthly Report
```javascript
async function generateMonthlyReport(year, month) {
  const summaries = await db.query(`
    SELECT * FROM monthly_attendance_summary
    WHERE year = ? AND month = ?
    ORDER BY attendance_rate DESC
  `, [year, month]);
  
  // Calculate aggregate statistics
  const totalEmployees = summaries.length;
  const avgAttendanceRate = summaries.length > 0
    ? (summaries.reduce((sum, s) => sum + s.attendance_rate, 0) / summaries.length).toFixed(2)
    : 0;
  
  const totalHoursWorked = summaries.reduce(
    (sum, s) => sum + s.total_hours_worked,
    0
  );
  
  const totalOvertimeHours = summaries.reduce(
    (sum, s) => sum + s.overtime_hours,
    0
  );
  
  const totalLateCount = summaries.reduce(
    (sum, s) => sum + s.late_count,
    0
  );
  
  // Best performers (top 5 by attendance rate)
  const bestPerformers = summaries
    .slice(0, 5)
    .map(s => ({
      employeeId: s.employee_id,
      employeeName: s.employee_name,
      attendanceRate: s.attendance_rate
    }));
  
  // Most overtime (top 5)
  const mostOvertime = summaries
    .sort((a, b) => b.overtime_hours - a.overtime_hours)
    .slice(0, 5)
    .map(s => ({
      employeeId: s.employee_id,
      employeeName: s.employee_name,
      overtimeHours: s.overtime_hours
    }));
  
  return {
    year: year,
    month: month,
    statistics: {
      totalEmployees: totalEmployees,
      avgAttendanceRate: avgAttendanceRate,
      totalHoursWorked: totalHoursWorked,
      totalOvertimeHours: totalOvertimeHours,
      totalLateCount: totalLateCount
    },
    bestPerformers: bestPerformers,
    mostOvertime: mostOvertime,
    allSummaries: summaries
  };
}
```

---

### 5. Excel Export

#### Export Daily Attendance
```javascript
async function exportDailyAttendanceExcel(date, filters = {}) {
  const report = await generateDailyReport(date, filters);
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Daily Attendance');
  
  // Set title
  worksheet.mergeCells('A1:I1');
  worksheet.getCell('A1').value = `Daily Attendance Report - ${date}`;
  worksheet.getCell('A1').font = { bold: true, size: 14 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
  // Add summary
  worksheet.addRow([]);
  worksheet.addRow(['Summary Statistics']);
  worksheet.addRow(['Total Employees:', report.summary.totalEmployees]);
  worksheet.addRow(['Present:', report.summary.present]);
  worksheet.addRow(['Absent:', report.summary.absent]);
  worksheet.addRow(['Late:', report.summary.late]);
  worksheet.addRow(['On Leave:', report.summary.onLeave]);
  worksheet.addRow(['Total Hours:', report.summary.totalHours]);
  worksheet.addRow([]);
  
  // Add headers
  worksheet.addRow([
    'Employee ID',
    'Employee Name',
    'Clock In',
    'Clock Out',
    'Total Hours',
    'Status',
    'Late By (min)',
    'Overtime (h)',
    'Location',
    'Notes'
  ]).font = { bold: true };
  
  // Add data
  report.records.forEach(record => {
    worksheet.addRow([
      record.employee_id,
      record.employee_name,
      formatDateTime(record.clock_in),
      formatDateTime(record.clock_out),
      record.total_hours,
      record.status,
      record.late_by_minutes,
      record.overtime_hours,
      record.location,
      record.notes || ''
    ]);
  });
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  return {
    buffer: buffer,
    filename: `daily_attendance_${date}.xlsx`
  };
}
```

#### Export Monthly Summary
```javascript
async function exportMonthlySummaryExcel(year, month) {
  const report = await generateMonthlyReport(year, month);
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Monthly Summary');
  
  // Title
  worksheet.mergeCells('A1:K1');
  worksheet.getCell('A1').value = `Monthly Attendance Summary - ${month}/${year}`;
  worksheet.getCell('A1').font = { bold: true, size: 14 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
  // Summary stats
  worksheet.addRow([]);
  worksheet.addRow(['Overall Statistics']);
  worksheet.addRow(['Total Employees:', report.statistics.totalEmployees]);
  worksheet.addRow(['Avg Attendance Rate:', `${report.statistics.avgAttendanceRate}%`]);
  worksheet.addRow(['Total Hours Worked:', report.statistics.totalHoursWorked]);
  worksheet.addRow(['Total Overtime:', report.statistics.totalOvertimeHours]);
  worksheet.addRow([]);
  
  // Headers
  worksheet.addRow([
    'Employee ID',
    'Employee Name',
    'Present',
    'Absent',
    'Leaves',
    'Late Count',
    'Total Hours',
    'Avg Hours/Day',
    'Overtime',
    'Attendance Rate',
    'Punctuality Rate'
  ]).font = { bold: true };
  
  // Data
  report.allSummaries.forEach(summary => {
    const row = worksheet.addRow([
      summary.employee_id,
      summary.employee_name,
      summary.days_present,
      summary.days_absent,
      summary.days_on_leave,
      summary.late_count,
      summary.total_hours_worked,
      summary.average_hours_per_day,
      summary.overtime_hours,
      `${summary.attendance_rate}%`,
      `${summary.punctuality_rate}%`
    ]);
    
    // Color code attendance rate
    const attendanceCell = row.getCell(10);
    if (summary.attendance_rate >= 95) {
      attendanceCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF90EE90' }
      };
    } else if (summary.attendance_rate < 75) {
      attendanceCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFCCCB' }
      };
    }
  });
  
  // Auto-fit
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  
  return {
    buffer: buffer,
    filename: `monthly_summary_${year}_${month}.xlsx`
  };
}
```

---

## Stock Management

### 1. Stock Entry Process

```javascript
async function createStockEntry(entryData, userId) {
  const entryNumber = await generateEntryNumber();
  const totalValue = entryData.quantity * entryData.unit_price;
  
  // Step 1: Create stock entry record
  const entry = await db.query(`
    INSERT INTO stock_entries (
      entry_number, product_id, product_name, sku, category,
      supplier_id, supplier_name, quantity, unit_price, total_value,
      batch_number, expiry_date, location, status, entry_date,
      created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    entryNumber, entryData.product_id, entryData.product_name,
    entryData.sku, entryData.category, entryData.supplier_id,
    entryData.supplier_name, entryData.quantity, entryData.unit_price,
    totalValue, entryData.batch_number, entryData.expiry_date,
    entryData.location, 'Pending', new Date(), userId
  ]);
  
  // Step 2: Log stock movement
  await createStockMovement({
    movement_type: 'Entry',
    reference_number: entryNumber,
    product_id: entryData.product_id,
    product_name: entryData.product_name,
    location: entryData.location,
    quantity: entryData.quantity,
    quantity_change: entryData.quantity,
    balance_after: await getStockBalance(entryData.product_id, entryData.location) + entryData.quantity,
    performed_by: userId
  });
  
  // Step 3: Create audit log
  await createAuditLog({
    action: 'Create',
    module: 'Stock',
    entity_type: 'Stock Entry',
    entity_id: entryNumber,
    entity_name: entryData.product_name,
    performed_by: userId,
    description: `Created stock entry for ${entryData.quantity} units`
  });
  
  return { success: true, entryNumber: entryNumber };
}
```

### 2. Stock Adjustment Logic

```javascript
async function createStockAdjustment(adjustmentData, userId) {
  const adjustmentNumber = await generateAdjustmentNumber();
  
  // Step 1: Get current stock balance
  const currentBalance = await getStockBalance(
    adjustmentData.product_id,
    adjustmentData.location
  );
  
  // Step 2: Calculate new balance
  const quantityChange = adjustmentData.adjustment_type === 'Increase'
    ? adjustmentData.quantity
    : -adjustmentData.quantity;
  
  const newBalance = currentBalance + quantityChange;
  
  if (newBalance < 0) {
    throw new Error('Insufficient stock for decrease adjustment');
  }
  
  // Step 3: Create adjustment record
  await db.query(`
    INSERT INTO stock_adjustments (
      adjustment_number, product_id, product_name, location,
      adjustment_type, quantity, reason_type, reason_description,
      adjusted_by, adjustment_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    adjustmentNumber, adjustmentData.product_id, adjustmentData.product_name,
    adjustmentData.location, adjustmentData.adjustment_type,
    adjustmentData.quantity, adjustmentData.reason_type,
    adjustmentData.reason_description, userId, new Date()
  ]);
  
  // Step 4: Update stock balance
  await updateStockBalance(
    adjustmentData.product_id,
    adjustmentData.location,
    newBalance
  );
  
  // Step 5: Log movement
  await createStockMovement({
    movement_type: adjustmentData.adjustment_type === 'Increase'
      ? 'Adjustment Increase'
      : 'Adjustment Decrease',
    reference_number: adjustmentNumber,
    product_id: adjustmentData.product_id,
    product_name: adjustmentData.product_name,
    location: adjustmentData.location,
    quantity: adjustmentData.quantity,
    quantity_change: quantityChange,
    balance_after: newBalance,
    performed_by: userId,
    notes: `Reason: ${adjustmentData.reason_type}`
  });
  
  // Step 6: Audit log
  await createAuditLog({
    action: 'Create',
    module: 'Stock',
    entity_type: 'Stock Adjustment',
    entity_id: adjustmentNumber,
    entity_name: adjustmentData.product_name,
    performed_by: userId,
    changes: [{
      field: 'quantity',
      old_value: currentBalance,
      new_value: newBalance
    }]
  });
  
  return { success: true, adjustmentNumber: adjustmentNumber };
}
```

### 3. Stock Transfer Workflow

```javascript
async function createStockTransfer(transferData, userId) {
  const transferNumber = await generateTransferNumber();
  
  // Validate stock availability
  const availableStock = await getStockBalance(
    transferData.product_id,
    transferData.from_location
  );
  
  if (availableStock < transferData.quantity) {
    throw new Error('Insufficient stock at source location');
  }
  
  // Create transfer record
  await db.query(`
    INSERT INTO stock_transfers (
      transfer_number, product_id, product_name,
      from_location, to_location, quantity, status,
      requested_by, requested_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
  `, [
    transferNumber, transferData.product_id, transferData.product_name,
    transferData.from_location, transferData.to_location,
    transferData.quantity, userId, new Date()
  ]);
  
  // Audit log
  await createAuditLog({
    action: 'Create',
    module: 'Stock',
    entity_type: 'Stock Transfer',
    entity_id: transferNumber,
    performed_by: userId,
    description: `Transfer request created: ${transferData.quantity} units from ${transferData.from_location} to ${transferData.to_location}`
  });
  
  return { success: true, transferNumber: transferNumber };
}

async function approveStockTransfer(transferNumber, approverId) {
  // Update status
  await db.query(`
    UPDATE stock_transfers
    SET status = 'Approved', approved_by = ?, approved_at = ?
    WHERE transfer_number = ?
  `, [approverId, new Date(), transferNumber]);
  
  // Audit log
  await createAuditLog({
    action: 'Approve',
    module: 'Stock',
    entity_type: 'Stock Transfer',
    entity_id: transferNumber,
    performed_by: approverId
  });
}

async function completeStockTransfer(transferNumber, receiverId) {
  const transfer = await getTransferByNumber(transferNumber);
  
  // Update stock balances
  await decreaseStock(
    transfer.product_id,
    transfer.from_location,
    transfer.quantity
  );
  
  await increaseStock(
    transfer.product_id,
    transfer.to_location,
    transfer.quantity
  );
  
  // Update transfer status
  await db.query(`
    UPDATE stock_transfers
    SET status = 'Completed', received_by = ?, received_at = ?
    WHERE transfer_number = ?
  `, [receiverId, new Date(), transferNumber]);
  
  // Log movements
  await createStockMovement({
    movement_type: 'Transfer Out',
    reference_number: transferNumber,
    product_id: transfer.product_id,
    product_name: transfer.product_name,
    location: transfer.from_location,
    quantity: transfer.quantity,
    quantity_change: -transfer.quantity,
    balance_after: await getStockBalance(transfer.product_id, transfer.from_location),
    performed_by: receiverId
  });
  
  await createStockMovement({
    movement_type: 'Transfer In',
    reference_number: transferNumber,
    product_id: transfer.product_id,
    product_name: transfer.product_name,
    location: transfer.to_location,
    quantity: transfer.quantity,
    quantity_change: transfer.quantity,
    balance_after: await getStockBalance(transfer.product_id, transfer.to_location),
    performed_by: receiverId
  });
}
```

---

## Utility Functions

### Date/Time Helpers
```javascript
function formatDate(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatTime(date) {
  return date.toTimeString().split(' ')[0]; // HH:MM:SS
}

function formatDateTime(date) {
  return date ? date.toISOString().replace('T', ' ').substr(0, 19) : '';
}

function parseTime(timeString) {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds || 0, 0);
  return date;
}

function getMinutesDifference(startTime, endTime) {
  const milliseconds = endTime - startTime;
  return Math.floor(milliseconds / (1000 * 60));
}

function calculateWorkingDays(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  
  return workingDays;
}
```

### Number Generators
```javascript
async function generateEntryNumber() {
  const prefix = 'SE';
  const year = new Date().getFullYear();
  const lastEntry = await db.query(
    'SELECT entry_number FROM stock_entries ORDER BY id DESC LIMIT 1'
  );
  
  let sequence = 1;
  if (lastEntry && lastEntry.entry_number) {
    const lastSequence = parseInt(lastEntry.entry_number.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `${prefix}-${year}-${sequence.toString().padStart(6, '0')}`;
}

// Similar for adjustment, transfer numbers...
```

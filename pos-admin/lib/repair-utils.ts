type RepairStatus = 'received' | 'in-progress' | 'waiting-parts' | 'ready' | 'delivered';
type RepairPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Generate a unique job number for repair jobs
 */
export function generateJobNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `REP-${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
}

/**
 * Calculate total cost including parts and labor
 */
export function calculateTotalCost(
  parts: Array<{ cost: number; quantity: number }>,
  laborCost: number
): number {
  const partsCost = parts.reduce((sum, part) => sum + part.cost * part.quantity, 0);
  return partsCost + laborCost;
}

/**
 * Get status workflow - determines valid next statuses
 */
export function getValidNextStatuses(currentStatus: RepairStatus): RepairStatus[] {
  const workflow: Record<RepairStatus, RepairStatus[]> = {
    received: ['in-progress', 'waiting-parts'],
    'in-progress': ['waiting-parts', 'ready'],
    'waiting-parts': ['in-progress'],
    ready: ['delivered'],
    delivered: [],
  };

  return workflow[currentStatus] || [];
}

/**
 * Check if status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: RepairStatus,
  newStatus: RepairStatus
): boolean {
  const validStatuses = getValidNextStatuses(currentStatus);
  return validStatuses.includes(newStatus);
}

/**
 * Get status display information
 */
export function getStatusInfo(status: RepairStatus): {
  label: string;
  description: string;
  color: string;
  icon: string;
} {
  const statusMap = {
    received: {
      label: 'Received',
      description: 'Job created and awaiting technician assignment',
      color: 'gray',
      icon: 'inbox',
    },
    'in-progress': {
      label: 'In Progress',
      description: 'Technician is actively working on the repair',
      color: 'blue',
      icon: 'wrench',
    },
    'waiting-parts': {
      label: 'Waiting for Parts',
      description: 'Parts have been ordered and repair is on hold',
      color: 'orange',
      icon: 'clock',
    },
    ready: {
      label: 'Ready for Pickup',
      description: 'Repair completed and device ready for customer',
      color: 'green',
      icon: 'check-circle',
    },
    delivered: {
      label: 'Delivered',
      description: 'Customer has collected the device',
      color: 'purple',
      icon: 'package',
    },
  };

  return statusMap[status];
}

/**
 * Get priority level information
 */
export function getPriorityInfo(priority: RepairPriority): {
  label: string;
  color: string;
  urgencyLevel: number;
} {
  const priorityMap = {
    low: { label: 'Low', color: 'gray', urgencyLevel: 1 },
    medium: { label: 'Medium', color: 'blue', urgencyLevel: 2 },
    high: { label: 'High', color: 'orange', urgencyLevel: 3 },
    urgent: { label: 'Urgent', color: 'red', urgencyLevel: 4 },
  };

  return priorityMap[priority];
}

/**
 * Calculate expected completion time based on priority
 */
export function calculateExpectedCompletion(
  priority: RepairPriority,
  createdAt: Date
): Date {
  const hoursMap = {
    low: 72, // 3 days
    medium: 48, // 2 days
    high: 24, // 1 day
    urgent: 4, // 4 hours
  };

  const hours = hoursMap[priority];
  const completionDate = new Date(createdAt);
  completionDate.setHours(completionDate.getHours() + hours);

  return completionDate;
}

/**
 * Generate customer notification message based on status
 */
export function generateCustomerNotification(
  status: RepairStatus,
  jobNumber: string,
  customerName: string,
  device: string
): string {
  const messages: Record<RepairStatus, string> = {
    received: `Hello ${customerName}, your ${device} (Job #${jobNumber}) has been received. Our technician will begin diagnosis shortly.`,
    'in-progress': `Hello ${customerName}, our technician has started working on your ${device} (Job #${jobNumber}). We'll keep you updated.`,
    'waiting-parts': `Hello ${customerName}, we're waiting for parts to arrive for your ${device} (Job #${jobNumber}). We'll notify you once work resumes.`,
    ready: `Hello ${customerName}, great news! Your ${device} (Job #${jobNumber}) is ready for pickup. Please collect it at your convenience.`,
    delivered: `Thank you ${customerName} for choosing our service! Your ${device} (Job #${jobNumber}) has been delivered. We hope you're satisfied with the repair.`,
  };

  return messages[status];
}

/**
 * Generate print slip data for customer receiving
 */
export function generateReceivingSlip(repairJob: {
  jobNumber: string;
  customerName: string;
  customerPhone: string;
  device: string;
  issue: string;
  estimatedCost: number;
  expectedCompletionDate?: Date;
  createdAt: Date;
}): string {
  const slip = `
========================================
      REPAIR RECEIVING SLIP
========================================

Job Number: ${repairJob.jobNumber}
Date: ${repairJob.createdAt.toLocaleString()}

Customer Information:
Name: ${repairJob.customerName}
Phone: ${repairJob.customerPhone}

Device Information:
Device: ${repairJob.device}
Issue: ${repairJob.issue}

Repair Details:
Estimated Cost: $${repairJob.estimatedCost.toFixed(2)}
Expected Completion: ${
    repairJob.expectedCompletionDate
      ? repairJob.expectedCompletionDate.toLocaleDateString()
      : 'TBD'
  }

Terms & Conditions:
1. Parts not covered under warranty
2. Estimated costs may vary based on diagnosis
3. Unclaimed devices after 30 days may be disposed
4. Customer is responsible for data backup

Customer Signature: ___________________

Date: _________________________________

========================================
  `;

  return slip;
}

/**
 * Validate IMEI number format
 */
export function validateIMEI(imei: string): boolean {
  // IMEI should be 15 digits
  if (!/^\d{15}$/.test(imei)) {
    return false;
  }

  // Luhn algorithm check
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imei[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

/**
 * Auto-assign technician based on workload and specialization
 */
export function autoAssignTechnician(
  deviceType: string,
  technicians: Array<{
    id: string;
    name: string;
    specialization: string[];
    workloadCapacity: number;
    activeJobs: number;
  }>
): { technicianId: string; technicianName: string } | null {
  // Filter technicians by specialization
  const qualified = technicians.filter((tech) =>
    tech.specialization.some((spec) => deviceType.includes(spec))
  );

  // If no specialist, use all technicians
  const candidates = qualified.length > 0 ? qualified : technicians;

  // Sort by workload (ascending) - assign to least busy
  const sorted = candidates
    .filter((tech) => tech.workloadCapacity < 90) // Don't assign if over 90% capacity
    .sort((a, b) => a.workloadCapacity - b.workloadCapacity);

  if (sorted.length === 0) {
    return null; // No available technician
  }

  const assigned = sorted[0];
  return {
    technicianId: assigned.id,
    technicianName: assigned.name,
  };
}

/**
 * Calculate repair duration in hours
 */
export function calculateRepairDuration(startDate: Date, endDate: Date): number {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 10) / 10; // Round to 1 decimal place
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Get repair job statistics
 */
export function calculateRepairStats(repairs: Array<{
  status: RepairStatus;
  priority: RepairPriority;
  estimatedCost: number;
  createdAt: Date;
  completedAt?: Date;
}>) {
  return {
    total: repairs.length,
    byStatus: {
      received: repairs.filter((r) => r.status === 'received').length,
      inProgress: repairs.filter((r) => r.status === 'in-progress').length,
      waitingParts: repairs.filter((r) => r.status === 'waiting-parts').length,
      ready: repairs.filter((r) => r.status === 'ready').length,
      delivered: repairs.filter((r) => r.status === 'delivered').length,
    },
    byPriority: {
      low: repairs.filter((r) => r.priority === 'low').length,
      medium: repairs.filter((r) => r.priority === 'medium').length,
      high: repairs.filter((r) => r.priority === 'high').length,
      urgent: repairs.filter((r) => r.priority === 'urgent').length,
    },
    totalRevenue: repairs
      .filter((r) => r.status === 'delivered')
      .reduce((sum, r) => sum + r.estimatedCost, 0),
    averageRepairTime:
      repairs
        .filter((r) => r.completedAt)
        .reduce((sum, r) => {
          return sum + calculateRepairDuration(r.createdAt, r.completedAt!);
        }, 0) /
      repairs.filter((r) => r.completedAt).length,
  };
}

/**
 * Send SMS notification (mock function)
 */
export async function sendSMSNotification(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  // TODO: Integrate with SMS service (Twilio, etc.)
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 100);
  });
}

/**
 * Send email notification (mock function)
 */
export async function sendEmailNotification(
  email: string,
  subject: string,
  message: string
): Promise<boolean> {
  // TODO: Integrate with email service
  console.log(`Sending email to ${email}: ${subject} - ${message}`);
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 100);
  });
}

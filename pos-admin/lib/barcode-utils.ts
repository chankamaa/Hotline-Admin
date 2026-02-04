type BarcodeFormat = 'EAN-13' | 'UPC' | 'Code128';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Generate a random barcode based on the specified format
 */
export function generateBarcode(format: BarcodeFormat): string {
  switch (format) {
    case 'EAN-13':
      return generateEAN13();
    case 'UPC':
      return generateUPC();
    case 'Code128':
      return generateCode128();
    default:
      return generateEAN13();
  }
}

/**
 * Generate a valid EAN-13 barcode
 * EAN-13 consists of 12 digits + 1 check digit
 */
function generateEAN13(): string {
  // Generate 12 random digits
  let barcode = '';
  for (let i = 0; i < 12; i++) {
    barcode += Math.floor(Math.random() * 10);
  }
  
  // Calculate check digit
  const checkDigit = calculateEAN13CheckDigit(barcode);
  return barcode + checkDigit;
}

/**
 * Calculate EAN-13 check digit using the standard algorithm
 */
function calculateEAN13CheckDigit(barcode: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit;
}

/**
 * Generate a valid UPC barcode
 * UPC-A consists of 11 digits + 1 check digit
 */
function generateUPC(): string {
  // Generate 11 random digits
  let barcode = '';
  for (let i = 0; i < 11; i++) {
    barcode += Math.floor(Math.random() * 10);
  }
  
  // Calculate check digit
  const checkDigit = calculateUPCCheckDigit(barcode);
  return barcode + checkDigit;
}

/**
 * Calculate UPC check digit using the standard algorithm
 */
function calculateUPCCheckDigit(barcode: string): number {
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(barcode[i]);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit;
}

/**
 * Generate a Code 128 barcode
 * Code 128 supports alphanumeric characters
 */
function generateCode128(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let barcode = '';
  const length = 10 + Math.floor(Math.random() * 6); // 10-15 characters
  
  for (let i = 0; i < length; i++) {
    barcode += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return barcode;
}

/**
 * Validate a barcode against its format
 */
export function validateBarcode(barcode: string, format: BarcodeFormat): ValidationResult {
  switch (format) {
    case 'EAN-13':
      return validateEAN13(barcode);
    case 'UPC':
      return validateUPC(barcode);
    case 'Code128':
      return validateCode128(barcode);
    default:
      return { valid: false, error: 'Unknown barcode format' };
  }
}

/**
 * Validate EAN-13 barcode
 */
function validateEAN13(barcode: string): ValidationResult {
  // Check length
  if (barcode.length !== 13) {
    return { valid: false, error: 'EAN-13 must be exactly 13 digits' };
  }
  
  // Check if all characters are digits
  if (!/^\d+$/.test(barcode)) {
    return { valid: false, error: 'EAN-13 must contain only digits' };
  }
  
  // Validate check digit
  const provided = barcode.slice(0, 12);
  const checkDigit = calculateEAN13CheckDigit(provided);
  
  if (parseInt(barcode[12]) !== checkDigit) {
    return { valid: false, error: 'Invalid EAN-13 check digit' };
  }
  
  return { valid: true };
}

/**
 * Validate UPC barcode
 */
function validateUPC(barcode: string): ValidationResult {
  // Check length
  if (barcode.length !== 12) {
    return { valid: false, error: 'UPC must be exactly 12 digits' };
  }
  
  // Check if all characters are digits
  if (!/^\d+$/.test(barcode)) {
    return { valid: false, error: 'UPC must contain only digits' };
  }
  
  // Validate check digit
  const provided = barcode.slice(0, 11);
  const checkDigit = calculateUPCCheckDigit(provided);
  
  if (parseInt(barcode[11]) !== checkDigit) {
    return { valid: false, error: 'Invalid UPC check digit' };
  }
  
  return { valid: true };
}

/**
 * Validate Code 128 barcode
 */
function validateCode128(barcode: string): ValidationResult {
  // Check length (typically 8-20 characters)
  if (barcode.length < 8 || barcode.length > 20) {
    return { valid: false, error: 'Code 128 must be between 8 and 20 characters' };
  }
  
  // Check if contains valid characters (alphanumeric)
  if (!/^[A-Z0-9]+$/.test(barcode)) {
    return { valid: false, error: 'Code 128 must contain only uppercase letters and digits' };
  }
  
  return { valid: true };
}

/**
 * Check if a barcode is unique (mock function - replace with actual DB check)
 */
export async function isBarcodeUnique(barcode: string): Promise<boolean> {
  // TODO: Implement actual database check
  // This is a mock function
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate DB check
      resolve(Math.random() > 0.1); // 90% chance of being unique
    }, 100);
  });
}

/**
 * Format barcode for display with proper spacing
 */
export function formatBarcodeDisplay(barcode: string, format: BarcodeFormat): string {
  switch (format) {
    case 'EAN-13':
      // Format as: 1 234567 890123
      return barcode.slice(0, 1) + ' ' + barcode.slice(1, 7) + ' ' + barcode.slice(7);
    case 'UPC':
      // Format as: 123456 789012
      return barcode.slice(0, 6) + ' ' + barcode.slice(6);
    case 'Code128':
      // No special formatting for Code 128
      return barcode;
    default:
      return barcode;
  }
}

/**
 * Batch generate barcodes for multiple products
 */
export async function generateBarcodesBatch(
  count: number,
  format: BarcodeFormat
): Promise<string[]> {
  const barcodes: string[] = [];
  const uniqueCodes = new Set<string>();
  
  while (uniqueCodes.size < count) {
    const barcode = generateBarcode(format);
    uniqueCodes.add(barcode);
  }
  
  return Array.from(uniqueCodes);
}

/**
 * Get barcode format description
 */
export function getBarcodeFormatInfo(format: BarcodeFormat): {
  name: string;
  description: string;
  length: string;
  usage: string;
} {
  switch (format) {
    case 'EAN-13':
      return {
        name: 'EAN-13',
        description: 'European Article Number',
        length: '13 digits',
        usage: 'Widely used in retail, especially in Europe',
      };
    case 'UPC':
      return {
        name: 'UPC-A',
        description: 'Universal Product Code',
        length: '12 digits',
        usage: 'Standard barcode for retail in North America',
      };
    case 'Code128':
      return {
        name: 'Code 128',
        description: 'High-density alphanumeric barcode',
        length: '8-20 characters',
        usage: 'Used for shipping, packaging, and internal tracking',
      };
    default:
      return {
        name: 'Unknown',
        description: 'Unknown format',
        length: 'N/A',
        usage: 'N/A',
      };
  }
}

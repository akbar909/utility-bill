import Tesseract from 'tesseract.js';

/**
 * Processes an image file and extracts text using Tesseract.js
 * @param {File} file - The image file to process
 * @returns {Promise<string>} - The extracted text
 */
export const extractTextFromImage = async (file) => {
  try {
    const result = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: m => console.log(m) // Optional: log progress
      }
    );
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

/**
 * Parses extracted text to find bill details
 * Improved to handle real bill formats like HESCO, K-Electric, etc.
 */
export const parseBillText = (text) => {
  console.log('Parsing OCR text:', text);
  
  let units = 0;
  let total = 0;
  let rate = 16; // Default rate per unit (PKR)
  let dueDate = '';
  let referenceNumber = '';
  let billMonth = '';
  let currentBill = 0;
  let afterDueDate = 0;

  // Clean and normalize text
  const normalizedText = text.replace(/\s+/g, ' ').toUpperCase();
  
  // === UNITS CONSUMED PATTERNS ===
  const unitsPatterns = [
    // Pattern: "UNITS CONSUMED: 350" or "CONSUMPTION: 350 KWH"
    /(?:UNITS?\s*CONSUMED?|CONSUMPTION|CURRENT\s*READING\s*-\s*PREVIOUS\s*READING)[:\s]*(\d+)(?:\s*KWH?)?/i,
    
    // Pattern: "kWh consumed: 350"
    /KWH?\s*(?:CONSUMED|USED)[:\s]*(\d+)/i,
    
    // Pattern: Table format "UNITS | 350" or "350 | UNITS"
    /(?:UNITS?|KWH?)[:\s|]*(\d{2,4})/i,
    
    // Pattern: "PRESENT READING 12345 PREVIOUS READING 12000" -> difference
    /PRESENT\s*(?:READING|RDG)[:\s]*(\d+).*?PREVIOUS\s*(?:READING|RDG)[:\s]*(\d+)/i,
    
    // Pattern: Just a number followed by "UNITS" or "KWH"
    /(\d{2,4})\s*(?:UNITS?|KWH?)/i,
  ];

  for (const pattern of unitsPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      if (match[2]) {
        // For present/previous reading pattern
        const present = parseInt(match[1]);
        const previous = parseInt(match[2]);
        units = present - previous;
      } else {
        units = parseInt(match[1]);
      }
      
      // Validate units (typical range: 10-10000)
      if (units >= 10 && units <= 10000) {
        console.log('✅ Units found:', units);
        break;
      } else {
        units = 0; // Reset if out of reasonable range
      }
    }
  }

  // === BILL MONTH PATTERN ===
  const billMonthMatch = normalizedText.match(/BILL\s*MONTH[:\s]*([A-Z]{3}\s*\d{2})/i);
  if (billMonthMatch) {
    billMonth = billMonthMatch[1].trim();
    console.log('✅ Bill month found:', billMonth);
  }

  // === DUE DATE PATTERN ===
  const dueDatePatterns = [
    /DUE\s*DATE[:\s]*(\d{1,2}\s*[A-Z]{3}\s*\d{2,4})/i,
    /DUE\s*DATE[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
  ];

  for (const pattern of dueDatePatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      dueDate = match[1].trim();
      console.log('✅ Due date found:', dueDate);
      break;
    }
  }

  // === REFERENCE NUMBER PATTERN ===
  const refMatch = normalizedText.match(/REFERENCE\s*(?:NO|NUMBER|#)?[:\s]*([\d\s]+[A-Z]?)/i);
  if (refMatch) {
    referenceNumber = refMatch[1].trim();
    console.log('✅ Reference number found:', referenceNumber);
  }

  // === TOTAL AMOUNT PATTERNS (PRIORITY ORDER) ===
  const totalPatterns = [
    // HIGHEST PRIORITY: "PAYABLE WITHIN DUE DATE" or "PAYABLE BY DUE DATE"
    { pattern: /PAYABLE\s*(?:WITHIN|BY|ON|BEFORE)?\s*DUE\s*DATE[:\s]*(?:RS\.?|PKR)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i, priority: 1 },
    
    // Second: General "PAYABLE" amount
    { pattern: /(?:AMOUNT\s*)?PAYABLE[:\s]*(?:RS\.?|PKR)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i, priority: 2 },
    
    // Third: "TOTAL AMOUNT" or "NET AMOUNT"
    { pattern: /(?:TOTAL|NET)\s*AMOUNT[:\s]*(?:RS\.?|PKR)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i, priority: 3 },
    
    // Fourth: "CURRENT BILL" (store separately)
    { pattern: /CURRENT\s*BILL[:\s]*(?:RS\.?|PKR)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i, priority: 4 },
    
    // Last resort: "BILL AMOUNT"
    { pattern: /BILL\s*AMOUNT[:\s]*(?:RS\.?|PKR)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i, priority: 5 },
  ];

  let bestMatch = { amount: 0, priority: 999 };

  for (const { pattern, priority } of totalPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      
      // Validate amount (typical range: 100-100000)
      if (amount >= 100 && amount <= 100000) {
        if (priority === 4) {
          currentBill = amount;
          console.log('📝 Current bill found:', currentBill);
        }
        
        if (priority < bestMatch.priority) {
          bestMatch = { amount, priority };
          console.log(`✅ Amount found (priority ${priority}):`, amount);
        }
      }
    }
  }

  total = bestMatch.amount;

  // === AFTER DUE DATE AMOUNT ===
  const afterDueMatch = normalizedText.match(/(?:PAYABLE\s*AFTER|AFTER)\s*DUE\s*DATE[:\s]*(?:RS\.?|PKR)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
  if (afterDueMatch) {
    afterDueDate = parseFloat(afterDueMatch[1].replace(/,/g, ''));
    console.log('📌 After due date amount found:', afterDueDate);
  }

  // === CALCULATE RATE ===
  if (units > 0 && total > 0) {
    rate = parseFloat((total / units).toFixed(2));
  }

  console.log('📊 Final parsed result:', { units, total, rate, dueDate, referenceNumber, billMonth });

  return {
    units,
    total,
    rate,
    tax: 0,
    extraCharges: 0,
    dueDate,
    referenceNumber,
    billMonth,
    currentBill,
    afterDueDate,
  };
};

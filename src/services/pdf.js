import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts text from a PDF file
 * @param {File} file - The PDF file to process
 * @returns {Promise<string>} - The extracted text
 */
export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Validates if the extracted text looks like a utility bill
 * @param {string} text - The extracted text
 * @returns {boolean} - True if it looks like a bill
 */
export const validateBillContent = (text) => {
  const lowerText = text.toLowerCase();
  
  // Check for common bill keywords
  const billKeywords = [
    'bill', 'invoice', 'electricity', 'electric', 'gas', 'utility',
    'kwh', 'units', 'consumption', 'meter', 'reading',
    'total', 'amount', 'payable', 'due', 'charges'
  ];
  
  const foundKeywords = billKeywords.filter(keyword => lowerText.includes(keyword));
  
  // If we find at least 3 bill-related keywords, it's likely a bill
  return foundKeywords.length >= 3;
};

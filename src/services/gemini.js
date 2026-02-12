import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
let genAI = null;
const API_KEY = "AIzaSyBm9TVWNST8lWXqatd3D_KITrLSEDgakA4";

// Model names to try (in priority order)
const MODEL_NAMES = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

export const initializeGemini = (apiKey) => {
  genAI = new GoogleGenerativeAI(apiKey || API_KEY);
};

const getGenAI = () => {
  if (!genAI) {
    initializeGemini(API_KEY);
  }
  return genAI;
};

/**
 * Convert a File to a base64 GenerativeAI Part
 */
const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Use Gemini Vision to extract ALL bill details from an image
 * This replaces the fragile regex-based OCR parsing
 */
export const extractBillFromImage = async (file) => {
  const ai = getGenAI();
  const imagePart = await fileToGenerativePart(file);

  const prompt = `You are a utility bill data extractor. Analyze this utility bill image carefully and extract ALL the following information.

IMPORTANT: This could be an electricity bill (HESCO, K-Electric, LESCO, MEPCO, PESCO, FESCO, IESCO, etc.) OR a gas bill (SSGC, SNGPL, etc.) from Pakistan.

Extract these fields (respond ONLY with valid JSON, no markdown, no explanation):
{
  "billType": "electricity" or "gas",
  "company": "name of the utility company (e.g. HESCO, K-Electric, SSGC)",
  "units": number of units/kWh consumed (integer),
  "total": payable within due date amount (number),
  "currentBill": current month bill amount (number),
  "afterDueDate": amount payable after due date (number),
  "dueDate": "due date as shown on bill",
  "billMonth": "billing month",
  "referenceNumber": "reference/consumer number",
  "meterNumber": "meter number if visible",
  "consumerName": "consumer/customer name if visible",
  "arrears": any arrears/previous balance amount (number, 0 if none),
  "taxes": total taxes amount (number, 0 if not visible),
  "fuelAdjustment": fuel price adjustment amount (number, 0 if not visible),
  "isValidBill": true if this is actually a utility bill, false if not
}

Rules:
- For "total", ALWAYS prefer "PAYABLE WITHIN DUE DATE" amount over "CURRENT BILL"
- Return ONLY the JSON object, nothing else
- Use 0 for any numeric field you cannot find
- Use "" for any text field you cannot find
- Set isValidBill to false if this image is NOT a utility bill`;

  let lastError = null;

  for (const modelName of MODEL_NAMES) {
    try {
      const model = ai.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      console.log(`✅ Vision extraction success with model: ${modelName}`);
      console.log("Raw AI response:", text);

      // Parse JSON from response (handle possible markdown wrapping)
      const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(jsonStr);

      return data;
    } catch (error) {
      console.warn(`❌ Vision failed with model ${modelName}:`, error.message);
      lastError = error;
      continue;
    }
  }

  console.error("All vision models failed:", lastError);
  throw new Error("Could not extract bill data with AI. Please try manual entry.");
};

/**
 * Generate AI explanation of the bill
 */
export const generateExplanation = async (billData, apiKey) => {
  const ai = getGenAI();

  for (const modelName of MODEL_NAMES) {
    try {
      const model = ai.getGenerativeModel({ model: modelName });

      const prompt = `Analyze this utility bill data:
- Bill Type: ${billData.billType || 'electricity'}
- Company: ${billData.company || 'Unknown'}
- Units Consumed: ${billData.units}
- Total Amount: ${billData.total} PKR
- Current Bill: ${billData.currentBill || billData.total} PKR
- Due Date: ${billData.dueDate || 'N/A'}
- Arrears: ${billData.arrears || 0} PKR
- Taxes: ${billData.taxes || 0} PKR

Explain this bill in simple words for a normal user.
Mention why it might be high or low (assume >300 units is high for electricity, >3 MMBTU is high for gas).
Give one specific, actionable tip to reduce it.
Keep the response short (max 4 sentences).
Format as a friendly chat message.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`✅ Explanation success with model: ${modelName}`);
      return text;
    } catch (error) {
      console.warn(`❌ Explanation failed with model ${modelName}:`, error.message);
      continue;
    }
  }

  // Fallback demo response
  const isHigh = billData.units > 300;
  if (isHigh) {
    return `Your bill is higher than average at ${billData.units} units, exceeding the typical 300 unit threshold. To reduce costs, consider switching to LED bulbs and limiting AC usage to 26°C. Small changes like unplugging unused devices can save up to PKR ${Math.round(billData.total * 0.15)} monthly! 💡`;
  } else {
    return `Great job! Your consumption of ${billData.units} units is within a reasonable range. To save even more, try using natural light during daytime and switch to energy-efficient appliances. You could reduce your bill by another PKR ${Math.round(billData.total * 0.1)} monthly! ⚡`;
  }
};


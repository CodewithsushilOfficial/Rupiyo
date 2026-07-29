import { generateNvidiaNimInsight } from '@/lib/ai/nvidia-adapter';

/**
 * Clean & Redact sensitive identifiers
 */
export function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[REDACTED_CARD]')
    .replace(/\b\d{9,18}\b/g, '[REDACTED_ACCOUNT]');
}

/**
 * Extract transaction amount from OCR or SMS text
 */
export function extractAmount(text) {
  const amountRegexes = [
    /(?:total|amt|amount|paid|grand total|net amount|val|balance|₹|rs\.?|inr)\s*[:=]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+\.?\d{0,2})/i,
    /(?:₹|rs\.?|inr)\s*([\d,]+\.?\d{0,2})/i,
    /\b([\d,]+\.\d{2})\b/,
  ];

  for (const regex of amountRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const cleanNum = match[1].replace(/,/g, '');
      const parsed = parseFloat(cleanNum);
      if (!isNaN(parsed) && parsed > 0 && parsed < 1000000) {
        return { value: parsed, confidence: 'HIGH' };
      }
    }
  }

  // Fallback to highest numeric value if no explicit symbol found
  const numbers = text.match(/\b\d+(?:\.\d{1,2})?\b/g);
  if (numbers) {
    const parsedNums = numbers
      .map((n) => parseFloat(n))
      .filter((n) => !isNaN(n) && n > 5 && n < 500000);
    if (parsedNums.length > 0) {
      const maxVal = Math.max(...parsedNums);
      return { value: maxVal, confidence: 'MEDIUM' };
    }
  }

  return { value: null, confidence: 'LOW' };
}

/**
 * Extract merchant / payee name from text
 */
export function extractMerchant(text) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2 && !/^(total|receipt|tax|date|invoice|thank|welcome|gstin|tel|phone|bill|page)/i.test(l));

  if (lines.length > 0) {
    const merchantCandidate = lines[0].substring(0, 50).replace(/[^\w\s&'-]/gi, '');
    if (merchantCandidate.length > 2) {
      return { value: merchantCandidate, confidence: 'HIGH' };
    }
  }

  return { value: 'Scanned Bill / Receipt', confidence: 'LOW' };
}

/**
 * Extract transaction date from text
 */
export function extractDate(text) {
  const dateRegexes = [
    /\b(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})\b/,
    /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/i,
    /\b(\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})\b/,
  ];

  for (const regex of dateRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      try {
        const d = new Date(match[1]);
        if (!isNaN(d.getTime())) {
          return { value: d.toISOString().substring(0, 10), confidence: 'HIGH' };
        }
      } catch {
        // ignore parse error
      }
    }
  }

  return { value: new Date().toISOString().substring(0, 10), confidence: 'MEDIUM' };
}

/**
 * Extract Payment Method (UPI, CARD, CASH, NETBANKING)
 */
export function extractPaymentMethod(text) {
  const upper = text.toUpperCase();
  if (upper.includes('UPI') || upper.includes('GPAY') || upper.includes('PHONEPE') || upper.includes('PAYTM')) {
    return 'UPI';
  }
  if (upper.includes('CARD') || upper.includes('DEBIT') || upper.includes('CREDIT') || upper.includes('VISA') || upper.includes('MASTERCARD')) {
    return 'CARD';
  }
  if (upper.includes('CASH')) {
    return 'CASH';
  }
  if (upper.includes('NETBANKING') || upper.includes('IMPS') || upper.includes('NEFT')) {
    return 'NETBANKING';
  }
  return 'UPI';
}

/**
 * Suggest Category based on text keywords
 */
export function suggestCategory(text, merchantName) {
  const combined = `${text} ${merchantName}`.toLowerCase();

  if (/(restaurant|food|cafe|swiggy|zomato|pizza|burger|hotel|dining|bakery|diner|kitchen)/.test(combined)) {
    return 'Food & Dining';
  }
  if (/(uber|ola|rapido|cab|fuel|petrol|diesel|metro|auto|railway|irctc|parking|toll)/.test(combined)) {
    return 'Transport';
  }
  if (/(supermarket|mart|grocery|groceries|blinkit|zepto|bigbasket|dmart|spencer|reliance)/.test(combined)) {
    return 'Shopping';
  }
  if (/(electricity|power|water|gas|utility|recharge|broadband|wifi|airtel|jio|vi|bescom)/.test(combined)) {
    return 'Bills & Utilities';
  }
  if (/(pharmacy|hospital|clinic|doctor|medical|lab|apollo|pharmeasy|health)/.test(combined)) {
    return 'Healthcare';
  }
  if (/(movie|cinema|bookmyshow|netflix|prime|spotify|event|game|entertainment)/.test(combined)) {
    return 'Entertainment';
  }
  if (/(salary|freelance|credit|bonus|dividend|paycheck|refund)/.test(combined)) {
    return 'Salary / Income';
  }

  return 'Shopping';
}

/**
 * Deterministic rule-based transaction parsing
 */
export function parseRawTextDeterministic(text, source = 'MANUAL') {
  const sanitized = sanitizeText(text || '');
  const amountRes = extractAmount(sanitized);
  const merchantRes = extractMerchant(sanitized);
  const dateRes = extractDate(sanitized);
  const paymentMethod = extractPaymentMethod(sanitized);
  const categorySuggestion = suggestCategory(sanitized, merchantRes.value);

  const isIncome = /(credited|received|added|deposited|salary|income)/i.test(sanitized);

  return {
    source,
    type: isIncome ? 'INCOME' : 'EXPENSE',
    amount: amountRes.value,
    title: merchantRes.value,
    transactionDate: dateRes.value,
    paymentMethod,
    categorySuggestion,
    notes: `Imported via ${source}`,
    confidence: {
      amount: amountRes.confidence,
      title: merchantRes.confidence,
      date: dateRes.confidence,
    },
    rawTextSnippet: sanitized.substring(0, 300),
  };
}

import Tesseract from 'tesseract.js';
import { parseRawTextDeterministic, sanitizeText } from '@/lib/services/transaction-parser-service';

export { sanitizeText };

/**
 * Executes Tesseract OCR with explicit timeout handling (default 12 seconds).
 */
async function recognizeWithTimeout(buffer, timeoutMs = 12000) {
  let timerId;

  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      const err = new Error('OCR operation timed out after 12 seconds.');
      err.code = 'OCR_TIMEOUT';
      reject(err);
    }, timeoutMs);
  });

  const ocrPromise = Tesseract.recognize(buffer, 'eng', {
    logger: () => {},
  }).finally(() => {
    clearTimeout(timerId);
  });

  return Promise.race([ocrPromise, timeoutPromise]);
}

/**
 * Main OCR Processing Function with stage timing, error codes, and memory safety
 */
export async function processReceiptImageBuffer(imageBuffer, source = 'CAMERA_SCAN') {
  const startTime = Date.now();
  let ocrStartTime = 0;
  let ocrEndTime = 0;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[OCR] preprocessing started for image (${imageBuffer.length} bytes)`);
  }

  try {
    ocrStartTime = Date.now();
    if (process.env.NODE_ENV === 'development') {
      console.log('[OCR] extraction started');
    }

    const { data } = await recognizeWithTimeout(imageBuffer, 12000);
    ocrEndTime = Date.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(`[OCR] extraction complete: ${ocrEndTime - ocrStartTime}ms`);
    }

    const rawText = sanitizeText(data?.text || '');
    if (!rawText.trim()) {
      return {
        success: false,
        code: 'OCR_EMPTY_RESULT',
        error: 'No text could be identified in the image.',
      };
    }

    const parserStartTime = Date.now();
    if (process.env.NODE_ENV === 'development') {
      console.log('[PARSER] started');
    }

    const parsedData = parseRawTextDeterministic(rawText, source);
    const parserEndTime = Date.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(`[PARSER] complete: ${parserEndTime - parserStartTime}ms`);
    }

    const totalMs = Date.now() - startTime;

    return {
      success: true,
      data: parsedData,
      timing: {
        ocrMs: ocrEndTime - ocrStartTime,
        parserMs: parserEndTime - parserStartTime,
        totalMs,
      },
    };
  } catch (err) {
    console.error('[OCR_SERVICE_ERROR]:', err);

    let errorCode = 'OCR_FAILED';
    let errorMessage = 'Unable to extract transaction details from receipt image.';

    if (err.code === 'OCR_TIMEOUT') {
      errorCode = 'OCR_TIMEOUT';
      errorMessage = 'Receipt processing took too long (12s timeout). Try entering details manually.';
    }

    return {
      success: false,
      code: errorCode,
      error: errorMessage,
    };
  } finally {
    // Explicit memory zero-out for privacy
    try {
      if (Buffer.isBuffer(imageBuffer)) {
        imageBuffer.fill(0);
      }
    } catch {
      // Ignore if buffer immutable
    }
  }
}

/**
 * Plain text / payment notification parser (for shared SMS or notification text)
 */
export function parsePlainTextTransaction(text) {
  const startTime = Date.now();
  const parsedData = parseRawTextDeterministic(text, 'TEXT_SHARE');
  const totalMs = Date.now() - startTime;

  return {
    success: true,
    data: parsedData,
    timing: {
      ocrMs: 0,
      parserMs: totalMs,
      totalMs,
    },
  };
}

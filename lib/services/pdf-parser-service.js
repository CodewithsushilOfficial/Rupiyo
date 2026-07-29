import { parsePlainTextTransaction } from '@/lib/services/ocr-service';

/**
 * Parse PDF file buffer for transaction details
 */
export async function processPdfReceiptBuffer(pdfBuffer) {
  try {
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(pdfBuffer);
    const textContent = (data.text || '').trim();

    if (textContent.length > 20) {
      // Direct digital text extraction from PDF
      const parseResult = parsePlainTextTransaction(textContent);
      return {
        ...parseResult,
        data: {
          ...parseResult.data,
          source: 'PDF_IMPORT',
          notes: 'Imported via PDF Document',
        },
      };
    } else {
      // Scanned image PDF fallback
      return {
        success: false,
        error: 'PDF contains no selectable text. Please upload as an image file.',
      };
    }
  } catch (err) {
    console.error('[PDF_PARSER_ERROR]:', err);
    return {
      success: false,
      error: 'Failed to read PDF document.',
    };
  }
}

import { NextResponse } from 'next/server';
import { processReceiptImageBuffer, parsePlainTextTransaction } from '@/lib/services/ocr-service';
import { processPdfReceiptBuffer } from '@/lib/services/pdf-parser-service';
import { createClient } from '@/lib/supabase/server';

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, code: 'AUTH_REQUIRED', error: 'Authentication required' },
        { status: 401 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let fileBuffer = null;
    let mimeType = '';
    let rawText = '';
    let source = 'WEB_UPLOAD';

    if (contentType.includes('application/json')) {
      const json = await req.json();
      rawText = json.text || '';
      source = json.source || 'ANDROID_SHARE';

      if (json.base64) {
        mimeType = json.mimeType || 'image/jpeg';
        const cleanBase64 = json.base64.replace(/^data:[^;]+;base64,/, '');
        fileBuffer = Buffer.from(cleanBase64, 'base64');
      }
    } else {
      const formData = await req.formData();
      const file = formData.get('file');
      rawText = formData.get('text') || '';
      source = formData.get('source') || 'WEB_UPLOAD';

      if (file && typeof file !== 'string') {
        mimeType = file.type || '';
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[IMPORT] payload normalized: source=${source}, mime=${mimeType}, hasBuffer=${!!fileBuffer}, hasText=${!!rawText}`);
    }

    // 1. Text payload path (SMS or shared text)
    if (rawText) {
      const result = parsePlainTextTransaction(rawText);
      return NextResponse.json(result);
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { success: false, code: 'SHARE_PAYLOAD_MISSING', error: 'No upload payload provided.' },
        { status: 400 }
      );
    }

    // 2. Check max file size (10MB)
    if (fileBuffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, code: 'UNSUPPORTED_FILE_TYPE', error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    let result = null;
    if (mimeType.includes('pdf')) {
      result = await processPdfReceiptBuffer(fileBuffer);
    } else {
      result = await processReceiptImageBuffer(fileBuffer, source);
    }

    // Explicitly zero out buffer after processing
    fileBuffer.fill(0);

    const totalMs = Date.now() - startTime;
    return NextResponse.json({
      ...result,
      timing: {
        ...(result.timing || {}),
        apiTotalMs: totalMs,
      },
    });
  } catch (err) {
    console.error('[OCR_PARSE_API_ERROR]:', err);
    return NextResponse.json(
      { success: false, code: 'OCR_FAILED', error: 'Failed to process document.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { processReceiptImageBuffer, parsePlainTextTransaction } from '@/lib/services/ocr-service';
import { processPdfReceiptBuffer } from '@/lib/services/pdf-parser-service';
import { createClient } from '@/lib/supabase/server';

export async function POST(req) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const rawText = formData.get('text');

    if (rawText) {
      const result = parsePlainTextTransaction(rawText);
      return NextResponse.json(result);
    }

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file or text payload provided.' }, { status: 400 });
    }

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || '';

    let result = null;

    if (mimeType.includes('pdf') || file.name.endsWith('.pdf')) {
      result = await processPdfReceiptBuffer(buffer);
    } else {
      result = await processReceiptImageBuffer(buffer);
    }

    // Explicitly zero out temporary memory buffer for privacy compliance
    buffer.fill(0);

    return NextResponse.json(result);
  } catch (err) {
    console.error('[OCR_PARSE_API_ERROR]:', err);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}

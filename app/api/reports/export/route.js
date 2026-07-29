import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    let query = supabase
      .from('transactions')
      .select('*, category:categories(name), account:accounts(name)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });

    if (startDate) query = query.gte('transaction_date', startDate);
    if (endDate) query = query.lte('transaction_date', endDate);
    if (type && type !== 'ALL') query = query.eq('type', type);

    const { data: transactions, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify(transactions, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="rupiyo_report_${new Date().toISOString().substring(0, 10)}.json"`,
        },
      });
    }

    // Default: CSV Export
    const csvHeaders = ['Date', 'Type', 'Category', 'Account', 'Payment Method', 'Amount (INR)', 'Description'];
    const csvRows = (transactions || []).map((t) => [
      t.transaction_date,
      t.type,
      `"${t.category?.name || 'General'}"`,
      `"${t.account?.name || 'Account'}"`,
      t.payment_method,
      t.amount,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rupiyo_report_${new Date().toISOString().substring(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error('[EXPORT_ROUTE_ERROR]:', err);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

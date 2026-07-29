"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Download, FileSpreadsheet, Code } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function ReportsView({ accounts = [] }) {
  const [filters, setFilters] = React.useState({
    format: 'csv',
    startDate: '',
    endDate: '',
    type: 'ALL',
  });
  const [isExporting, setIsExporting] = React.useState(false);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDownload = () => {
    setIsExporting(true);
    const query = new URLSearchParams();
    query.set('format', filters.format);
    if (filters.startDate) query.set('startDate', filters.startDate);
    if (filters.endDate) query.set('endDate', filters.endDate);
    if (filters.type !== 'ALL') query.set('type', filters.type);

    const downloadUrl = `/api/reports/export?${query.toString()}`;
    window.location.href = downloadUrl;

    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-heading">
          Financial Reports & Data Export
        </h1>
        <p className="text-sm text-muted-foreground">
          Export full transaction ledger and statement summaries for accounting or tax filing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Export Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Export Statement Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Format Selection */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Select File Format
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, format: 'csv' })}
                  className={cn(
                    'flex items-center gap-3 rounded-control border p-4 transition-all cursor-pointer',
                    filters.format === 'csv'
                      ? 'border-primary-border bg-primary-soft text-primary font-bold'
                      : 'border-input bg-card text-foreground hover:bg-muted'
                  )}
                >
                  <FileSpreadsheet className="h-6 w-6 text-income" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">CSV Spreadsheet</p>
                    <p className="text-xs text-muted-foreground">Excel / Google Sheets</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, format: 'json' })}
                  className={cn(
                    'flex items-center gap-3 rounded-control border p-4 transition-all cursor-pointer',
                    filters.format === 'json'
                      ? 'border-primary-border bg-primary-soft text-primary font-bold'
                      : 'border-input bg-card text-foreground hover:bg-muted'
                  )}
                >
                  <Code className="h-6 w-6 text-savings" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">JSON Data Dump</p>
                    <p className="text-xs text-muted-foreground">Developer / Backup</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-foreground">
                  Start Date
                </label>
                <Input
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-foreground">
                  End Date
                </label>
                <Input
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground">
                Transaction Type
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleChange}
                className="w-full rounded-control border border-input bg-card text-foreground p-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                <option value="ALL">All Transactions (Income & Expenses)</option>
                <option value="INCOME">Income Only (+)</option>
                <option value="EXPENSE">Expense Only (-)</option>
              </select>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full gap-2 py-6 text-base"
              >
                <Download className="h-5 w-5" />
                {isExporting ? 'Generating Download...' : `Download ${filters.format.toUpperCase()} Report`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informational Card */}
        <Card className="bg-primary text-primary-foreground border-primary-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-primary-foreground">
              Tax & Audit Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs leading-relaxed opacity-95">
            <p>
              Your export file contains full line-item details including timestamps, exact category mappings, account IDs, and UPI/Card payment method tags.
            </p>
            <p>
              Use the <strong>CSV format</strong> for seamless import into Microsoft Excel, Google Sheets, Tally, or Zoho Books.
            </p>
            <div className="rounded-control bg-white/10 p-3 border border-white/20">
              <p className="font-semibold text-white mb-1">🔒 Security & Privacy</p>
              <p className="text-[11px] text-white/80">
                Exports are strictly generated on-the-fly via authenticated API sessions protected by Supabase RLS.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

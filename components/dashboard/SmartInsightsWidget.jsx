"use client";

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export function SmartInsightsWidget({ insight = null }) {
  if (!insight) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        backgroundColor: '#F8F7FF',
        border: '1px solid #DED9FF',
      }}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold"
              style={{ backgroundColor: '#ECE9FF', color: '#6759E8', border: '1px solid #D9D5FA' }}
            >
              <Sparkles className="h-3.5 w-3.5" /> NVIDIA NIM AI Summary
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight" style={{ color: '#29293B' }}>
            {insight.title || 'Financial Intelligence Summary'}
          </h3>
          <p className="text-xs max-w-3xl leading-relaxed font-medium" style={{ color: '#67677A' }}>
            {insight.summary}
          </p>
        </div>

        <Link href="/insights" className="shrink-0">
          <Button
            className="gap-2 text-xs font-extrabold rounded-lg transition-all"
            style={{
              backgroundColor: '#6759E8',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(103, 89, 232, 0.22)',
            }}
          >
            <span>Explore AI Insights</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-5 pt-3.5 flex items-center gap-2 text-[10px] font-medium" style={{ borderTop: '1px solid #DED9FF', color: '#9292A3' }}>
        <ShieldAlert className="h-3.5 w-3.5 shrink-0" style={{ color: '#6759E8' }} />
        <span>
          Insights are generated automatically from your recorded spending data for informational purposes only. Rupiyo does not provide financial advice.
        </span>
      </div>
    </div>
  );
}

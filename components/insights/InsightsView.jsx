"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { InsightCard } from '@/components/insights/InsightCard';
import { generateInsightAction } from '@/lib/actions/insight-actions';
import { Button } from '@/components/ui/Button';
import { Sparkles, Cpu, RefreshCw } from 'lucide-react';

export function InsightsView({ initialInsights = [] }) {
  const router = useRouter();
  const [newInsights, setNewInsights] = React.useState([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const displayInsights = [...newInsights, ...initialInsights.filter(i => !newInsights.some(n => n.id === i.id))];

  const handleGenerateInsight = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const res = await generateInsightAction();
      if (!res.success) {
        throw new Error(res.error);
      }
      setNewInsights((prev) => [res.data, ...prev]);
      router.refresh();
    } catch (err) {
      console.error('[GENERATE_INSIGHT_UI_ERROR]:', err);
      setErrorMsg(err.message || 'Failed to generate AI insight');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-card border border-primary-border bg-linear-to-r from-primary to-primary-hover p-6 text-primary-foreground shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-warning" />
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                NVIDIA NIM AI Platform (Llama 3.1 70B)
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">AI Financial Advisor & Insights</h1>
            <p className="text-sm opacity-90">
              Autonomous financial telemetry evaluation, anomaly detection, and personalized recommendations.
            </p>
          </div>

          <Button
            onClick={handleGenerateInsight}
            disabled={isGenerating}
            className="gap-2 bg-white text-primary hover:bg-white/90 font-bold self-start sm:self-auto shadow-md"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing Telemetry...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Run AI Assessment
              </>
            )}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-control border border-expense-border bg-expense-soft p-4 text-sm font-semibold text-expense">
          {errorMsg}
        </div>
      )}

      {/* Grid */}
      {displayInsights.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card p-16 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-heading">
            No AI insights generated yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Click &quot;Run AI Assessment&quot; to generate your first financial health report using NVIDIA NIM AI.
          </p>
          <Button onClick={handleGenerateInsight} disabled={isGenerating} className="mt-6 gap-2">
            <Sparkles className="h-4 w-4" /> Run First Assessment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayInsights.map((insight, idx) => (
            <InsightCard key={insight.id || `insight-${idx}`} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}

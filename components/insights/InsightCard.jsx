"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, AlertTriangle, CheckCircle2, Lightbulb, Bot } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function InsightCard({ insight }) {
  const recommendations = insight.recommendations || [];
  const score = insight.score || 75;

  let IconComponent = Lightbulb;
  let badgeVariant = 'info';
  let badgeText = 'Financial Tip';
  let cardBorder = 'border-border';

  if (insight.type === 'WARNING') {
    IconComponent = AlertTriangle;
    badgeVariant = 'expense';
    badgeText = 'Warning Alert';
    cardBorder = 'border-expense-border';
  } else if (insight.type === 'ACHIEVEMENT') {
    IconComponent = CheckCircle2;
    badgeVariant = 'income';
    badgeText = 'Achievement';
    cardBorder = 'border-income-border';
  }

  return (
    <Card className={cn('relative overflow-hidden transition-all hover:shadow-card-hover', cardBorder)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-control bg-primary text-primary-foreground font-bold shadow-sm shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-heading">{insight.title}</CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={badgeVariant} className="text-[10px] gap-1">
                <IconComponent className="h-3 w-3" /> {badgeText}
              </Badge>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                <Bot className="h-3 w-3" /> {insight.generated_by || insight.generatedBy || 'NVIDIA NIM AI'}
              </span>
            </div>
          </div>
        </div>

        {/* Health Score Badge */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-muted-foreground">Health Score</span>
          <span className="text-lg font-bold text-primary">{score}/100</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <p className="text-sm text-foreground leading-relaxed">
          {insight.summary}
        </p>

        {recommendations.length > 0 && (
          <div className="rounded-control border border-border-subtle bg-secondary p-3.5">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              AI Actionable Recommendations:
            </h4>
            <ul className="space-y-1.5 text-xs text-foreground">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

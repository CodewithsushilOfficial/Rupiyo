"use client";

import * as React from 'react';
import { formatCurrency } from '@/lib/utils/formatters';
import { ChevronDown } from 'lucide-react';
import {
  Utensils,
  CarFront,
  ShoppingBag,
  Zap,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Tag,
} from 'lucide-react';

const ICON_MAP = {
  utensils: Utensils,
  car: CarFront,
  'shopping-bag': ShoppingBag,
  zap: Zap,
  clapperboard: Clapperboard,
  'heart-pulse': HeartPulse,
  graduationcap: GraduationCap,
};

function getIcon(key) {
  return ICON_MAP[key] || Tag;
}

export function TopCategoriesCard({ categories = [] }) {
  return (
    <div className="rounded-card bg-card text-card-foreground border border-border shadow-card h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <h3 className="text-[17px] font-bold text-heading">
          Top Categories
        </h3>
        <button className="flex items-center gap-1.5 rounded-sm border border-input bg-card hover:bg-muted text-muted-foreground px-3 py-1.5 text-[12px] font-medium cursor-pointer transition-colors">
          This Month
          <ChevronDown className="h-3.5 w-3.5 text-subtle" />
        </button>
      </div>

      <div className="px-6 pb-5 space-y-5">
        {categories.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-muted-foreground">
            No category data for this period.
          </div>
        ) : (
          categories.slice(0, 5).map((cat) => {
            const IconComponent = getIcon(cat.iconKey);
            return (
              <div key={cat.id} className="flex items-center gap-3">
                {/* Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-secondary text-muted-foreground">
                  <IconComponent className="h-4 w-4" />
                </div>

                {/* Name + Progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-semibold truncate text-foreground">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-[12px] font-medium text-muted-foreground">
                        {cat.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[13px] font-bold text-heading">
                        {formatCurrency(cat.amount, true)}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full overflow-hidden bg-secondary">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-primary"
                      style={{
                        width: `${Math.min(100, cat.percentage)}%`,
                        backgroundColor: cat.color || 'var(--primary)',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

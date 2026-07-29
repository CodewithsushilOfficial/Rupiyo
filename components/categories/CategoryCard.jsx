"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Archive, Tag } from 'lucide-react';
import * as Icons from 'lucide-react';

export function CategoryCard({ category, onArchive }) {
  const IconComponent = Icons[category.icon_name] || Tag;
  const isIncome = category.type === 'INCOME';

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-control shadow-sm font-bold bg-primary-soft text-primary"
            style={category.color_hex ? { backgroundColor: category.color_hex, color: '#FFFFFF' } : undefined}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-heading">{category.name}</CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={isIncome ? 'income' : 'expense'} className="text-[10px]">
                {category.type}
              </Badge>
              {category.is_system_default ? (
                <span className="text-[10px] text-muted-foreground font-medium">Default</span>
              ) : (
                <span className="text-[10px] text-primary font-medium">Custom</span>
              )}
            </div>
          </div>
        </div>

        {!category.is_system_default && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(category.id)}
            className="h-8 w-8 p-0 hover:bg-expense-soft hover:text-expense"
          >
            <Archive className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </CardHeader>
    </Card>
  );
}

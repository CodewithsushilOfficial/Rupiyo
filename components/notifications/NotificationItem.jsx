"use client";

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, CheckCircle2, Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function NotificationItem({ notification, onMarkRead }) {
  const isUnread = !notification.is_read;

  let IconComponent = Info;

  if (notification.type === 'WARNING' || notification.type === 'ALERT') {
    IconComponent = AlertTriangle;
  } else if (notification.type === 'SUCCESS') {
    IconComponent = CheckCircle2;
  }

  return (
    <div
      className={cn(
        'flex items-start justify-between p-4 transition-colors',
        isUnread
          ? 'bg-primary-soft/40'
          : 'bg-card hover:bg-card-hover'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-white shadow-sm font-bold',
            notification.type === 'WARNING' || notification.type === 'ALERT'
              ? 'bg-expense text-expense-foreground'
              : notification.type === 'SUCCESS'
              ? 'bg-income text-income-foreground'
              : 'bg-primary text-primary-foreground'
          )}
        >
          <IconComponent className="h-4 w-4" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-heading">
              {notification.title}
            </h4>
            {isUnread && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {notification.message}
          </p>
          <p className="text-[10px] text-muted-foreground opacity-80">
            {new Date(notification.created_at).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {isUnread && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMarkRead(notification.id)}
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          <Check className="mr-1 h-3.5 w-3.5" /> Mark Read
        </Button>
      )}
    </div>
  );
}

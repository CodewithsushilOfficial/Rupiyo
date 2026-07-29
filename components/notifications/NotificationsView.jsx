"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from '@/lib/actions/notification-actions';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCheck } from 'lucide-react';

export function NotificationsView({ initialNotifications = [] }) {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState(initialNotifications);
  const [prevInitial, setPrevInitial] = React.useState(initialNotifications);

  if (prevInitial !== initialNotifications) {
    setPrevInitial(initialNotifications);
    setNotifications(initialNotifications);
  }

  const handleMarkRead = async (id) => {
    const res = await markNotificationAsReadAction(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      router.refresh();
    }
  };

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsAsReadAction();
    if (res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      router.refresh();
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading flex items-center gap-2">
            Notification Center
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            System alerts, budget threshold warnings, and automated recurring bill notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            className="gap-2 self-start sm:self-auto"
          >
            <CheckCheck className="h-4 w-4 text-income" /> Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card p-16 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-heading">
            No notifications
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            You&apos;re all caught up! System alerts and budget warnings will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border bg-card shadow-card divide-y divide-border-subtle">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

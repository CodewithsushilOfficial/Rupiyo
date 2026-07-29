import { getNotificationsAction } from '@/lib/actions/notification-actions';
import { NotificationsView } from '@/components/notifications/NotificationsView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Notifications — Rupiyo',
  description: 'System notification drawer, budget threshold alerts, and recurring bill updates.',
};

export default async function NotificationsPage() {
  const notificationsResult = await getNotificationsAction();

  return (
    <div className="p-6 lg:p-8">
      <NotificationsView initialNotifications={notificationsResult.data || []} />
    </div>
  );
}

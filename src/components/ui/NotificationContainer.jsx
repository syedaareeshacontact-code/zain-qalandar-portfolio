'use client';

import { CheckCircle2, CircleAlert, Info, X, XCircle } from 'lucide-react';
import { useNotification } from '@/context/notification-context';

const NOTIFICATION_CONFIG = {
  success: { icon: CheckCircle2, label: 'Success' },
  error: { icon: XCircle, label: 'Error' },
  warning: { icon: CircleAlert, label: 'Warning' },
  info: { icon: Info, label: 'Info' },
};

export default function NotificationContainer() {
  const { notifications, dismiss } = useNotification();

  return (
    <div className="portfolio-notification-viewport" aria-label="Notifications">
      {notifications.map((notice) => {
        const config = NOTIFICATION_CONFIG[notice.type] || NOTIFICATION_CONFIG.info;
        const Icon = config.icon;

        return (
          <div
            className={`portfolio-notification is-${notice.type}`}
            key={notice.id}
            role="alert"
            aria-label={config.label}
            style={{ '--notification-duration': `${notice.duration}ms` }}
          >
            <span className="portfolio-notification-icon"><Icon size={18} /></span>
            <p>{notice.message}</p>
            <button type="button" onClick={() => dismiss(notice.id)} aria-label="Dismiss notification">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

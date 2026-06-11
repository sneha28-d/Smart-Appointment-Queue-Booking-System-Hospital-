import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import type { Notification } from '../../types';
import { useSocket } from '../../hooks/useSocket';

const typeConfig: Record<string, { icon: string; color: string }> = {
  info:    { icon: 'ℹ️', color: 'bg-blue-50 border-blue-100' },
  success: { icon: '✅', color: 'bg-green-50 border-green-100' },
  warning: { icon: '⚠️', color: 'bg-amber-50 border-amber-100' },
  error:   { icon: '❌', color: 'bg-red-50 border-red-100' },
  booking: { icon: '📅', color: 'bg-emerald-50 border-emerald-100' },
  cancellation: { icon: '🚫', color: 'bg-rose-50 border-rose-100' },
  queue:   { icon: '🔢', color: 'bg-purple-50 border-purple-100' },
  system:  { icon: '⚙️', color: 'bg-slate-50 border-slate-100' },
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { socket } = useSocket();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await adminService.getNotifications();
        setNotifications(data || []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif: Notification) => {
      setNotifications(prev => [notif, ...prev]);
      toast.success(notif.title || 'New Admin Notification', { icon: typeConfig[notif.type]?.icon || '🔔' });
    };

    socket.on('admin-notification', handleNewNotification);
    return () => {
      socket.off('admin-notification', handleNewNotification);
    };
  }, [socket]);

  const markRead = async (id: string) => {
    try {
      await adminService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  const markAllRead = async () => {
    try {
      await adminService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const unread = notifications.filter(n => !n.isRead).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-10 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            {unread > 0 && (
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-0.5">System alerts and activity updates</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { label: 'All', value: 'all' as const },
          { label: `Unread (${unread})`, value: 'unread' as const },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              filter === f.value ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-600 border-slate-200 hover:border-blue-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-slate-500 font-medium">No {filter === 'unread' ? 'unread ' : ''}notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => {
            const config = typeConfig[n.type] || typeConfig.info;
            return (
              <div
                key={n._id}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${config.color} ${!n.isRead ? 'shadow-md' : 'opacity-70'}`}
                onClick={() => !n.isRead && markRead(n._id)}
              >
                {/* Unread dot */}
                {!n.isRead && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-blue-600" />
                )}

                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 flex-shrink-0">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-900 text-sm">{n.title}</p>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{n.message}</p>
                    <p className="text-slate-400 text-xs mt-2 font-medium">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;

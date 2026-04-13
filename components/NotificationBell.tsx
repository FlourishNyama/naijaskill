"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell, CheckCheck, Briefcase, DollarSign,
  UserCheck, MessageSquare, Star, ShieldCheck, Info,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  booking_request:   { icon: Briefcase,      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  hired:             { icon: UserCheck,       color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  escrow_funded:     { icon: ShieldCheck,     color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  payment_released:  { icon: DollarSign,      color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  new_application:   { icon: Briefcase,       color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  message:           { icon: MessageSquare,   color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  review_received:   { icon: Star,            color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  identity_verified: { icon: ShieldCheck,     color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  security_alert:    { icon: Info,            color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
};

const DEFAULT_CONFIG = { icon: Bell, color: 'text-gray-500 bg-gray-100 dark:bg-slate-700' };

function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return 'Just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ── Fetch + subscribe ──────────────────────────────────────────────────────
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Initial fetch
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(25);

      if (data) setNotifications(data);

      // Real-time: prepend new notifications as they arrive
      const channel = supabase
        .channel(`notif:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 25));
          }
        )
        .subscribe();

      cleanup = () => { supabase.removeChannel(channel); };
    };

    init();
    return () => cleanup?.();
  }, []);

  // ── Check push permission ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as any).OneSignalDeferred?.push?.((OneSignal: any) => {
      setPushEnabled(OneSignal.Notifications.permissionNative === 'granted');
    });
  }, []);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const markAllRead = async () => {
    if (!userId) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markOneRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const enablePush = () => {
    (window as any).OneSignalDeferred?.push?.(async (OneSignal: any) => {
      await OneSignal.Notifications.requestPermission();
      setPushEnabled(OneSignal.Notifications.permissionNative === 'granted');
    });
  };

  if (!userId) return null;

  return (
    <div className="relative" ref={dropdownRef}>

      {/* ── Bell Button ── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-20 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 font-medium flex items-center gap-1 transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[380px]">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => {
                  const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
                  const Icon = cfg.icon;
                  const rowClass = `flex gap-3 px-4 py-3.5 transition border-b border-gray-50 dark:border-gray-800/60 last:border-0 ${
                    !n.is_read
                      ? 'bg-green-50/60 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`;

                  const inner = (
                    <>
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${cfg.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.is_read && (
                        <div className="shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2" />
                      )}
                    </>
                  );

                  return n.link ? (
                    <Link
                      key={n.id}
                      href={n.link}
                      className={rowClass}
                      onClick={() => { markOneRead(n.id); setIsOpen(false); }}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      key={n.id}
                      className={`${rowClass} cursor-default`}
                      onClick={() => markOneRead(n.id)}
                    >
                      {inner}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer — push opt-in prompt */}
            {pushEnabled === false && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-green-50 dark:bg-green-900/10">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  Get notified even when you&apos;re away from the site.
                </p>
                <button
                  onClick={enablePush}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg transition"
                >
                  Enable Push Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

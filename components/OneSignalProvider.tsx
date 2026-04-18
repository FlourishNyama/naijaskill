"use client";
import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export function OneSignalProvider() {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId || typeof window === 'undefined') return;

    (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
    (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        await OneSignal.init({
          appId,
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: true,
        });

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await OneSignal.login(user.id);

        // Prompt for push every 3rd login if not yet granted
        const key = `os_logins_${user.id}`;
        const count = parseInt(localStorage.getItem(key) || '0') + 1;
        localStorage.setItem(key, String(count));

        const permission = OneSignal.Notifications.permissionNative;
        if (permission !== 'granted' && count % 3 === 0) {
          setTimeout(() => {
            OneSignal.Slidedown.promptPush();
          }, 3000);
        }
      } catch (err) {
        console.error('[OneSignal] init error:', err);
      }
    });
  }, []);

  return null;
}

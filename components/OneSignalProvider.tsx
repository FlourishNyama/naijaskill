"use client";
import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * Initialises the OneSignal Web SDK and links the subscription to the
 * current Supabase user's ID so we can target them server-side.
 * Renders nothing — drop it anywhere inside the client tree.
 */
export function OneSignalProvider() {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId || typeof window === 'undefined') return;

    (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
    (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        await OneSignal.init({
          appId,
          notifyButton: { enable: false }, // we use our own bell UI
          allowLocalhostAsSecureOrigin: true, // allows testing on localhost
        });

        // Link this browser subscription to the logged-in Supabase user
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await OneSignal.login(user.id); // sets external_id = supabase user ID
        }
      } catch (err) {
        // OneSignal init errors should never crash the app
        console.error('[OneSignal] init error:', err);
      }
    });
  }, []);

  return null;
}

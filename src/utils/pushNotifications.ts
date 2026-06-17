import { supabase } from '../lib/supabase';

// Helper to convert VAPID public key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function subscribeToPushNotifications(userId: string) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications are not supported by the browser.');
        return { success: false, error: 'Not supported' };
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        if (!publicVapidKey) {
            console.error('VITE_VAPID_PUBLIC_KEY is not defined');
            return { success: false, error: 'Missing VAPID key' };
        }

        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });
        }

        // Parse subscription to save in database
        const subJson = subscription.toJSON();
        
        if (!subJson.endpoint || !subJson.keys) {
            return { success: false, error: 'Invalid subscription object' };
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: userId,
                endpoint: subJson.endpoint,
                p256dh: subJson.keys.p256dh,
                auth: subJson.keys.auth,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id, endpoint'
            });

        if (error) {
            console.error('Error saving push subscription:', error);
            return { success: false, error };
        }

        console.log('Push subscription saved successfully!');
        return { success: true };
    } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
        return { success: false, error };
    }
}

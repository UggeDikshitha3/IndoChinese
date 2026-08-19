/**
 * Browser Notification Utilities for INDO CHINESE Restaurant
 * Handles Web Notifications API permissions, sending notifications, and user preferences.
 */

import { NotificationPreferences } from '../types';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: false,
  orderStatus: true,
  offers: true,
  reservations: true,
};

/**
 * Check if the current browser environment supports the Notifications API.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission state.
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return Notification.permission;
  }
}

/**
 * Send a browser desktop/mobile push notification.
 */
export function sendBrowserNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    data?: any;
    onClick?: () => void;
  }
): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=128&q=80',
      badge: options?.icon || 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=128&q=80',
      tag: options?.tag || 'indochinese-alert',
      data: options?.data,
    });

    notification.onclick = () => {
      window.focus();
      if (options?.onClick) {
        options.onClick();
      }
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Could not display browser notification:', err);
    return false;
  }
}

/**
 * Dispatch an order status update notification.
 */
export function notifyOrderStatus(
  orderNumber: string,
  status: string,
  customerPrefs?: NotificationPreferences
): boolean {
  if (customerPrefs && (!customerPrefs.enabled || !customerPrefs.orderStatus)) {
    return false;
  }

  const formattedStatus = status.replace(/_/g, ' ').toUpperCase();
  let message = `Your order #${orderNumber} is now ${formattedStatus.toLowerCase()}.`;

  if (status === 'preparing') {
    message = `🔥 Order #${orderNumber} is sizzling in the wok! Our chef is preparing your dishes fresh.`;
  } else if (status === 'ready') {
    message = `🥡 Order #${orderNumber} is packed and ready for collection at our Hounslow branch!`;
  } else if (status === 'out_for_delivery') {
    message = `🛵 Order #${orderNumber} is on its way to your address! Get ready to feast.`;
  } else if (status === 'completed') {
    message = `✨ Order #${orderNumber} has been delivered! Enjoy your authentic Bombay Chinese feast!`;
  }

  return sendBrowserNotification(`INDO CHINESE: Order Status Update`, {
    body: message,
    tag: `order-${orderNumber}`,
  });
}

/**
 * Dispatch an exclusive promo/offer notification.
 */
export function notifyExclusiveOffer(
  title: string,
  discountCode?: string,
  details?: string,
  customerPrefs?: NotificationPreferences
): boolean {
  if (customerPrefs && (!customerPrefs.enabled || !customerPrefs.offers)) {
    return false;
  }

  const body = discountCode
    ? `${details || 'Special Bombay Chinese Deal!'} Use code: ${discountCode}`
    : details || 'Tap to explore our latest chef specials and weekend discounts.';

  return sendBrowserNotification(`🎁 Special Offer: ${title}`, {
    body,
    tag: `offer-${Date.now()}`,
  });
}

/**
 * Dispatch a sample test notification for the user to confirm browser compatibility.
 */
export function sendTestNotification(): boolean {
  return sendBrowserNotification('🍜 INDO CHINESE Hounslow', {
    body: '✅ Notifications are working! You will now receive instant updates on your orders and exclusive Bombay offers.',
    tag: 'test-notification',
  });
}

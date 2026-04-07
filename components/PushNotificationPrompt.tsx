import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Sparkles, Leaf } from 'lucide-react';
import { insforge } from '../insforge';

// ── VAPID public key – must match the one in functions/send-push.js ──────────
export const VAPID_PUBLIC_KEY =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

const STORAGE_KEY = 'galimandi_push_decision';
const DELAY_MS = 4000;

function isPushSupported(): boolean {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

/** Registers SW, subscribes to push, and saves subscription to InsForge DB */
async function subscribeAndSave(): Promise<boolean> {
  try {
    // 1. Register / get existing SW
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    // 2. Subscribe to push
    const rawKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: rawKey.buffer as ArrayBuffer,
    });

    // 3. Persist to DB — upsert based on endpoint
    const { error } = await insforge.database
      .from('push_subscriptions')
      .upsert(
        [{
          endpoint: subscription.endpoint,
          subscription_object: subscription.toJSON(),
          is_active: true,
          created_at: new Date().toISOString(),
        }],
        { onConflict: 'endpoint' }
      );

    if (error) console.warn('[Push] DB save warning:', error.message);
    return true;
  } catch (err) {
    console.error('[Push] Subscribe error:', err);
    return false;
  }
}

export default function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    if (!isPushSupported()) return;
    const decision = localStorage.getItem(STORAGE_KEY);
    if (decision) return;
    if (Notification.permission !== 'default') {
      localStorage.setItem(STORAGE_KEY, Notification.permission);
      return;
    }
    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    setStatus('loading');
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem(STORAGE_KEY, permission);

      if (permission === 'granted') {
        await subscribeAndSave();
        setStatus('granted');
        setTimeout(() => setVisible(false), 2500);
      } else {
        setStatus('denied');
        setTimeout(() => setVisible(false), 1500);
      }
    } catch (err) {
      console.error('[Push] Error:', err);
      setStatus('denied');
      setTimeout(() => setVisible(false), 1500);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'dismissed');
    setVisible(false);
  };

  const benefits = [
    { icon: '🔥', text: 'Flash sales' },
    { icon: '🚚', text: 'Order updates' },
    { icon: '🎁', text: 'Exclusive offers' },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Card */}
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="fixed z-[201] bottom-0 left-0 right-0 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:w-[420px]"
          >
            <div className="bg-white md:rounded-[2rem] rounded-t-[2rem] shadow-2xl shadow-primary/20 overflow-hidden border border-primary/10 relative">

              {/* Top gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-primary to-green-600" />

              {/* Dismiss × */}
              <button
                onClick={handleDismiss}
                aria-label="Dismiss"
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all z-10"
              >
                <X size={18} />
              </button>

              <div className="p-6 pt-8">
                {/* Icon + headline */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-green-100 rounded-2xl flex items-center justify-center shadow-inner">
                      {status === 'granted' ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                          <Bell size={30} className="text-primary" />
                        </motion.div>
                      ) : status === 'denied' ? (
                        <BellOff size={30} className="text-gray-400" />
                      ) : (
                        <motion.div
                          animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
                        >
                          <Bell size={30} className="text-primary" />
                        </motion.div>
                      )}
                    </div>
                    {status === 'idle' && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white">
                        <span className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 pr-6">
                    {status === 'granted' ? (
                      <>
                        <h2 className="text-lg font-black text-gray-900 leading-tight">You're all set! 🎉</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">You'll receive fresh deals & order updates.</p>
                      </>
                    ) : status === 'denied' ? (
                      <>
                        <h2 className="text-lg font-black text-gray-900 leading-tight">No worries!</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Enable via browser settings anytime.</p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles size={13} className="text-orange-400" />
                          <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Never miss a deal</span>
                        </div>
                        <h2 className="text-lg font-black text-gray-900 leading-tight">
                          Stay fresh with<br /><span className="text-primary">Galimandi</span> alerts
                        </h2>
                      </>
                    )}
                  </div>
                </div>

                {/* Benefits */}
                {(status === 'idle' || status === 'loading') && (
                  <div className="flex gap-2 mb-6">
                    {benefits.map((b, i) => (
                      <div key={i} className="flex-1 bg-gray-50 rounded-xl p-2.5 flex flex-col items-center gap-1 text-center border border-gray-100">
                        <span className="text-xl">{b.icon}</span>
                        <span className="text-[10px] font-bold text-gray-600 leading-tight">{b.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                {(status === 'idle' || status === 'loading') && (
                  <div className="flex flex-col gap-3">
                    <motion.button
                      onClick={handleAllow}
                      disabled={status === 'loading'}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-4 bg-primary text-white font-black text-sm rounded-[1rem] uppercase tracking-widest shadow-lg shadow-primary/30 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {status === 'loading' ? (
                        <>
                          <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                          Enabling…
                        </>
                      ) : (
                        <><Bell size={16} /> Enable Notifications</>
                      )}
                    </motion.button>
                    <button onClick={handleDismiss} className="w-full py-3 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-700 transition-colors rounded-xl hover:bg-gray-50">
                      Not now
                    </button>
                  </div>
                )}

                {(status === 'granted' || status === 'denied') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`w-full py-4 rounded-[1rem] flex items-center justify-center gap-2 font-bold text-sm ${status === 'granted' ? 'bg-green-50 text-primary border border-primary/20' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}
                  >
                    {status === 'granted' ? <><span>✅</span> Notifications enabled!</> : <><span>🔕</span> Notifications blocked</>}
                  </motion.div>
                )}

                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-center gap-1.5">
                  <Leaf size={11} className="text-primary opacity-60" />
                  <span className="text-[10px] text-gray-400 font-semibold">Galimandi · No spam, only fresh deals</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

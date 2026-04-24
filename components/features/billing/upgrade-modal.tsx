'use client';

import { useState, useCallback } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { X } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!;
const ANNUAL_PRICE_ID  = process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID!;

interface UpgradeModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function UpgradeModal({ onClose, onSuccess }: UpgradeModalProps) {
  const [selectedPrice, setSelectedPrice] = useState<'monthly' | 'annual'>('annual');
  const [showCheckout, setShowCheckout] = useState(false);

  const fetchClientSecret = useCallback(async () => {
    const priceId = selectedPrice === 'annual' ? ANNUAL_PRICE_ID : MONTHLY_PRICE_ID;
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json() as { clientSecret?: string };
    return data.clientSecret ?? '';
  }, [selectedPrice]);

  const options = {
    fetchClientSecret,
    onComplete: () => {
      onClose();
      onSuccess?.();
    },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-[#111318] border border-[#2a2d35] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">Upgrade to Pro</h2>
            <p className="text-sm text-gray-400 mt-0.5">Unlimited diagrams, auto-save, and more.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {!showCheckout ? (
          <div className="px-6 pb-6 flex flex-col gap-4">
            {/* Plan selector */}
            <div className="grid grid-cols-2 gap-3">
              {/* Monthly */}
              <button
                type="button"
                onClick={() => setSelectedPrice('monthly')}
                className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  selectedPrice === 'monthly'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-[#2a2d35] hover:border-gray-500'
                }`}
              >
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Monthly</span>
                <span className="text-2xl font-bold text-gray-100">$5</span>
                <span className="text-xs text-gray-500">per month</span>
              </button>

              {/* Annual */}
              <button
                type="button"
                onClick={() => setSelectedPrice('annual')}
                className={`relative flex flex-col gap-1 p-4 rounded-xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  selectedPrice === 'annual'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-[#2a2d35] hover:border-gray-500'
                }`}
              >
                <span className="absolute top-3 right-3 text-[10px] font-semibold bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                  Save 25%
                </span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Annual</span>
                <span className="text-2xl font-bold text-gray-100">$45</span>
                <span className="text-xs text-gray-500">per year · $3.75/mo</span>
              </button>
            </div>

            {/* Features list */}
            <ul className="space-y-2 text-sm text-gray-300">
              {['Unlimited diagrams', 'Auto-save', 'All component libraries', 'Priority support'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setShowCheckout(true)}
              className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Continue to payment
            </button>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </div>
  );
}

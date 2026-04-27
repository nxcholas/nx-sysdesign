"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { X, Pencil, Check, Loader2 } from "lucide-react";
import { clearCurrentNamespace } from "@/lib/diagram-storage";

interface AccountModalProps {
  onClose: () => void;
  onUpgrade: () => void;
  onBeforeSignOut: () => Promise<void>;
}

interface SubscriptionData {
  status: string | null;
  currentPeriodEnd?: string;
}

function statusLabel(status: string) {
  switch (status) {
    case "active":
      return "Active";
    case "trialing":
      return "Trialing";
    case "past_due":
      return "Past due";
    case "canceled":
      return "Canceled";
    default:
      return status;
  }
}

export function AccountModal({ onClose, onUpgrade, onBeforeSignOut }: AccountModalProps) {
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;
  const isPro = user?.tier === "pro";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    if (!isPro) return;
    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then((d) => setSubscription(d as SubscriptionData))
      .catch(() => setSubscription({ status: null }));
  }, [isPro]);

  async function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === user?.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (res.ok) {
      // Pass the new name directly so the client session reflects it immediately.
      // The JWT callback only reads tier/emailVerified from DB, not name, so
      // updateSession() alone would leave the displayed name stale.
      await updateSession({ user: { name: trimmed } });
    }
    setSavingName(false);
    setEditingName(false);
  }

  async function handleManageBilling() {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("[billing] portal error:", data.error);
        setBillingLoading(false);
      }
    } catch (err) {
      console.error("[billing] portal fetch failed:", err);
      setBillingLoading(false);
    }
  }

  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const isCanceled = subscription?.status === "canceled";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Account settings"
        className="relative w-full max-w-sm bg-[#111318] border border-[#2a2d35] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X size={16} />
        </button>

        <div className="px-6 pt-6 pb-5 flex flex-col gap-5">
          {/* Section 1 — User info */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium text-gray-300">
                  {initials}
                </span>
              )}
            </div>

            {/* Editable name */}
            {editingName ? (
              <div className="flex items-center gap-1.5 w-full">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSaveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="flex-1 bg-[#1a1d24] border border-[#2a2d35] rounded-md px-2 py-1 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  aria-label="Edit display name"
                />
                <button
                  type="button"
                  onClick={() => void handleSaveName()}
                  disabled={savingName}
                  aria-label="Save name"
                  className="text-blue-400 hover:text-blue-300 disabled:opacity-50 focus-visible:outline-none"
                >
                  {savingName ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingName(false);
                    setNameInput(user?.name ?? "");
                  }}
                  aria-label="Cancel edit"
                  className="text-gray-500 hover:text-gray-300 focus-visible:outline-none"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-100">
                  {user?.name ?? "Anonymous"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(user?.name ?? "");
                    setEditingName(true);
                  }}
                  aria-label="Edit name"
                  className="text-gray-600 hover:text-gray-400 transition-colors focus-visible:outline-none"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}

            <span className="text-xs text-gray-500 -mt-2">{user?.email}</span>
          </div>

          <div className="border-t border-[#2a2d35]" />

          {/* Section 2 — Subscription */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              Subscription
            </span>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isPro
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-gray-700/60 text-gray-400 border border-gray-600/40"
                }`}
              >
                {isPro ? "Pro" : "Free"}
              </span>
              {!isPro && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onUpgrade();
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
                >
                  Upgrade to Pro →
                </button>
              )}
            </div>
          </div>

          {/* Section 3 — Billing (Pro only) */}
          {isPro && (
            <>
              <div className="border-t border-[#2a2d35]" />
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                  Billing
                </span>
                {subscription ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Status</span>
                      <span
                        className={`font-medium ${subscription.status === "past_due" ? "text-yellow-400" : "text-gray-200"}`}
                      >
                        {subscription.status
                          ? statusLabel(subscription.status)
                          : "—"}
                      </span>
                    </div>
                    {periodEnd && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          {isCanceled ? "Expires" : "Renews"}
                        </span>
                        <span className="text-gray-200 font-medium">
                          {periodEnd}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleManageBilling()}
                      disabled={billingLoading}
                      className="mt-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
                    >
                      {billingLoading ? "Opening portal…" : "Manage billing →"}
                    </button>
                  </div>
                ) : (
                  <div className="h-4 bg-gray-800 rounded animate-pulse w-32" />
                )}
              </div>
            </>
          )}

          <div className="border-t border-[#2a2d35]" />

          {/* Footer actions */}
          <div className="flex items-center justify-between">
            {isPro && (
              <button
                type="button"
                onClick={() => void handleManageBilling()}
                disabled={billingLoading}
                className="text-xs text-gray-600 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
              >
                Cancel subscription
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                void onBeforeSignOut().then(() => {
                  clearCurrentNamespace();
                  void signOut({ callbackUrl: `${window.location.origin}/sign-in` });
                });
              }}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

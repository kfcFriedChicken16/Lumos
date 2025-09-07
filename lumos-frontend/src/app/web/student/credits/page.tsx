"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCredits } from "@/contexts/CreditContext";
import {
  Wallet,
  Coins,
  CreditCard,
  Banknote,
  Gift,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Info,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

/**
 * Lumos Wallet — Top Up Credits (React Preview)
 * --------------------------------------------
 * • Show balance in credits + RM
 * • Quick packs + custom amount (credits)
 * • Promo code (demo)
 * • Payment methods for MY (Card, FPX online banking, Touch 'n Go, GrabPay) — demo only
 * • Order summary + Pay button
 * • Success modal + lightweight transaction history
 * • Pastel/undraw style; Tailwind + Framer Motion; no backend
 */

// --- Pricing model (demo) ---
// 1 credit = RM1 for clarity
const RM_PER_CREDIT = 1;

// Bonus tiers (demo)
function calcBonus(credits: number): number {
  if (credits >= 200) return 40; // 20%
  if (credits >= 100) return 15; // 15%
  if (credits >= 50) return 5; // 10%
  return 0;
}

// Promo codes (demo)
const PROMOS: Record<string, { bonusPct?: number; extraCredits?: number; note: string }> = {
  LUMOS10: { bonusPct: 10, note: "+10% bonus credits" },
  STUDENT5: { extraCredits: 5, note: "+5 credits" },
};

// Payment methods
const METHODS = [
  { id: "card", label: "Debit/Credit Card (Visa/Mastercard)", icon: CreditCard },
  { id: "fpx", label: "FPX Online Banking (Malaysia)", icon: Banknote },
  { id: "tng", label: "Touch 'n Go eWallet", icon: QrCode },
  { id: "grabpay", label: "GrabPay", icon: QrCode },
] as const;

type PaymentId = typeof METHODS[number]["id"];

// Seed transactions
type Txn = { id: string; when: string; method: string; credits: number; rm: number; note?: string };
const seedTxns: Txn[] = [
  { id: "TXN-00045", when: "2025-08-02 19:12", method: "Card", credits: 50, rm: 50, note: "+5 bonus" },
  { id: "TXN-00044", when: "2025-07-15 21:03", method: "FPX", credits: 20, rm: 20 },
];

function fmtRM(v: number) {
  return `RM${v.toFixed(2)}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export default function LumosWalletTopUp() {
  const { creditBalance: balance, addCredits } = useCredits();
  const [txns, setTxns] = useState<Txn[]>(seedTxns);

  // Top-up state
  const packs = [20, 50, 100, 200] as const;
  const [selectedPack, setSelectedPack] = useState<number | null>(50);
  const [customCredits, setCustomCredits] = useState<number>(50);
  const [method, setMethod] = useState<PaymentId>("fpx");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<{ open: boolean; txn?: Txn }>(() => ({ open: false }));

  // Keep custom in sync with pack
  React.useEffect(() => {
    if (selectedPack) setCustomCredits(selectedPack);
  }, [selectedPack]);

  const { baseCredits, tierBonus, promoBonus, finalCredits, totalRM } = useMemo(() => {
    const base = Math.max(10, Math.min(500, Math.round(customCredits)));
    const tier = calcBonus(base);
    const promo = appliedPromo ? Math.floor(base * ((PROMOS[appliedPromo]?.bonusPct || 0) / 100)) + (PROMOS[appliedPromo]?.extraCredits || 0) : 0;
    const final = base + tier + promo;
    const rm = base * RM_PER_CREDIT; // pay only base credits; bonuses are free
    return { baseCredits: base, tierBonus: tier, promoBonus: promo, finalCredits: final, totalRM: rm };
  }, [customCredits, appliedPromo]);

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (!PROMOS[code]) {
      alert("Invalid code");
      return;
    }
    setAppliedPromo(code);
  }

  function clearPromo() {
    setAppliedPromo(null);
    setPromoInput("");
  }

  async function pay() {
    if (processing) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate gateway

    // Update balance, add transaction
    addCredits(finalCredits);
    const id = `TXN-${uid()}`;
    const mLabel = METHODS.find((m) => m.id === method)?.label.split(" ")[0] || method;
    const newTxn: Txn = { id, when: new Date().toISOString().slice(0, 16).replace("T", " "), method: mLabel, credits: finalCredits, rm: totalRM, note: (tierBonus || promoBonus) ? `+${tierBonus + promoBonus} bonus` : undefined };
    setTxns((t) => [newTxn, ...t]);
    setProcessing(false);
    setSuccess({ open: true, txn: newTxn });
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-orange-50 via-yellow-50 to-amber-50 text-slate-700">
      {/* Header */}
      <div className="mx-auto max-w-5xl px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.href = "/web/dashboard/student"}
              className="flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-2 text-sm font-medium text-orange-700 shadow-sm hover:bg-orange-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-white shadow-sm">
              <Wallet className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-wide text-orange-700">Wallet & Top Up</div>
              <div className="text-xs text-slate-500">Buy credits for live help & notes</div>
            </div>
          </div>
          <div className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-xs shadow-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure • PDPA Ready
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 pb-10 md:grid-cols-3">
        {/* Left column: picker */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Balance */}
          <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700 border border-orange-100">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Current balance</div>
                  <div className="text-lg font-semibold text-slate-800">{balance} credits</div>
                  <div className="text-[11px] text-slate-500">≈ {fmtRM(balance * RM_PER_CREDIT)}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-500">1 credit = {fmtRM(RM_PER_CREDIT)}</div>
            </div>
          </motion.div>

          {/* Packs */}
          <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-orange-700">Choose a pack</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {packs.map((p) => {
                const bonus = calcBonus(p);
                const active = selectedPack === p;
                return (
                  <button key={p} onClick={() => setSelectedPack(p)} className={`rounded-xl border px-3 py-3 text-left shadow-sm transition ${active ? "border-orange-300 bg-orange-50" : "border-orange-100 bg-white hover:bg-orange-50"}`}>
                    <div className="text-base font-bold text-slate-800">{p} cr</div>
                    <div className="text-[11px] text-slate-500">Pay {fmtRM(p * RM_PER_CREDIT)}</div>
                    {bonus > 0 && <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700"><Gift className="h-3.5 w-3.5" />+{bonus} bonus</div>}
                  </button>
                );
              })}
            </div>

            {/* Custom amount */}
            <div className="mt-3">
              <div className="text-xs mb-1">Or enter a custom amount (10–500 credits)</div>
              <div className="flex items-center gap-2">
                <input type="number" value={customCredits} onChange={(e) => { setSelectedPack(null); setCustomCredits(Number(e.target.value || 0)); }} min={10} max={500} step={5} className="w-40 rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-sm outline-none" />
                <span className="text-xs text-slate-500">You pay {fmtRM(Math.max(10, Math.min(500, Math.round(customCredits))) * RM_PER_CREDIT)}</span>
              </div>
            </div>
          </motion.div>

          {/* Promo */}
          <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-orange-700">Promo code</div>
            <div className="flex items-center gap-2">
              <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Enter code (e.g., LUMOS10)" className="flex-1 rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-sm outline-none" />
              <button onClick={applyPromo} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">Apply</button>
              {appliedPromo && (
                <button onClick={clearPromo} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">Clear</button>
              )}
            </div>
            {appliedPromo && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                <Gift className="h-3.5 w-3.5" /> {appliedPromo} applied — {PROMOS[appliedPromo].note}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right column: summary + history */}
        <div className="flex flex-col gap-4">
          {/* Method & summary */}
          <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-orange-700">Payment method</div>
            <div className="space-y-2">
              {METHODS.map((m) => (
                <label key={m.id} className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 ${method === m.id ? "border-orange-300 bg-orange-50" : "border-orange-100 bg-white hover:bg-orange-50"}`}>
                  <div className="flex items-center gap-2">
                    <m.icon className="h-5 w-5 text-orange-600" />
                    <span className="text-sm text-slate-700">{m.label}</span>
                  </div>
                  <input type="radio" name="pm" checked={method === m.id} onChange={() => setMethod(m.id)} />
                </label>
              ))}
            </div>

            <div className="mt-4 h-px bg-orange-100" />

            <div className="mt-3 text-sm font-semibold text-orange-700">Order summary</div>
            <ul className="mt-1 text-sm text-slate-700">
              <li className="flex items-center justify-between"><span>Base credits</span><span>{baseCredits} cr</span></li>
              <li className="flex items-center justify-between"><span>Tier bonus</span><span>+{tierBonus} cr</span></li>
              <li className="flex items-center justify-between"><span>Promo bonus</span><span>+{promoBonus} cr</span></li>
              <li className="flex items-center justify-between font-semibold"><span>Total credits</span><span>{finalCredits} cr</span></li>
              <li className="mt-2 flex items-center justify-between text-slate-500"><span>Charged amount</span><span>{fmtRM(totalRM)}</span></li>
            </ul>

            <button onClick={pay} disabled={processing} className="mt-3 w-full rounded-full border border-orange-200 bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 disabled:opacity-60">
              {processing ? "Processing…" : `Pay ${fmtRM(totalRM)}`}
            </button>

            <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Info className="h-3.5 w-3.5" /> You can use credits for live tutor sessions and marketplace notes. Credits are non‑refundable (demo).
            </div>
          </motion.div>

          {/* History */}
          <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-orange-700">Recent transactions</div>
              <button onClick={() => alert("Open full history (demo)")} className="text-xs text-orange-700 inline-flex items-center gap-1">View all <ChevronRight className="h-3 w-3" /></button>
            </div>
            <ul className="divide-y divide-orange-100 text-sm">
              {txns.map((t) => (
                <li key={t.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">{t.id}</div>
                    <div className="text-[11px] text-slate-500">{t.when} • {t.method} {t.note ? `• ${t.note}` : ""}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-700">+{t.credits} cr</div>
                    <div className="text-[11px] text-slate-500">Paid {fmtRM(t.rm)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Success modal */}
      <AnimatePresence>
        {success.open && success.txn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-5 shadow-lg">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-5 w-5" /> Payment successful
              </div>
              <ul className="mt-2 text-sm text-slate-700">
                <li className="flex items-center justify-between"><span>Transaction ID</span><span>{success.txn.id}</span></li>
                <li className="flex items-center justify-between"><span>Added credits</span><span>{success.txn.credits} cr</span></li>
                <li className="flex items-center justify-between"><span>Amount paid</span><span>{fmtRM(success.txn.rm)}</span></li>
                <li className="flex items-center justify-between"><span>When</span><span>{success.txn.when}</span></li>
              </ul>
                             <div className="mt-3 flex items-center justify-end gap-2">
                 <button onClick={() => setSuccess({ open: false })} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">Close</button>
                 <button onClick={() => { setSuccess({ open: false }); window.location.href = "/web/dashboard/student"; }} className="rounded-full border border-orange-200 bg-orange-500 px-4 py-2 text-sm font-medium text-white">Return to Dashboard</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

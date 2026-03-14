"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface PaymentSuccessModalProps {
  onClose: () => void;
  plan: string;
}

export function PaymentSuccessModal({ onClose, plan }: PaymentSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-brand-card w-full max-w-md rounded-3xl border border-brand-primary/30 shadow-2xl p-8 text-center relative overflow-hidden"
      >
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-brand-primary/20 blur-[80px] -z-10" />

        <div className="mx-auto size-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
          >
            <CheckCircle2 className="size-10 text-emerald-500" />
          </motion.div>
        </div>

        <h2 className="text-2xl font-black text-brand-text mb-2">Pagamento Confirmado!</h2>
        <p className="text-brand-muted text-sm mb-8">
          Parabéns! Sua lavanderia agora está no plano <strong className="text-brand-primary uppercase">{plan}</strong>.
          Todas as funcionalidades extras já estão liberadas para você.
        </p>

        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primaryHover transition-all"
          >
            Começar a Usar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

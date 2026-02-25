'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';

export default function SuccessPage() {
  const [regId, setRegId] = useState<string>('');

  useEffect(() => {
    setRegId(`REG-2026-${Math.floor(Math.random() * 89999) + 10000}`);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 max-w-lg w-full text-center relative z-10"
      >
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
          <CheckCircle className="w-10 h-10 text-black" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Registration Successful!</h1>
        <p className="text-gray-400 mb-8">
          Thank you for applying. Your application has been received and is under review. A confirmation email has been sent to your registered address.
        </p>

        <div className="space-y-4">
          <button className="w-full glass-button py-3 rounded-xl font-semibold flex items-center justify-center gap-2 group">
            <Download className="w-5 h-5" /> Download Receipt
          </button>
          
          <Link href="/" className="btn-primary w-full flex items-center justify-center gap-2">
            Back to Home <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-xs text-gray-500 h-4">
            {regId && (
              <>
                Registration ID: <span className="text-emerald-500 font-mono">{regId}</span>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

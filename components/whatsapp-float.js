'use client';

import { MessageCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const phoneNumber = '919110427144';
  const message = encodeURIComponent('Hi! I\'d like to know more about Flowternity Academy. Can you help me?');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="WhatsApp chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Bubble */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-80 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-green-500 text-white p-4">
            <h3 className="font-bold text-lg">Flowternity Academy</h3>
            <p className="text-sm text-green-50">Usually replies instantly</p>
          </div>

          {/* Message Preview */}
          <div className="p-4 space-y-3">
            <p className="text-sm text-slate-700">
              👋 Hi there! Have questions about our memberships or classes?
            </p>
            <p className="text-xs text-slate-500">
              Click the button below to chat with us on WhatsApp!
            </p>
          </div>

          {/* CTA Button */}
          <div className="p-4 border-t border-slate-200">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}

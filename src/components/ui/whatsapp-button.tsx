'use client';

import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/77272618161"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}

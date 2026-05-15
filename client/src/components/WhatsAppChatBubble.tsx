import { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { getWhatsAppLink, trackWhatsAppClick, trackEvent } from '@/lib/conversion';

/**
 * WhatsAppChatBubble — Notification d'invitation au chat WhatsApp
 * - Apparaît après 5 secondes
 * - Visible sur toutes les pages (intégré au Layout)
 * - Cliquer ouvre WhatsApp avec un message pré-rempli
 * - Si fermée, ne réapparaît pas pendant la session
 */
export default function WhatsAppChatBubble() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé la bulle dans cette session
    const wasDismissed = sessionStorage.getItem('gtc_chat_bubble_dismissed') === 'true';
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Apparaître après 5 secondes
    const timer = setTimeout(() => {
      setVisible(true);
      trackEvent('chat_bubble_shown', { source: 'whatsapp_invitation' });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('gtc_chat_bubble_dismissed', 'true');
    trackEvent('chat_bubble_dismissed', { source: 'whatsapp_invitation' });
  };

  const handleClick = () => {
    trackWhatsAppClick('software');
    trackEvent('chat_bubble_clicked', { source: 'whatsapp_invitation' });
    sessionStorage.setItem('gtc_chat_bubble_dismissed', 'true');
    setVisible(false);
  };

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed bottom-24 right-6 z-[60] max-w-xs animate-slide-in-up"
      style={{ animation: 'slideInUp 0.5s ease-out' }}
    >
      <a
        href={getWhatsAppLink('software')}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-[0_20px_50px_rgba(30,144,255,0.25)] transition-all duration-300 group"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1E90FF] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
              <MessageCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight">GTC Support</p>
              <p className="text-[#00D4FF] text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse"></span>
                En ligne
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Fermer la notification"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message body */}
        <div className="px-4 py-4">
          <p className="text-[#0B1F3A] text-sm leading-relaxed mb-3">
            Besoin d'un <span className="font-semibold text-[#1E90FF]">système automatisé</span> ou
            d'une <span className="font-semibold text-[#1E90FF]">analyse de données</span> ?
          </p>
          <p className="text-[#64748B] text-xs leading-relaxed mb-4">
            Réponse en moins de <span className="font-bold text-[#0B1F3A]">5 minutes</span> sur WhatsApp.
          </p>

          {/* CTA */}
          <div className="bg-[#25D366] hover:bg-[#1ebc59] text-white text-sm font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors group-hover:scale-[1.02] transform duration-200">
            <MessageCircle size={16} />
            Démarrer la conversation
          </div>
        </div>
      </a>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X, Gift, CheckCircle2, Sparkles } from 'lucide-react';
import { trackEvent, trackLead } from '@/lib/conversion';

const WA_NUMBER = '243829664720';
const STORAGE_KEY = 'gtc_lead_popup_seen';
const TRIGGER_DELAY_MS = 9000; // 9 secondes (entre 8 et 10s)

/**
 * LeadMagnetPopup — Popup de génération de leads
 * - Apparaît après 9 secondes OU à la sortie de page (exit intent)
 * - Offre : Guide Excel Pro gratuit + 3 astuces d'automatisation
 * - Capture email puis redirige vers WhatsApp avec message pré-rempli
 * - Ne réapparaît plus pendant 7 jours après affichage
 */
export default function LeadMagnetPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu le popup récemment (7 jours)
    const seenAt = localStorage.getItem(STORAGE_KEY);
    if (seenAt) {
      const daysSince = (Date.now() - parseInt(seenAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    let triggered = false;
    const trigger = (source: string) => {
      if (triggered) return;
      triggered = true;
      setOpen(true);
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      trackEvent('lead_popup_shown', { trigger_source: source });
    };

    // Déclencheur 1 : timer 9 secondes
    const timer = setTimeout(() => trigger('timer'), TRIGGER_DELAY_MS);

    // Déclencheur 2 : exit intent (souris quitte par le haut de la page)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !triggered) {
        trigger('exit_intent');
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    trackEvent('lead_popup_dismissed', { had_email: email.length > 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    // Track le lead capturé
    trackLead('lead_magnet_excel_pro');
    trackEvent('lead_magnet_submit', { source: 'popup_excel_pro' });

    // Construire le message WhatsApp
    const message = `Bonjour GTC ! 👋\n\nJe souhaite recevoir gratuitement :\n📘 Guide Excel Pro\n⚡ Les 3 astuces d'automatisation\n\nMes coordonnées :\n👤 Nom : ${name}\n📧 Email : ${email}\n\nMerci !`;
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

    setSubmitted(true);

    // Rediriger vers WhatsApp après un court délai pour montrer la confirmation
    setTimeout(() => {
      window.open(waUrl, '_blank');
      // Garder le popup ouvert sur l'écran de confirmation pendant quelques secondes
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setName('');
        setEmail('');
      }, 3000);
    }, 800);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0B1F3A]/80 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in"
        style={{ animation: 'zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-[#0B1F3A] hover:text-[#1E90FF] transition-colors shadow-md"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        {!submitted ? (
          <>
            {/* Header avec gradient et illustration */}
            <div className="relative bg-gradient-to-br from-[#0B1F3A] via-[#1E90FF] to-[#00D4FF] px-8 pt-10 pb-8 text-white text-center overflow-hidden">
              {/* Décorations */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                  <Gift className="text-white" size={32} />
                </div>
                <div className="inline-flex items-center gap-1 bg-yellow-400 text-[#0B1F3A] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                  <Sparkles size={12} />
                  100% Gratuit
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-2">
                  Guide Excel Pro Offert
                </h2>
                <p className="text-[#E0F2FF] text-sm leading-relaxed">
                  + 3 astuces concrètes pour automatiser vos tâches dès aujourd'hui
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-8 py-6">
              {/* Liste des bénéfices */}
              <ul className="space-y-2 mb-6">
                {[
                  'Formules avancées et raccourcis pro',
                  'Macros VBA prêtes à copier-coller',
                  'Templates de dashboards automatisés',
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[#0B1F3A]">
                    <CheckCircle2 size={18} className="text-[#1E90FF] flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre prénom"
                  required
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-sm text-[#0B1F3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF]/20 transition-all"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  required
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg text-sm text-[#0B1F3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF]/20 transition-all"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#1E90FF] to-[#00D4FF] hover:from-[#0B1F3A] hover:to-[#1E90FF] text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-[#1E90FF]/30 hover:shadow-xl hover:shadow-[#1E90FF]/40 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  🎁 Recevoir gratuitement
                </button>
              </form>

              <p className="text-xs text-[#94A3B8] text-center mt-4">
                Pas de spam. Désabonnement en 1 clic.
              </p>
            </div>
          </>
        ) : (
          /* Confirmation */
          <div className="px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
              <CheckCircle2 className="text-green-600" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-[#0B1F3A] mb-3">Parfait, {name} ! 🎉</h3>
            <p className="text-[#64748B] mb-2">
              Vous allez être redirigé(e) vers WhatsApp pour recevoir votre guide.
            </p>
            <p className="text-sm text-[#1E90FF] font-semibold">
              Le téléchargement démarre dans quelques secondes...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

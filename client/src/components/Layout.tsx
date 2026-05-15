import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, MessageCircle, Instagram, Facebook, Youtube, Send } from 'lucide-react';
import { getWhatsAppLink, trackWhatsAppClick, trackEvent } from '@/lib/conversion';

const WhatsAppChatBubble = lazy(() => import('./WhatsAppChatBubble'));
const LeadMagnetPopup = lazy(() => import('./LeadMagnetPopup'));

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [engagementWidgetsReady, setEngagementWidgetsReady] = useState(false);

  useEffect(() => {
    const loadWidgets = () => setEngagementWidgetsReady(true);
    const idleCallback = window.requestIdleCallback?.(loadWidgets, { timeout: 4000 });
    const timer = window.setTimeout(loadWidgets, 4500);

    return () => {
      if (idleCallback) window.cancelIdleCallback?.(idleCallback);
      window.clearTimeout(timer);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navbarWA = getWhatsAppLink('navbar');
  const floatingWA = getWhatsAppLink('floating');
  const generalWA = getWhatsAppLink('general');
  const email = 'contact@generaltechconsult.com';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 cursor-pointer">
              <img 
                src="/assets/images/logo_gtc.webp" 
                alt="GTC Logo" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-[#0B1F3A] hidden sm:inline">GTC</span>
            </a>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/">
              <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors">Accueil</a>
            </Link>
            <Link href="/services">
              <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors">Services</a>
            </Link>
            <Link href="/training">
              <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors">Formations</a>
            </Link>
            <Link href="/products">
              <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors">Produits</a>
            </Link>
            <Link href="/portfolio">
              <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors">Portfolio</a>
            </Link>
            <Link href="/blog">
              <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors">Blog</a>
            </Link>
            <Link href="/certifications">
              <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors">Vérifier un certificat</a>
            </Link>
            <Link href="/about">
              <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors">À propos</a>
            </Link>
            <Link href="/contact">
              <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors">Contact</a>
            </Link>
            <a 
              href={navbarWA}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('navbar')}
              className="gtc-btn-primary text-sm"
            >
              WhatsApp
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-[#0B1F3A]"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="container max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/">
                <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors block py-2" onClick={() => setIsMenuOpen(false)}>
                  Accueil
                </a>
              </Link>
              <Link href="/services">
                <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors block py-2" onClick={() => setIsMenuOpen(false)}>
                  Services
                </a>
              </Link>
              <Link href="/training">
                <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors block py-2" onClick={() => setIsMenuOpen(false)}>
                  Formations
                </a>
              </Link>
              <Link href="/products">
                <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors block py-2" onClick={() => setIsMenuOpen(false)}>
                  Produits
                </a>
              </Link>
              <Link href="/portfolio">
                <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors block py-2" onClick={() => setIsMenuOpen(false)}>
                  Portfolio
                </a>
              </Link>
              <Link href="/blog">
                <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors block py-2" onClick={() => setIsMenuOpen(false)}>
                  Blog
                </a>
              </Link>
              <Link href="/certifications">
                <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors block py-2" onClick={() => setIsMenuOpen(false)}>
                  Vérifier un certificat
                </a>
              </Link>
              <Link href="/about">
                <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors block py-2" onClick={() => setIsMenuOpen(false)}>
                  À propos
                </a>
              </Link>
              <Link href="/contact">
                <a className="text-[#64748B] hover:text-[#1E90FF] transition-colors block py-2" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </a>
              </Link>
              <a 
                href={navbarWA}
                target="_blank"
                rel="noopener noreferrer"
                className="gtc-btn-primary text-sm text-center"
                onClick={() => { trackWhatsAppClick('navbar'); setIsMenuOpen(false); }}
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Floating WhatsApp Button with Pulse */}
      <a
        href={floatingWA}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick('floating')}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#1E90FF] to-[#00D4FF] text-white p-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 z-40 flex items-center justify-center group"
        title="Contactez-nous sur WhatsApp"
        aria-label="Contactez-nous sur WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#1E90FF] animate-ping opacity-30"></span>
        <MessageCircle size={24} className="relative z-10" />
        <span className="absolute right-full mr-3 whitespace-nowrap bg-[#0B1F3A] text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Discutons maintenant
        </span>
      </a>

      {/* Footer */}
      <footer className="bg-[#0B1F3A] text-white py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">General Tech Consult</h3>
              <p className="text-gray-300">Solutions digitales premium pour votre entreprise.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/"><a className="hover:text-[#1E90FF] transition-colors">Accueil</a></Link></li>
                <li><Link href="/services"><a className="hover:text-[#1E90FF] transition-colors">Services</a></Link></li>
                <li><Link href="/training"><a className="hover:text-[#1E90FF] transition-colors">Formations</a></Link></li>
                <li><Link href="/products"><a className="hover:text-[#1E90FF] transition-colors">Produits</a></Link></li>
                <li><Link href="/portfolio"><a className="hover:text-[#1E90FF] transition-colors">Portfolio</a></Link></li>
                <li><Link href="/blog"><a className="hover:text-[#1E90FF] transition-colors">Blog</a></Link></li>
                <li><Link href="/certifications"><a className="hover:text-[#1E90FF] transition-colors">Vérifier un certificat</a></Link></li>
                <li><Link href="/about"><a className="hover:text-[#1E90FF] transition-colors">À propos</a></Link></li>
                <li><Link href="/contact"><a className="hover:text-[#1E90FF] transition-colors">Contact</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-300 mb-2">Email: {email}</p>
              <p className="text-gray-300 mb-4">WhatsApp: +243 829 664 720</p>
              <a 
                href={generalWA}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('general')}
                className="gtc-btn-primary text-sm"
              >
                Nous contacter
              </a>
            </div>
          </div>
          {/* Social Links */}
          <div className="border-t border-gray-700 pt-8 mb-6">
            <p className="text-center text-gray-400 text-sm uppercase tracking-widest mb-4">Suivez-nous</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <a href="https://www.instagram.com/general_tech_consult?igsh=YXA1bzc4dW1wZGU5&utm_source=qr" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('social_click', { network: 'instagram', location: 'footer' })} className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#1E90FF] hover:to-[#00D4FF] rounded-lg flex items-center justify-center transition-all hover:scale-110" title="Instagram">
                <Instagram size={18} className="text-white" />
              </a>
              <a href="https://www.tiktok.com/@general_tech_consult?_r=1&_t=ZS-94wFP7Ocyaz" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('social_click', { network: 'tiktok', location: 'footer' })} className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#1E90FF] hover:to-[#00D4FF] rounded-lg flex items-center justify-center transition-all hover:scale-110" title="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=100094265310553" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('social_click', { network: 'facebook', location: 'footer' })} className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#1E90FF] hover:to-[#00D4FF] rounded-lg flex items-center justify-center transition-all hover:scale-110" title="Facebook">
                <Facebook size={18} className="text-white" />
              </a>
              <a href="https://www.youtube.com/@GENERALTECHCONSULT" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('social_click', { network: 'youtube', location: 'footer' })} className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#1E90FF] hover:to-[#00D4FF] rounded-lg flex items-center justify-center transition-all hover:scale-110" title="YouTube">
                <Youtube size={18} className="text-white" />
              </a>
              <a href="https://x.com/generaltechc?s=21" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('social_click', { network: 'twitter', location: 'footer' })} className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#1E90FF] hover:to-[#00D4FF] rounded-lg flex items-center justify-center transition-all hover:scale-110" title="Twitter / X">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[16px] h-[16px] text-white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://t.me/GTC_Forum" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('social_click', { network: 'telegram', location: 'footer' })} className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#1E90FF] hover:to-[#00D4FF] rounded-lg flex items-center justify-center transition-all hover:scale-110" title="Telegram">
                <Send size={18} className="text-white" />
              </a>
              <a href={generalWA} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick('general')} className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#1E90FF] hover:to-[#00D4FF] rounded-lg flex items-center justify-center transition-all hover:scale-110" title="WhatsApp">
                <MessageCircle size={18} className="text-white" />
              </a>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-gray-400">
            <p>&copy; 2026 General Tech Consult. Tous droits réservés. <span className="text-[#00D4FF]">Data Speaks. Experts Decide.</span></p>
          </div>
        </div>
      </footer>

      {/* Smart Notifications */}
      {engagementWidgetsReady && (
        <Suspense fallback={null}>
          <WhatsAppChatBubble />
          <LeadMagnetPopup />
        </Suspense>
      )}
    </div>
  );
}

import { lazy, Suspense } from 'react';
import Layout from '@/components/Layout';
import SEOHelmet from '@/components/SEOHelmet';
import { BarChart3, Zap, Code, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useFormModal } from '@/contexts/FormModalContext';
import { getWhatsAppLink, trackWhatsAppClick, trackEvent } from '@/lib/conversion';
import AnimatedBackground from '@/components/AnimatedBackground';

const GtcMotion = lazy(() =>
  import('@/components/gtc-motion/MotionExperience').then((module) => ({ default: module.MotionExperience })),
);

export default function Home() {
  const { openForm } = useFormModal();

  return (
    <Layout>
      <SEOHelmet
        title="General Tech Consult | Data Analytics, Logiciels & Formations Tech à Kinshasa"
        description="General Tech Consult (GTC) accompagne entreprises, entrepreneurs et professionnels en analyse de données, dashboards, développement logiciel sur mesure, automatisation, formations certifiantes et solutions digitales."
        keywords="data analytics, développement logiciel, formation Excel, automation, AI consulting"
        ogTitle="General Tech Consult | Un seul nom. Toutes les technologies."
        ogDescription="Data analytics, développement logiciel, automatisation, formations certifiantes et solutions digitales pour entreprises et professionnels."
        ogUrl="https://www.generaltechconsult.com/"
        ogImage="https://www.generaltechconsult.com/assets/images/logo_gtc.PNG"
        titleSuffix={false}
      />

      {/* Hero Section */}
      <section className="gtc-hero relative overflow-hidden pt-36 pb-24">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663413637315/kBiKHbrxPVYSgtRurEjNTe/gtc-tech-pattern-D8jG8zyEW6bzTHeQoGBYZu.webp"
            alt="Pattern"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="gtc-hero-copy gtc-animate-in">
              <div className="gtc-line-separator gtc-hero-line mb-7"></div>
              <h1 className="gtc-hero-punchline mb-7">
                <span className="gtc-hero-title-line text-white">Data Speaks.</span>
                <span className="gtc-hero-title-line gtc-hero-gradient-text">Experts Decide.</span>
              </h1>
              <p className="gtc-hero-subtitle mb-10">
                Transformez vos données en décisions stratégiques.<br className="hidden sm:block" />
                Des solutions concrètes. Des résultats mesurables.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => openForm('software')}
                  className="gtc-btn-primary gtc-hero-primary-cta text-center flex items-center justify-center gap-2"
                >
                  Commencer maintenant <ArrowRight size={20} />
                </button>
                <Link href="/services">
                  <a
                    onClick={() => trackEvent('cta_click', { cta_name: 'voir_nos_solutions', location: 'hero' })}
                    className="gtc-btn-secondary gtc-hero-secondary-cta text-center"
                  >
                    Voir nos solutions
                  </a>
                </Link>
              </div>
            </div>

            <div className="gtc-hero-visual">
              <AnimatedBackground />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="gtc-section-dark">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#1E90FF] mb-2">500+</div>
              <p className="text-[#00D4FF]">Clients satisfaits</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#1E90FF] mb-2">1000+</div>
              <p className="text-[#00D4FF]">Projets réalisés</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#1E90FF] mb-2">50M+</div>
              <p className="text-[#00D4FF]">Données analysées</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#1E90FF] mb-2">10+</div>
              <p className="text-[#00D4FF]">Années d'expérience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points → Transformation Section */}
      <section className="py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#1E90FF]/10 text-[#1E90FF] rounded-full text-sm font-semibold mb-4 uppercase tracking-wider">
              Pourquoi GTC ?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F3A] mb-4">
              Arrêtez de perdre du temps.<br/>
              <span className="bg-gradient-to-r from-[#1E90FF] to-[#00D4FF] bg-clip-text text-transparent">
                Commencez à grandir.
              </span>
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              Nous transformons les inefficacités quotidiennes en avantages concurrentiels mesurables.
            </p>
          </div>

          {/* De l’idée à l’impact : animation interactive en huit étapes (remplace la grille Avant GTC / Avec GTC) */}
          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="mx-auto aspect-[3/4] w-full max-w-[560px] rounded-[18px] bg-[#F7F9FC] min-[721px]:aspect-video min-[721px]:max-w-[1120px]"
              />
            }
          >
            <GtcMotion variant="compact" />
          </Suspense>

          {/* CTA central */}
          <div className="text-center mt-12">
            <button
              onClick={() => openForm('software')}
              className="gtc-btn-primary inline-flex items-center gap-2 text-base"
            >
              Je veux passer du côté droit
              <ArrowRight size={20} />
            </button>
            <p className="text-sm text-[#64748B] mt-3">
              ⚡ Consultation gratuite · Réponse en 24h
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="gtc-section-light py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator mb-8"></div>
          <h2 className="gtc-section-title mb-4">Nos Services</h2>
          <p className="gtc-section-subtitle mb-16">
            Solutions complètes pour transformer votre entreprise à l'ère numérique.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="gtc-service-card">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mb-6">
                <BarChart3 size={28} className="text-white" />
              </div>
              <h3 className="gtc-service-title mb-3">Data Analytics</h3>
              <p className="gtc-service-description mb-4">
                Analysez vos données pour découvrir des insights cachés et prendre des décisions éclairées.
              </p>
              <button
                onClick={() => openForm('data')}
                className="text-[#1E90FF] font-semibold hover:text-[#00D4FF] flex items-center gap-2 group"
              >
                Demander une analyse <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Service 2 */}
            <div className="gtc-service-card">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mb-6">
                <Code size={28} className="text-white" />
              </div>
              <h3 className="gtc-service-title mb-3">Développement Logiciel</h3>
              <p className="gtc-service-description mb-4">
                Applications web et mobiles sur mesure, intégrant Excel et systèmes d'automation avancés.
              </p>
              <button
                onClick={() => openForm('software')}
                className="text-[#1E90FF] font-semibold hover:text-[#00D4FF] flex items-center gap-2 group"
              >
                Obtenir un devis <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Service 3 */}
            <div className="gtc-service-card">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mb-6">
                <Zap size={28} className="text-white" />
              </div>
              <h3 className="gtc-service-title mb-3">Formation Professionnelle</h3>
              <p className="gtc-service-description mb-4">
                Formations Excel, Google Sheets, automation et AI pour upskiller vos équipes.
              </p>
              <button
                onClick={() => openForm('training')}
                className="text-[#1E90FF] font-semibold hover:text-[#00D4FF] flex items-center gap-2 group"
              >
                S'inscrire à une formation <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="gtc-section-gray py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <video
                src="/assets/videos/dashboard_animated.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="rounded-lg"
              ></video>
            <div>
              <div className="gtc-line-separator mb-8"></div>
              <h2 className="gtc-section-title mb-6">Pourquoi choisir GTC?</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#1E90FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0B1F3A] mb-2">ROI Mesurable</h3>
                    <p className="text-[#64748B]">Chaque projet est optimisé pour générer un retour sur investissement concret et mesurable.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#1E90FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0B1F3A] mb-2">Technologie Cutting-Edge</h3>
                    <p className="text-[#64748B]">Nous utilisons les dernières technologies et meilleures pratiques en data science et développement.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#1E90FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Code className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0B1F3A] mb-2">Support Continu</h3>
                    <p className="text-[#64748B]">Support technique 24/7 et maintenance continue pour assurer la performance de vos solutions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="gtc-section-light py-24 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E90FF]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D4FF]/5 rounded-full blur-3xl"></div>

        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Photo Side */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#0B1F3A] to-[#1E90FF] aspect-[4/5] max-w-md mx-auto">
                <img
                  src="/assets/images/christian-onya.webp"
                   alt="Christian Onya Amani - CEO & Founder de GTC"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl">
                  <p className="text-xs uppercase tracking-widest text-[#1E90FF] font-bold mb-1">CEO & Founder</p>
                  <p className="text-lg font-bold text-[#0B1F3A]">Christian Onya Amani</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border-4 border-[#1E90FF] rounded-2xl -z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-[#1E90FF]/20 to-[#00D4FF]/20 rounded-2xl -z-10"></div>
            </div>

            {/* Content Side */}
            <div>
              <div className="gtc-line-separator mb-6"></div>
              <p className="text-[#1E90FF] font-semibold uppercase tracking-widest text-sm mb-4">Le Mot du Fondateur</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F3A] mb-6 leading-tight">
                Votre succès commence par <span className="bg-gradient-to-r from-[#1E90FF] to-[#00D4FF] bg-clip-text text-transparent">vos données</span>
              </h2>
              <p className="text-lg text-[#64748B] mb-6 leading-relaxed">
                "Après plus de 12 ans dans la gestion de données et 5 ans en suivi-évaluation, j'ai fondé GTC avec une conviction simple : <strong className="text-[#0B1F3A]">chaque entreprise mérite de prendre des décisions clairées par la donnée</strong>."
              </p>
              <p className="text-lg text-[#64748B] mb-8 leading-relaxed">
                "Notre mission est de démystifier la technologie et rendre l'expertise accessible aux entrepreneurs, organisations et professionnels qui veulent passer au niveau supérieur."
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1E90FF]">12+</p>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider">Ans Data</p>
                </div>
                <div className="text-center border-x border-[#E2E8F0]">
                  <p className="text-3xl font-bold text-[#1E90FF]">5+</p>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider">Ans M&E</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1E90FF]">500+</p>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider">Clients</p>
                </div>
              </div>

              <Link href="/about">
                <a className="gtc-btn-primary inline-block">
                  Découvrir notre histoire →
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gtc-section-dark py-24">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à transformer votre entreprise?
          </h2>
          <p className="text-[#00D4FF] text-lg mb-8">
            Consultez nos experts gratuitement et découvrez comment nous pouvons vous aider.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => openForm('software')}
              className="gtc-btn-primary text-center"
            >
              Demander une consultation
            </button>
            <a 
              href={getWhatsAppLink('consulting')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('consulting')}
              className="gtc-btn-secondary text-center"
            >
              Discuter sur WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}

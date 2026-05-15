import Layout from '@/components/Layout';
import SEOHelmet from '@/components/SEOHelmet';
import { Zap, Target, Users, Award } from 'lucide-react';
import { Link } from 'wouter';
import { trackCTAClick } from '@/lib/conversion';

export default function About() {

  return (
    <Layout>
      <SEOHelmet
        title="À Propos - General Tech Consult"
        description="General Tech Consult: experts en data analytics, développement logiciel et formation. 10+ ans d'expérience au service de votre transformation numérique."
        keywords="about, équipe, expertise, mission, vision, GTC"
      />

      {/* Header */}
      <section className="gtc-section-dark pt-32 pb-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator mb-8"></div>
          <h1 className="gtc-hero-title mb-6 text-white">À Propos de GTC</h1>
          <p className="text-xl text-[#00D4FF] max-w-2xl">
            Transforming businesses through data, technology, and expertise.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="gtc-section-light py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="gtc-line-separator mb-8"></div>
              <h2 className="text-4xl font-bold text-[#0B1F3A] mb-6">Notre Mission</h2>
              <p className="text-lg text-[#64748B] mb-6">
                Empowering businesses to make data-driven decisions through innovative technology solutions and expert guidance.
              </p>
              <p className="text-lg text-[#64748B]">
                Nous croyons que chaque entreprise, peu importe sa taille, mérite d'accéder à des solutions technologiques de classe mondiale et à l'expertise pour les utiliser efficacement.
              </p>
            </div>

            <div>
              <div className="gtc-line-separator mb-8"></div>
              <h2 className="text-4xl font-bold text-[#0B1F3A] mb-6">Notre Vision</h2>
              <p className="text-lg text-[#64748B] mb-6">
                Être le partenaire de confiance pour la transformation numérique en Afrique et au-delà.
              </p>
              <p className="text-lg text-[#64748B]">
                Nous aspirons à créer un monde où les données et la technologie sont accessibles à tous, permettant aux entreprises de tous les secteurs de prospérer dans l'économie numérique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="gtc-section-gray py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator mb-8 mx-auto"></div>
          <h2 className="text-4xl font-bold text-[#0B1F3A] text-center mb-16">Nos Valeurs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg border-l-4 border-[#1E90FF]">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-3">Innovation</h3>
              <p className="text-[#64748B]">Nous cherchons constamment de meilleures solutions et approches pour servir nos clients.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border-l-4 border-[#1E90FF]">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mb-4">
                <Target className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-3">Excellence</h3>
              <p className="text-[#64748B]">Nous nous engageons à livrer des solutions de qualité supérieure qui dépassent les attentes.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border-l-4 border-[#1E90FF]">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-3">Collaboration</h3>
              <p className="text-[#64748B]">Nous travaillons en partenariat avec nos clients pour comprendre et résoudre leurs défis.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border-l-4 border-[#1E90FF]">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mb-4">
                <Award className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-3">Intégrité</h3>
              <p className="text-[#64748B]">Nous opérons avec transparence, honnêteté et responsabilité envers nos clients et partenaires.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="gtc-section-light py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator mb-8 mx-auto"></div>
          <h2 className="text-4xl font-bold text-[#0B1F3A] text-center mb-16">Notre Équipe</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* CEO Card - Featured */}
            <div className="md:col-span-1 bg-gradient-to-br from-[#0B1F3A] via-[#1E90FF] to-[#00D4FF] rounded-2xl overflow-hidden shadow-2xl group relative">
              {/* Photo */}
              <div className="relative h-80 overflow-hidden">
                <img 
                  src="/assets/images/christian-onya.webp"
                  alt="Christian Onya Amani - CEO & Founder"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-transparent to-transparent"></div>
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-[#1E90FF] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  CEO & FOUNDER
                </div>
              </div>
              {/* Info */}
              <div className="p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">Christian Onya Amani</h3>
                <p className="text-[#00D4FF] font-semibold mb-3 text-sm uppercase tracking-wider">CEO & Founder</p>
                <p className="text-sm text-gray-100 leading-relaxed">
                  Expert en data management avec 12+ ans d'expérience et 5+ ans en suivi-évaluation. Passionné de transformation numérique, il accompagne entreprises et professionnels dans leurs décisions stratégiques basées sur la donnée.
                </p>
                {/* Skills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">Data Analytics</span>
                  <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">Excel/VBA</span>
                  <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">M&E</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg border border-[#E2E8F0] text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                👩‍💻
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">Équipe Développement</h3>
              <p className="text-[#1E90FF] mb-4">Full-Stack Developers</p>
              <p className="text-sm text-[#64748B]">
                Experts en développement web et mobile, avec spécialisation en intégration Excel et systèmes d'automation.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-[#E2E8F0] text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
                📊
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">Équipe Data</h3>
              <p className="text-[#1E90FF] mb-4">Data Scientists & Analysts</p>
              <p className="text-sm text-[#64748B]">
                Spécialistes en data analytics, business intelligence et machine learning pour transformer vos données en insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="gtc-section-dark py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Pourquoi nous choisir?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#1E90FF] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">10+ ans d'expérience</h3>
                <p className="text-[#00D4FF]">Expertise éprouvée dans data analytics, développement et automation</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#1E90FF] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">500+ clients satisfaits</h3>
                <p className="text-[#00D4FF]">Taux de satisfaction de 98% et relations long terme</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#1E90FF] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Solutions personnalisées</h3>
                <p className="text-[#00D4FF]">Chaque solution est adaptée à vos besoins spécifiques</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#1E90FF] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Support 24/7</h3>
                <p className="text-[#00D4FF]">Assistance technique continue et maintenance proactive</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gtc-section-light py-24">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#0B1F3A] mb-6">
            Rejoignez nos clients satisfaits
          </h2>
          <p className="text-lg text-[#64748B] mb-8">
            Découvrez comment nous pouvons transformer votre entreprise.
          </p>
          <Link href="/contact">
            <a
              onClick={() => trackCTAClick('consultation_gratuite', 'about_cta')}
              className="gtc-btn-primary inline-block"
            >
              Demander une consultation gratuite
            </a>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

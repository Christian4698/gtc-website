import Layout from '@/components/Layout';
import SEOHelmet from '@/components/SEOHelmet';
import { ExternalLink, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';
import { getWhatsAppLink, trackWhatsAppClick } from '@/lib/conversion';

export default function Portfolio() {
  const whatsappLink = getWhatsAppLink('software');

  const projects = [
    {
      id: 1,
      title: 'Financial Dashboard - Banque Centrale',
      category: 'Data Analytics',
      description: 'Dashboard de reporting financier en temps réel pour 500+ utilisateurs',
      results: ['60% réduction du temps de reporting', '95% d\'accuracy', '24/7 monitoring'],
      image: '📊',
      year: '2024'
    },
    {
      id: 2,
      title: 'Sales Pipeline Automation - E-commerce',
      category: 'Excel Automation',
      description: 'Système d\'automation complète pour gestion du pipeline de ventes',
      results: ['80% gain de productivité', '40% augmentation des conversions', '100% traçabilité'],
      image: '🎯',
      year: '2024'
    },
    {
      id: 3,
      title: 'Mobile App - Startup FinTech',
      category: 'Développement Logiciel',
      description: 'Application mobile pour gestion de portefeuille d\'investissement',
      results: ['10K+ utilisateurs', '4.8★ rating', 'Rentable en 6 mois'],
      image: '📱',
      year: '2023'
    },
    {
      id: 4,
      title: 'HR Analytics Platform - Groupe Fortune 500',
      category: 'Data Analytics',
      description: 'Plateforme d\'analyse RH pour optimisation des talents',
      results: ['30% réduction turnover', 'Économies $2M/an', 'Meilleure rétention'],
      image: '👥',
      year: '2023'
    },
    {
      id: 5,
      title: 'Supply Chain Optimization - Manufacturing',
      category: 'AI & Automation',
      description: 'Système d\'optimisation de chaîne d\'approvisionnement avec ML',
      results: ['25% réduction coûts', '40% amélioration délais', 'Prédictions 95% accurate'],
      image: '🚀',
      year: '2023'
    },
    {
      id: 6,
      title: 'Customer Analytics - Retail Chain',
      category: 'Data Analytics',
      description: 'Système de segmentation client et recommandations personnalisées',
      results: ['35% augmentation AOV', 'Churn réduit de 20%', 'Satisfaction +45%'],
      image: '🛍️',
      year: '2022'
    }
  ];

  return (
    <Layout>
      <SEOHelmet
        title="Portfolio - General Tech Consult"
        description="Découvrez nos projets réalisés: dashboards, applications, automation et solutions data. Cas d'études et résultats mesurables."
        keywords="portfolio, projets, case studies, data analytics, développement logiciel, automation"
      />

      {/* Header */}
      <section className="gtc-section-dark pt-32 pb-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator mb-8"></div>
          <h1 className="gtc-hero-title mb-6 text-white">Notre Portfolio</h1>
          <p className="text-xl text-[#00D4FF] max-w-2xl">
            Découvrez les projets que nous avons réalisés et les résultats mesurables que nous avons générés.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="gtc-section-light py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden hover:shadow-xl transition-all group">
                <div className="bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] h-48 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform">
                  {project.image}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-[#F5F7FA] text-[#1E90FF] text-xs font-semibold rounded">
                      {project.category}
                    </span>
                    <span className="text-xs text-[#64748B]">{project.year}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0B1F3A] mb-2">{project.title}</h3>
                  <p className="text-[#64748B] text-sm mb-4">{project.description}</p>

                  <div className="space-y-2 mb-6">
                    {project.results.map((result, idx) => (
                      <div key={idx} className="flex gap-2 text-sm">
                        <TrendingUp size={16} className="text-[#1E90FF] flex-shrink-0" />
                        <span className="text-[#0B1F3A]">{result}</span>
                      </div>
                    ))}
                  </div>

                  <a 
                    href={whatsappLink}
                    onClick={() => trackWhatsAppClick('software')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1E90FF] font-semibold hover:text-[#00D4FF] flex items-center gap-2 group/link"
                  >
                    En savoir plus
                    <ExternalLink size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="gtc-section-dark py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-[#1E90FF] mb-2">1000+</div>
              <p className="text-[#00D4FF]">Projets réalisés</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#1E90FF] mb-2">500+</div>
              <p className="text-[#00D4FF]">Clients satisfaits</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#1E90FF] mb-2">$500M+</div>
              <p className="text-[#00D4FF]">Valeur créée</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#1E90FF] mb-2">98%</div>
              <p className="text-[#00D4FF]">Taux de satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gtc-section-light py-24">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#0B1F3A] mb-6">
            Prêt à démarrer votre projet?
          </h2>
          <p className="text-lg text-[#64748B] mb-8">
            Contactez-nous pour discuter de votre vision et découvrir comment nous pouvons la réaliser.
          </p>
          <Link href="/contact">
            <a className="gtc-btn-primary inline-block">
              Demander une consultation
            </a>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

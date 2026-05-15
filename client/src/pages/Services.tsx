import Layout from '@/components/Layout';
import SEOHelmet from '@/components/SEOHelmet';
import { BarChart3, Code, BookOpen, Zap, Check, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';
import { useFormModal } from '@/contexts/FormModalContext';
import { FormType } from '@/components/ServiceFormModal';
import { getWhatsAppLink, trackWhatsAppClick, WhatsAppContext } from '@/lib/conversion';

export default function Services() {
  const { openForm } = useFormModal();

  const services: Array<{
    id: number;
    icon: any;
    title: string;
    description: string;
    features: string[];
    image: string;
    formType: FormType;
    waContext: WhatsAppContext;
    cta: string;
  }> = [
    {
      id: 1,
      icon: BarChart3,
      formType: 'data',
      waContext: 'data',
      cta: 'Demander une analyse',
      title: 'Data Analytics & Business Intelligence',
      description: 'Transformez vos données brutes en insights stratégiques exploitables.',
      features: [
        'Analyse descriptive et prédictive',
        'Dashboards et rapports personnalisés',
        'Data mining et pattern recognition',
        'Visualisation de données avancée',
        'Modélisation statistique'
      ],
      image: '/assets/images/data-bi.webp'
    },
    {
      id: 2,
      icon: Code,
      formType: 'software',
      waContext: 'software',
      cta: 'Demander un devis',
      title: 'Excel Automation & Integration',
      description: 'Systèmes Excel avancés connectés à des applications mobiles et web.',
      features: [
        'Macros VBA et Power Query',
        'Intégration Excel-Mobile',
        'Automation des processus',
        'Synchronisation de données',
        'Systèmes de reporting automatisés'
      ],
      image: '/assets/images/Excel auto&integer.webp'
    },
    {
      id: 3,
      icon: Code,
      formType: 'software',
      waContext: 'software',
      cta: 'Demander un devis',
      title: 'Développement Logiciel Sur Mesure',
      description: 'Applications web et mobiles conçues pour vos besoins spécifiques.',
      features: [
        'Applications web modernes',
        'Applications mobiles iOS/Android',
        'API et intégrations',
        'Cloud deployment',
        'Maintenance et support'
      ],
      image: '/assets/images/Developpement_Logiciel.webp'
    },
    {
      id: 4,
      icon: Zap,
      formType: 'software',
      waContext: 'consulting',
      cta: 'Demander un devis',
      title: 'AI & Automation Consulting',
      description: 'Solutions d\'intelligence artificielle et automation pour optimiser vos opérations.',
      features: [
        'Machine Learning models',
        'Natural Language Processing',
        'Process automation RPA',
        'Chatbots intelligents',
        'Predictive analytics'
      ],
      image: '/assets/images/ai_auto.webp'
    },
    {
      id: 5,
      icon: Code,
      formType: 'software',
      waContext: 'software',
      cta: 'Demander un devis',
      title: 'Creation de Sites Web Responsive',
      description: 'Creation de sites web responsive, modernes et performants, adaptes a tous les appareils (mobile, tablette, desktop), optimises pour la performance et l\'experience utilisateur.',
      features: [
        'Design responsive et moderne',
        'Optimisation mobile-first',
        'Performance et SEO',
        'Experience utilisateur optimale',
        'Maintenance et support'
      ],
      image: '/assets/images/Site_by_gtc.webp'
    }
  ];

  return (
    <Layout>
      <SEOHelmet
        title="Services - General Tech Consult"
        description="Data Analytics, Excel Automation, Développement Logiciel et AI Consulting. Solutions complètes pour votre transformation numérique."
        keywords="data analytics, excel automation, développement logiciel, AI consulting, business intelligence"
      />

      {/* Header */}
      <section className="gtc-section-dark pt-32 pb-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator mb-8"></div>
          <h1 className="gtc-hero-title mb-6 text-white">Nos Services</h1>
          <p className="text-xl text-[#00D4FF] max-w-2xl">
            Solutions complètes pour transformer votre entreprise et optimiser vos opérations.
          </p>
        </div>
      </section>

      {/* Services Details */}
      {services.map((service, index) => {
        const Icon = service.icon;
        const isEven = index % 2 === 0;

        return (
          <section key={service.id} className={isEven ? 'gtc-section-light' : 'gtc-section-gray'}>
            <div className="container max-w-7xl mx-auto px-4 py-24">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                <div className={isEven ? '' : 'lg:order-2'}>
                  <img 
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    decoding="async"
                    className="rounded-lg w-full"
                  />
                </div>

                <div className={isEven ? '' : 'lg:order-1'}>
                  <div className="gtc-line-separator mb-8"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mb-6">
                    <Icon size={32} className="text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-[#0B1F3A] mb-4">{service.title}</h2>
                  <p className="text-lg text-[#64748B] mb-8">{service.description}</p>

                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <Check size={24} className="text-[#1E90FF] flex-shrink-0 mt-1" />
                        <span className="text-[#0B1F3A]">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => openForm(service.formType)}
                      className="gtc-btn-primary inline-flex items-center gap-2"
                    >
                      {service.cta}
                      <ArrowRight size={18} />
                    </button>
                    <a 
                      href={getWhatsAppLink(service.waContext)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppClick(service.waContext)}
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#1E90FF] text-[#1E90FF] rounded-lg hover:bg-[#1E90FF] hover:text-white transition-all font-semibold"
                    >
                      <MessageCircle size={18} />
                      WhatsApp direct
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="gtc-section-dark py-24">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Besoin d'une solution personnalisée?
          </h2>
          <p className="text-[#00D4FF] text-lg mb-8">
            Nos experts sont prêts à discuter de vos besoins spécifiques.
          </p>
          <button
            onClick={() => openForm('software')}
            className="gtc-btn-primary inline-flex items-center gap-2"
          >
            Demander une consultation gratuite
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </Layout>
  );
}

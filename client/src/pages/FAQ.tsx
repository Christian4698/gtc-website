import { useState } from 'react';
import Layout from '@/components/Layout';
import SEOHelmet from '@/components/SEOHelmet';
import { ChevronDown } from 'lucide-react';
import { Link } from 'wouter';
import { getWhatsAppLink, trackWhatsAppClick, trackEvent } from '@/lib/conversion';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'Quels sont les délais de développement d\'une application ?',
    answer: 'Les délais dépendent de la complexité du projet. Un projet simple peut prendre 2-4 semaines, tandis qu\'un projet complexe peut prendre 2-3 mois. Nous établissons toujours un calendrier détaillé lors de la consultation initiale.',
  },
  {
    id: 2,
    question: 'Proposez-vous du support après la livraison ?',
    answer: 'Oui, absolument ! Nous offrons un support technique complet après la livraison. Vous pouvez nous contacter pour les bugs, les améliorations ou les questions. Nous proposons également des contrats de maintenance mensuelle.',
  },
  {
    id: 3,
    question: 'Comment fonctionne votre processus de développement ?',
    answer: 'Notre processus comprend 5 étapes : 1) Consultation et analyse des besoins, 2) Conception et prototype, 3) Développement, 4) Tests et QA, 5) Livraison et support. Vous êtes impliqué à chaque étape.',
  },
  {
    id: 4,
    question: 'Pouvez-vous intégrer des API tierces ?',
    answer: 'Oui, nous pouvons intégrer pratiquement toute API tierce (paiement, CRM, email, etc.). Nous avons de l\'expérience avec les principales plateformes du marché.',
  },
  {
    id: 5,
    question: 'Combien coûte une formation Excel ?',
    answer: 'Les tarifs de formation dépendent du nombre de participants et de la durée. Nous proposons des formations individuelles ou en groupe. Contactez-nous pour un devis personnalisé.',
  },
  {
    id: 6,
    question: 'Pouvez-vous analyser nos données existantes ?',
    answer: 'Bien sûr ! Nous pouvons analyser vos données, créer des dashboards personnalisés et vous fournir des insights actionnables. Nous travaillons avec Excel, Google Sheets, SQL et d\'autres outils.',
  },
  {
    id: 7,
    question: 'Offrez-vous une consultation gratuite ?',
    answer: 'Oui, nous offrons une consultation initiale gratuite de 30 minutes pour comprendre vos besoins et discuter de la meilleure solution pour votre entreprise.',
  },
  {
    id: 8,
    question: 'Quels sont vos délais de réponse ?',
    answer: 'Nous nous engageons à répondre à tous les messages dans les 24 heures. Pour une réponse plus rapide, utilisez WhatsApp au +243 829 664 720.',
  },
];

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const whatsappLink = getWhatsAppLink('general');
  const email = 'contact@generaltechconsult.com';

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Layout>
      <SEOHelmet
        title="FAQ"
        description="Questions fréquemment posées sur les services de General Tech Consult. Trouvez les réponses à vos questions sur le développement logiciel, l'analyse de données et la formation."
        keywords="FAQ, questions, réponses, GTC, développement, données, formation"
      />

      {/* Page Header */}
      <section className="gtc-section-light pt-24 pb-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator"></div>
          <h1 className="gtc-hero-title mb-4">Questions Fréquemment Posées</h1>
          <p className="text-xl text-[#6B7280] max-w-2xl">
            Trouvez les réponses à vos questions sur nos services et notre processus.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="gtc-section-gray py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-[#0B3C5D] transition-colors"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-[#F5F7FA] transition-colors text-left"
                >
                  <h3 className="font-semibold text-[#0B3C5D] text-lg">{item.question}</h3>
                  <ChevronDown
                    size={24}
                    className={`text-[#0B3C5D] flex-shrink-0 transition-transform ${
                      expandedId === item.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedId === item.id && (
                  <div className="px-6 py-4 bg-[#F5F7FA] border-t border-gray-200">
                    <p className="text-[#6B7280] leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still have questions? */}
      <section className="gtc-section-light py-20">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#0B3C5D] mb-6">Vous n'avez pas trouvé votre réponse ?</h2>
          <p className="text-lg text-[#6B7280] mb-8">
            Contactez-nous directement. Notre équipe est prête à répondre à toutes vos questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={whatsappLink}
              onClick={() => trackWhatsAppClick('general')}
              target="_blank"
              rel="noopener noreferrer"
              className="gtc-btn-primary text-center"
            >
              Contactez via WhatsApp
            </a>
            <a
              href={`mailto:${email}`}
              onClick={() => trackEvent('email_click', { email_address: email, location: 'faq_page' })}
              className="gtc-btn-secondary text-center"
            >
              Envoyer un email
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}

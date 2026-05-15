import Layout from '@/components/Layout';
import SEOHelmet from '@/components/SEOHelmet';
import { BookOpen, Users, Clock, Award } from 'lucide-react';
import { useFormModal } from '@/contexts/FormModalContext';

export default function Training() {
  const { openForm } = useFormModal();

  const courses = [
    {
      id: 1,
      title: 'Excel & Analyse professionnelle des données',
      duration: '20 heures',
      level: 'Intermédiaire',
      price: '$100',
      registrationFee: '+$10 frais d\'inscription',
      description: 'Maîtrisez les formules complexes, tableaux croisés dynamiques et macros VBA.',
      topics: ['Formules avancées', 'Tableaux croisés', 'Macros VBA', 'Power Query', 'Visualisations']
    },
    {
      id: 2,
      title: 'Google Sheets Pro : Automatisez vos tableaux et décuplez votre productivité',
      duration: '15 heures',
      level: 'Intermédiaire',
      price: '$120',
      registrationFee: '+$10 frais d\'inscription',
      description: 'Collaboration en temps réel, Apps Script et automation avancée.',
      topics: ['Collaboration', 'Apps Script', 'Automation', 'Intégrations', 'Analytics']
    },
    {
      id: 3,
      title: 'Data Analyst Essentials',
      duration: '25 heures',
      level: 'Avancé',
      price: '$200',
      registrationFee: '+$20 frais d\'inscription',
      description: 'Techniques d\'analyse de données, visualisation et insights stratégiques.',
      topics: ['Data cleaning', 'Visualisation', 'Statistical analysis', 'Dashboards', 'Reporting']
    },
    {
      id: 4,
      title: 'AI & Automation Basics',
      duration: '30 heures',
      level: 'Avancé',
      price: '$250',
      description: 'Introduction à l\'IA, machine learning et process automation.',
      topics: ['Machine Learning', 'RPA', 'Python basics', 'Automation workflows', 'Case studies']
    }
  ];

  return (
    <Layout>
      <SEOHelmet
        title="Formations - General Tech Consult"
        description="Formations professionnelles en Excel, Google Sheets, Data Analytics et AI. Upskill votre équipe avec nos experts."
        keywords="formation Excel, Google Sheets, data analytics, AI training, professional development"
      />

      {/* Header */}
      <section className="gtc-section-dark pt-32 pb-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator mb-8"></div>
          <h1 className="gtc-hero-title mb-6 text-white">Formations Professionnelles</h1>
          <p className="text-xl text-[#00D4FF] max-w-2xl">
            Développez les compétences de votre équipe avec nos formations pratiques et adaptées.
          </p>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="gtc-section-light py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {courses.map((course) => (
              <div key={course.id} className="gtc-service-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="gtc-service-title mb-2">{course.title}</h3>
                    <span className="inline-block px-3 py-1 bg-[#1E90FF] text-white text-sm rounded-full">
                      {course.level}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1E90FF]">{course.price}</div>
                    {course.registrationFee && (
                      <div className="text-xs text-[#64748B] mt-1">{course.registrationFee}</div>
                    )}
                  </div>
                </div>

                <p className="text-[#64748B] mb-4">{course.description}</p>

                <div className="flex gap-4 mb-6 text-sm text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#1E90FF]" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#1E90FF]" />
                    Groupe ou individuel
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-[#0B1F3A] mb-3">Sujets couverts:</p>
                  <div className="flex flex-wrap gap-2">
                    {course.topics.map((topic, idx) => (
                      <span key={idx} className="px-2 py-1 bg-[#F5F7FA] text-[#0B1F3A] text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => openForm('training')}
                  className="gtc-btn-primary inline-block w-full text-center"
                >
                  S'inscrire maintenant
                </button>
              </div>
            ))}
          </div>

          {/* Why Choose Us */}
          <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1A1F2E] rounded-lg p-12 text-white">
            <h2 className="text-3xl font-bold mb-8">Pourquoi nos formations?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex gap-4">
                <Award size={32} className="text-[#1E90FF] flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-2">Experts Certifiés</h3>
                  <p className="text-[#00D4FF]">Formateurs avec 10+ ans d'expérience en industrie</p>
                </div>
              </div>
              <div className="flex gap-4">
                <BookOpen size={32} className="text-[#1E90FF] flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-2">Pratique Intensive</h3>
                  <p className="text-[#00D4FF]">70% pratique, 30% théorie avec cas réels</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Users size={32} className="text-[#1E90FF] flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-2">Support Continu</h3>
                  <p className="text-[#00D4FF]">Support post-formation et ressources exclusives</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Training */}
      <section className="gtc-section-gray py-24">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <div className="gtc-line-separator mb-8 mx-auto"></div>
          <h2 className="text-4xl font-bold text-[#0B1F3A] mb-6">Formation Sur Mesure</h2>
          <p className="text-lg text-[#64748B] mb-8">
            Besoin d'une formation adaptée à votre secteur ou vos processus spécifiques? Nos experts peuvent créer un programme personnalisé pour votre équipe.
          </p>
          <button
            onClick={() => openForm('training')}
            className="gtc-btn-primary inline-block"
          >
            Demander une formation personnalisée
          </button>
        </div>
      </section>
    </Layout>
  );
}

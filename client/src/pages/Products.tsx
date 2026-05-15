import Layout from '@/components/Layout';
import SEOHelmet from '@/components/SEOHelmet';
import { Download, Star, Users, TrendingUp, Loader2, CheckCircle2, MessageCircle, ShoppingBag } from 'lucide-react';
import { trackWhatsAppClick, trackEvent } from '@/lib/conversion';
import { trpc } from '@/lib/trpc';
import { lazy, Suspense, useEffect, useState } from 'react';

const BundleOrderModal = lazy(() => import('@/components/BundleOrderModal'));

const WA_NUMBER = '243829664720';

function buyLink(productName: string, price: string): string {
  const msg = `Bonjour GTC, je souhaite acheter "${productName}" (${price}). Merci de me communiquer la procédure de paiement.`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function trackBuy(productName: string, price: string) {
  trackWhatsAppClick('product');
  trackEvent('begin_checkout', { item_name: productName, value: price });
  trackEvent('InitiateCheckout', { content_name: productName, value: price });
}

export default function Products() {
  // Charger les fichiers depuis la BDD (via tRPC)
  const { data: files, isLoading } = trpc.files.list.useQuery({ category: 'ebook' });
  const downloadFile = trpc.files.download.useMutation();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState('');

  // Produits statiques (fallback si pas de fichiers en BDD)
  const staticProducts = [
    {
      id: 1,
      type: 'E-book',
      title: 'The Complete Excel Automation Guide',
      description: 'Guide complet pour automatiser vos processus Excel et gagner du temps.',
      price: '$29',
      rating: 4.9,
      reviews: 127,
      features: ['200+ pages', 'Exemples pratiques', 'Macros VBA', 'Cas d\'usage réels'],
      image: '📊'
    },
    {
      id: 2,
      type: 'Template',
      title: 'Financial Dashboard Template',
      description: 'Template Excel prêt à l\'emploi pour la gestion financière et reporting.',
      price: '$49',
      rating: 4.8,
      reviews: 89,
      features: ['Formules avancées', 'Graphiques', 'Mise à jour automatique', 'Support inclus'],
      image: '📈'
    },
    {
      id: 3,
      type: 'E-book',
      title: 'Data Analytics for Business Leaders',
      description: 'Guide pour les décideurs: comment utiliser les données pour prendre de meilleures décisions.',
      price: '$39',
      rating: 4.7,
      reviews: 156,
      features: ['150+ pages', 'Cas d\'études', 'Stratégies', 'Outils recommandés'],
      image: '📊'
    },
    {
      id: 4,
      type: 'Tool',
      title: 'Sales Pipeline Automation Kit',
      description: 'Kit complet d\'automation pour gérer votre pipeline de ventes.',
      price: '$79',
      rating: 4.9,
      reviews: 203,
      features: ['Excel + Google Sheets', 'Intégrations CRM', 'Reporting auto', 'Formation incluse'],
      image: '🎯'
    },
    {
      id: 5,
      type: 'E-book',
      title: 'AI & Automation Playbook',
      description: 'Playbook pratique pour implémenter l\'IA et l\'automation dans votre entreprise.',
      price: '$49',
      rating: 4.8,
      reviews: 134,
      features: ['250+ pages', 'Roadmap', 'Checklist', 'Ressources bonus'],
      image: '🤖'
    },
    {
      id: 6,
      type: 'Template',
      title: 'HR Analytics Dashboard',
      description: 'Dashboard pour analyser vos données RH et optimiser votre gestion des talents.',
      price: '$59',
      rating: 4.7,
      reviews: 98,
      features: ['KPIs prédéfinis', 'Visualisations', 'Formules complexes', 'Mise à jour facile'],
      image: '👥'
    }
  ];

  // Mapper les fichiers BDD vers le format produit
  const dynamicProducts = files?.map((file, idx) => ({
    id: file.id,
    type: file.category.charAt(0).toUpperCase() + file.category.slice(1),
    title: file.title,
    description: file.description || 'Ressource numérique de qualité',
    price: file.priceCents > 0 ? `$${(file.priceCents / 100).toFixed(2)}` : 'Gratuit',
    rating: 4.8 + (idx % 2) * 0.1,
    reviews: 50 + idx * 20,
    features: ['Accès immédiat', 'Support inclus', `${(file.sizeBytes / 1024 / 1024).toFixed(1)}MB`],
    image: '📥',
    isFile: true as const,
    fileId: file.id
  })) || [];

  // Afficher les fichiers BDD en priorité, puis les produits statiques
  const productsToDisplay = dynamicProducts.length > 0 ? dynamicProducts : staticProducts;

  const bundleLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Bonjour GTC, je souhaite commander le Bundle Spécial GTC. Merci de me guider pour le paiement.')}`;
  const bundleBooks = ['Excel Expert', 'Google Sheets Perfection', 'Maîtriser les erreurs Excel'];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'callback') {
      setPaymentNotice('Paiement en cours de vérification. Vous recevrez la confirmation officielle après validation serveur.');
      window.history.replaceState(null, '', '/products');
    }
  }, []);

  const handleDownload = async (fileId: number, title: string) => {
    setDownloadingId(fileId);
    try {
      const result = await downloadFile.mutateAsync({ id: fileId });
      // Ouvrir le lien de téléchargement
      window.open(result.url, '_blank');
      trackEvent('file_downloaded', { file_id: fileId, file_name: title });
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Layout>
      <SEOHelmet
        title="Produits - General Tech Consult"
        description="E-books, templates Excel et outils numériques pour optimiser votre entreprise. Solutions prêtes à l'emploi."
        keywords="e-books, templates Excel, outils numériques, automation, business tools"
      />

      {/* Header */}
      <section className="gtc-section-dark pt-32 pb-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator mb-8"></div>
          <h1 className="gtc-hero-title mb-6 text-white">Produits Numériques</h1>
          <p className="text-xl text-[#00D4FF] max-w-2xl">
            E-books, templates et outils prêts à l'emploi pour transformer votre entreprise.
          </p>
        </div>
      </section>

      {paymentNotice && (
        <div className="bg-green-50 px-4 py-4 text-center text-sm font-semibold text-green-700">
          {paymentNotice}
        </div>
      )}

      {/* Products Grid */}
      <section className="gtc-section-light py-24">
        <div className="container max-w-7xl mx-auto px-4">
          {isLoading && dynamicProducts.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-4" size={32} />
              <p className="text-slate-600">Chargement des produits...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productsToDisplay.map((product) => (
                <div key={product.id} className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden hover:shadow-xl transition-all">
                  <div className="bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] h-40 flex items-center justify-center text-6xl">
                    {product.image}
                  </div>

                  <div className="p-6">
                    <span className="inline-block px-2 py-1 bg-[#F5F7FA] text-[#1E90FF] text-xs font-semibold rounded mb-3">
                      {product.type}
                    </span>

                    <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">{product.title}</h3>
                    <p className="text-[#64748B] text-sm mb-4">{product.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-[#64748B]">
                        {product.rating.toFixed(1)} ({product.reviews} avis)
                      </span>
                    </div>

                    <div className="space-y-2 mb-6 text-sm text-[#64748B]">
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-[#1E90FF]">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-[#1E90FF]">{product.price}</div>
                      {'fileId' in product ? (
                        <button
                          onClick={() => handleDownload((product as any).fileId, product.title)}
                          disabled={downloadingId === (product as any).fileId}
                          className="gtc-btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                        >
                          {downloadingId === (product as any).fileId ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Téléchargement...
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              Télécharger
                            </>
                          )}
                        </button>
                      ) : (
                        <a 
                          href={buyLink(product.title, product.price)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackBuy(product.title, product.price)}
                          className="gtc-btn-primary text-sm px-4 py-2"
                        >
                          Acheter
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bundle Offer */}
      <section className="gtc-section-gray py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#0B1F3A] via-[#102B4C] to-[#07172C] p-6 text-white shadow-2xl md:p-10">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#00D4FF]/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#1E90FF]/10 blur-3xl" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="mb-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#00D4FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B1F3A]">
                    Offre spéciale
                  </span>
                  <span className="rounded-full border border-white/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Limité
                  </span>
                </div>

                <h2 className="text-3xl font-bold leading-tight md:text-5xl">Bundle Spécial</h2>
                <p className="mt-4 max-w-2xl text-lg text-[#D6EAFE]">
                  Les 3 guides essentiels pour maîtriser Excel, Google Sheets et éviter les erreurs qui coûtent cher.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-white/8 p-5">
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">E-book sécurisé</p>
                    <p className="mt-2 text-3xl font-bold">$17.5</p>
                    <p className="text-sm text-white/60 line-through">au lieu de $25</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/8 p-5">
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">Format papier</p>
                    <p className="mt-2 text-3xl font-bold">$31.50</p>
                    <p className="text-sm text-white/60 line-through">au lieu de $45</p>
                    <p className="mt-1 text-xs text-[#D6EAFE]">Livraison : 6000 CDF</p>
                  </div>
                </div>

                <ul className="mt-7 grid gap-3 text-sm text-[#D6EAFE] sm:grid-cols-2">
                  {[
                    'PDF personnalisé et sécurisé (non partageable)',
                    'Coaching offert pendant 1 mois',
                    'Suivi avec nos experts',
                    'Approuvé par les experts en Data',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#00D4FF]" size={17} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBundleModalOpen(true);
                      trackEvent('bundle_order_modal_open', { offer: 'bundle_special' });
                    }}
                    className="gtc-btn-primary inline-flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={18} />
                    Commander maintenant
                  </button>
                  <a
                    href={bundleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackWhatsAppClick('product');
                      trackEvent('bundle_whatsapp_click', { offer: 'bundle_special' });
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded border-2 border-white/35 px-8 py-3 font-semibold text-white transition hover:border-[#00D4FF] hover:bg-white/10"
                  >
                    <MessageCircle size={18} />
                    Commander via WhatsApp
                  </a>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {bundleBooks.map((book, index) => (
                  <article key={book} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/95 p-4 text-[#0B1F3A] shadow-xl">
                    <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded bg-gradient-to-br from-[#0B1F3A] to-[#1E90FF] text-center text-xs font-bold uppercase leading-tight text-white">
                      Livre {index + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#1E90FF]">Guide GTC</p>
                      <h3 className="mt-1 text-lg font-bold">{book}</h3>
                      <p className="mt-1 text-sm text-[#64748B]">Image de couverture à uploader prochainement.</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isBundleModalOpen && (
        <Suspense fallback={null}>
          <BundleOrderModal onClose={() => setIsBundleModalOpen(false)} whatsappNumber={WA_NUMBER} />
        </Suspense>
      )}

      {/* Why Buy */}
      <section className="gtc-section-light py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator mb-8 mx-auto"></div>
          <h2 className="text-4xl font-bold text-[#0B1F3A] text-center mb-16">Pourquoi nos produits?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">ROI Immédiat</h3>
              <p className="text-[#64748B]">Commencez à voir des résultats dès le premier jour</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">Accès Immédiat</h3>
              <p className="text-[#64748B]">Téléchargez et commencez à utiliser immédiatement</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">Support Inclus</h3>
              <p className="text-[#64748B]">Accès à notre communauté et support technique</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

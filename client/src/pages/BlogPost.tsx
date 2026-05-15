import { useEffect } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import Layout from '@/components/Layout';
import SEOHelmet from '@/components/SEOHelmet';
import {
  Calendar, User, Clock, ArrowLeft, AlertCircle, Lightbulb,
  ListChecks, Sparkles, MessageCircle, Send, ArrowRight, CheckCircle2
} from 'lucide-react';
import { getArticleBySlug } from '@/data/blogArticles';
import { useFormModal } from '@/contexts/FormModalContext';
import { getWhatsAppLink, trackWhatsAppClick, trackEvent } from '@/lib/conversion';

export default function BlogPost() {
  const [, params] = useRoute<{ slug: string }>('/blog/:slug');
  const [, setLocation] = useLocation();
  const { openForm } = useFormModal();
  const slug = params?.slug || '';
  const article = getArticleBySlug(slug);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    if (article) {
      trackEvent('blog_article_view', {
        article_slug: article.slug,
        article_title: article.title,
        article_category: article.category,
      });
    }
  }, [slug, article]);

  if (!article) {
    return (
      <Layout>
        <SEOHelmet title="Article introuvable - GTC" description="Cet article n'existe pas." />
        <section className="gtc-section-light min-h-[60vh] flex items-center justify-center pt-32 pb-20">
          <div className="container max-w-2xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-[#0B1F3A] mb-4">Article introuvable</h1>
            <p className="text-[#64748B] mb-8">L'article que vous cherchez n'existe pas ou a été déplacé.</p>
            <button onClick={() => setLocation('/blog')} className="gtc-btn-primary inline-flex items-center gap-2">
              <ArrowLeft size={18} /> Retour au blog
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  // WhatsApp link with article-specific message
  const articleWaMessage = `Bonjour GTC, je viens de lire votre article "${article.title}" et je souhaite parler à un expert pour appliquer cette méthode dans mon entreprise.`;
  const articleWaLink = `https://wa.me/243829664720?text=${encodeURIComponent(articleWaMessage)}`;

  return (
    <Layout>
      <SEOHelmet
        title={`${article.title} | Blog GTC`}
        description={article.excerpt}
        keywords={article.seoKeywords}
      />

      {/* HEADER */}
      <article>
        <header className="gtc-section-dark pt-32 pb-16 relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 bg-[#1E90FF] rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#00D4FF] rounded-full blur-3xl"></div>
          </div>

          <div className="container max-w-4xl mx-auto px-4 relative z-10">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#00D4FF] hover:text-white text-sm font-medium mb-6 transition-colors"
            >
              <ArrowLeft size={16} /> Retour au blog
            </Link>

            {/* Category */}
            <span className="inline-block px-3 py-1 bg-[#1E90FF]/20 border border-[#1E90FF]/40 text-[#00D4FF] text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              {article.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <User size={16} className="text-[#00D4FF]" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#00D4FF]" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#00D4FF]" />
                <span>{article.readTime} de lecture</span>
              </div>
            </div>
          </div>
        </header>

        {/* Visual hero */}
        <div className="relative bg-gradient-to-r from-[#1E90FF] to-[#00D4FF] py-16">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <div className="text-7xl md:text-8xl">{article.emoji}</div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-white">
          <div className="container max-w-3xl mx-auto px-4 py-16 md:py-20 space-y-16">
            {/* Lead paragraph */}
            <p className="text-xl text-[#64748B] leading-relaxed font-light italic border-l-4 border-[#1E90FF] pl-6">
              {article.excerpt}
            </p>

            {/* SECTION 1: Problem */}
            <section id="probleme">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1F3A]">
                  {article.problem.title}
                </h2>
              </div>
              <div className="space-y-4 text-base md:text-lg text-[#374151] leading-relaxed pl-0 md:pl-15">
                {article.problem.paragraphs.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#0B1F3A]">$1</strong>') }}></p>
                ))}
              </div>
            </section>

            {/* SECTION 2: Explanation */}
            <section id="explication">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={24} className="text-yellow-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1F3A]">
                  {article.explanation.title}
                </h2>
              </div>
              <div className="space-y-4 text-base md:text-lg text-[#374151] leading-relaxed">
                {article.explanation.paragraphs.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#0B1F3A]">$1</strong>') }}></p>
                ))}
              </div>
            </section>

            {/* MID-CONTENT CTA */}
            <aside className="bg-gradient-to-br from-[#0B1F3A] to-[#145DA0] rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#00D4FF]/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <p className="text-[#00D4FF] uppercase text-xs font-bold tracking-widest mb-3">Une question ?</p>
                <h3 className="text-xl md:text-2xl font-bold mb-3">
                  Discutons de votre cas spécifique
                </h3>
                <p className="text-[#E0F2FF] mb-5 text-sm md:text-base">
                  Nos experts répondent en moins de 5 min sur WhatsApp.
                </p>
                <a
                  href={articleWaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { trackWhatsAppClick(article.ctaFormType); trackEvent('blog_mid_cta_click', { article_slug: article.slug }); }}
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg"
                >
                  <MessageCircle size={18} /> Poser ma question sur WhatsApp
                </a>
              </div>
            </aside>

            {/* SECTION 3: Method (Step-by-Step) */}
            <section id="methode">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ListChecks size={24} className="text-[#1E90FF]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1F3A]">
                  {article.method.title}
                </h2>
              </div>
              <p className="text-base md:text-lg text-[#374151] leading-relaxed mb-8">
                {article.method.intro}
              </p>
              <ol className="space-y-6">
                {article.method.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-5 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] text-white font-extrabold text-lg rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-lg md:text-xl font-bold text-[#0B1F3A] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[#374151] leading-relaxed text-base">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* SECTION 4: Practical Examples */}
            <section id="exemples">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles size={24} className="text-green-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1F3A]">
                  {article.examples.title}
                </h2>
              </div>
              <p className="text-base md:text-lg text-[#374151] leading-relaxed mb-8">
                {article.examples.intro}
              </p>
              <div className="grid gap-5 md:grid-cols-1">
                {article.examples.cases.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F5F7FA] rounded-xl p-6 border-l-4 border-[#1E90FF] hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-bold text-[#0B1F3A] mb-2 text-lg">
                      {ex.title}
                    </h4>
                    <p className="text-[#374151] mb-3 text-sm md:text-base leading-relaxed">
                      {ex.description}
                    </p>
                    {ex.outcome && (
                      <div className="flex items-start gap-2 text-sm md:text-base font-semibold text-green-700 bg-green-50 rounded-lg px-4 py-3">
                        <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
                        <span>{ex.outcome}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* FINAL CTA — DUAL */}
        <section className="bg-gradient-to-br from-[#0B1F3A] via-[#145DA0] to-[#0B1F3A] py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1E90FF] rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00D4FF] rounded-full blur-3xl"></div>
          </div>

          <div className="container max-w-4xl mx-auto px-4 relative z-10 text-center">
            <span className="inline-block bg-yellow-400 text-[#0B1F3A] text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-5">
              Passez à l'action
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
              Vous voulez appliquer cette méthode chez vous ?
            </h2>
            <p className="text-lg md:text-xl text-[#E0F2FF] mb-10 max-w-2xl mx-auto">
              Choisissez le mode d'accompagnement qui vous convient.
              Nos experts vous répondent personnellement.
            </p>

            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* CTA 1: WhatsApp */}
              <a
                href={articleWaLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { trackWhatsAppClick(article.ctaFormType); trackEvent('blog_final_cta_click', { article_slug: article.slug, cta_type: 'whatsapp' }); }}
                className="group bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold px-6 py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <MessageCircle size={22} />
                <span>Parler à un expert</span>
              </a>

              {/* CTA 2: Custom Solution Form */}
              <button
                onClick={() => { openForm(article.ctaFormType); trackEvent('blog_final_cta_click', { article_slug: article.slug, cta_type: 'form' }); }}
                className="group bg-white hover:bg-[#F5F7FA] text-[#0B1F3A] font-bold px-6 py-5 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <Send size={22} />
                <span>Solution personnalisée</span>
              </button>
            </div>

            <p className="text-sm text-[#94A3B8] mt-8">
              Réponse garantie sous 24 h · Première consultation gratuite
            </p>
          </div>
        </section>

        {/* RELATED ARTICLES */}
        <section className="bg-[#F5F7FA] py-16 md:py-20">
          <div className="container max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1F3A] mb-2">
              À lire aussi
            </h2>
            <p className="text-[#64748B] mb-10">Continuez votre apprentissage</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Show 3 other articles */}
              {[1, 2, 3, 4, 5, 6]
                .filter((id) => id !== article.id)
                .slice(0, 3)
                .map((id) => {
                  const other = getArticleBySlug(
                    ['automatiser-excel-gagner-10-heures',
                      'data-analytics-5-erreurs-a-eviter',
                      'ai-automation-guide-pme',
                      'dashboards-excel-vs-power-bi',
                      'formation-excel-investissement',
                      'integration-excel-mobile'][id - 1]
                  );
                  if (!other) return null;
                  return (
                    <Link
                      key={other.id}
                      href={`/blog/${other.slug}`}
                      className="block bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all group"
                    >
                      <div className="bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] h-32 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                        {other.emoji}
                      </div>
                      <div className="p-5">
                        <span className="inline-block px-2 py-0.5 bg-[#F5F7FA] text-[#1E90FF] text-xs font-semibold rounded mb-2">
                          {other.category}
                        </span>
                        <h3 className="font-bold text-[#0B1F3A] text-base mb-2 line-clamp-2 group-hover:text-[#1E90FF] transition-colors">
                          {other.title}
                        </h3>
                        <div className="text-[#1E90FF] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Découvrir la méthode <ArrowRight size={14} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>
      </article>
    </Layout>
  );
}

import Layout from '@/components/Layout';
import SEOHelmet from '@/components/SEOHelmet';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'wouter';
import { blogArticles } from '@/data/blogArticles';
import { trackEvent } from '@/lib/conversion';

export default function Blog() {
  const featured = blogArticles[0];
  const others = blogArticles.slice(1);

  const handleDiscoverClick = (slug: string, title: string, source: string) => {
    trackEvent('blog_card_click', {
      article_slug: slug,
      article_title: title,
      source,
    });
  };

  return (
    <Layout>
      <SEOHelmet
        title="Blog & Insights - General Tech Consult"
        description="Méthodes éprouvées sur Excel, automatisation, data analytics et IA. Articles structurés Problème → Méthode → Exemples par les experts GTC."
        keywords="blog GTC, méthode Excel, automation, data analytics, AI PME, Power BI, formation Excel"
      />

      {/* Header */}
      <section className="gtc-section-dark pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#1E90FF] rounded-full blur-3xl"></div>
        </div>
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="gtc-line-separator mb-8"></div>
          <h1 className="gtc-hero-title mb-6 text-white">Blog & Insights</h1>
          <p className="text-lg md:text-xl text-[#00D4FF] max-w-2xl">
            Méthodes éprouvées, étapes concrètes et exemples réels pour transformer
            votre entreprise grâce aux données et à l'automatisation.
          </p>
        </div>
      </section>

      {/* Featured Article */}
      <section className="gtc-section-light py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <Link
            href={`/blog/${featured.slug}`}
            onClick={() => handleDiscoverClick(featured.slug, featured.title, 'featured')}
            className="block bg-gradient-to-r from-[#0B1F3A] to-[#145DA0] rounded-2xl overflow-hidden hover:shadow-2xl transition-all group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] h-72 lg:h-auto flex items-center justify-center text-7xl md:text-8xl group-hover:scale-105 transition-transform duration-500">
                {featured.emoji}
              </div>
              <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center text-white">
                <span className="inline-block px-3 py-1 bg-[#1E90FF] text-white text-xs font-bold uppercase tracking-wider rounded-full w-fit mb-4">
                  Article en vedette
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight group-hover:text-[#00D4FF] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-[#E0F2FF] mb-6 text-base md:text-lg leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#94A3B8] mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#00D4FF]" />
                    {featured.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[#00D4FF]" />
                    {featured.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#00D4FF]" />
                    {featured.readTime}
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 bg-[#1E90FF] hover:bg-[#00D4FF] text-white font-bold px-6 py-3 rounded-lg w-fit transition-all group-hover:gap-3">
                  Découvrir la méthode <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="gtc-section-gray py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-10">
            <div className="gtc-line-separator mb-6"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1F3A]">
              Toutes nos méthodes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {others.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                onClick={() => handleDiscoverClick(article.slug, article.title, 'grid')}
                className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                <div className="bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] h-44 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                  {article.emoji}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <span className="inline-block px-2 py-1 bg-[#F5F7FA] text-[#1E90FF] text-xs font-bold uppercase tracking-wider rounded mb-3 w-fit">
                    {article.category}
                  </span>

                  <h3 className="text-lg font-bold text-[#0B1F3A] mb-2 leading-snug line-clamp-2 group-hover:text-[#1E90FF] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-[#64748B] text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-[#64748B] mb-4 pb-4 border-b border-[#E2E8F0]">
                    <Calendar size={14} />
                    {article.date}
                    <span className="ml-auto flex items-center gap-1">
                      <Clock size={14} />
                      {article.readTime}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-2 text-[#1E90FF] font-bold text-sm group-hover:gap-3 transition-all">
                    Découvrir la méthode <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="gtc-section-light py-16 md:py-24">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <div className="gtc-line-separator mb-8 mx-auto"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] mb-4">
            Une méthode adaptée à votre entreprise ?
          </h2>
          <p className="text-base md:text-lg text-[#64748B] mb-8">
            Nos articles vous montrent la voie. Nos experts l'appliquent
            pour vous, en moins de 5 minutes de discussion.
          </p>
          <a
            href="https://wa.me/243829664720?text=Bonjour%20GTC%2C%20j%27ai%20lu%20un%20article%20de%20votre%20blog%20et%20je%20souhaite%20en%20parler%20avec%20un%20expert."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { context: 'blog_footer', channel: 'whatsapp' })}
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Parler à un expert sur WhatsApp
          </a>
        </div>
      </section>
    </Layout>
  );
}

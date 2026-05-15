import { Link } from 'wouter';
import Layout from '@/components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <section className="gtc-section-light min-h-[60vh] flex items-center justify-center py-20">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-[#0B3C5D] mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B3C5D] mb-4">Page non trouvée</h2>
          <p className="text-lg text-[#6B7280] mb-8 max-w-2xl mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée. Retournez à l'accueil ou explorez nos services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="gtc-btn-primary text-center">
              Retour à l'accueil
            </Link>
            <Link href="/services" className="gtc-btn-secondary text-center">
              Voir nos services
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

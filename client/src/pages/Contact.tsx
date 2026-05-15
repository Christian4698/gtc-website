import { useState } from 'react';
import Layout from '@/components/Layout';
import SEOHelmet from '@/components/SEOHelmet';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { getWhatsAppLink, trackWhatsAppClick, trackFormSubmit, trackEvent } from '@/lib/conversion';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Track form submission in GA4 + Meta Pixel
    trackFormSubmit('contact', 'email');

    // Build a formatted email body and open the user's mail client
    const body = `Bonjour GTC,%0D%0A%0D%0ANom : ${formData.name}%0D%0AEmail : ${formData.email}%0D%0ATéléphone : ${formData.phone}%0D%0ASujet : ${formData.subject}%0D%0A%0D%0AMessage :%0D%0A${formData.message}%0D%0A%0D%0A--%0D%0AEnvoyé via le formulaire de contact General Tech Consult`;
    const subject = encodeURIComponent(formData.subject || 'Nouvelle demande de contact - GTC');
    window.location.href = `mailto:contact@generaltechconsult.com?subject=${subject}&body=${body}`;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };
  const email = 'contact@generaltechconsult.com';
  const phone = '+243 829 664 720';

  return (
    <Layout>
      <SEOHelmet
        title="Contact - General Tech Consult"
        description="Contactez General Tech Consult pour discuter de votre projet. Réponse rapide garantie en 24h."
        keywords="contact, formulaire, WhatsApp, email, consultation"
      />

      {/* Header */}
      <section className="gtc-section-dark pt-32 pb-20">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator mb-8"></div>
          <h1 className="gtc-hero-title mb-6 text-white">Contactez-nous</h1>
          <p className="text-xl text-[#00D4FF] max-w-2xl">
            Discutons de votre projet et découvrez comment nous pouvons vous aider.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="gtc-section-light py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Email */}
            <div className="bg-white p-8 rounded-lg border border-[#E2E8F0] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mb-4">
                <Mail size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">Email</h3>
              <p className="text-[#64748B] mb-4">{email}</p>
              <a href={`mailto:${email}`} onClick={() => trackEvent('email_click', { email_address: email, location: 'contact_page' })} className="text-[#1E90FF] font-semibold hover:text-[#00D4FF] flex items-center gap-2">
                Envoyer un email →
              </a>
            </div>

            {/* WhatsApp */}
            <div className="bg-white p-8 rounded-lg border border-[#E2E8F0] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mb-4">
                <MessageCircle size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">WhatsApp</h3>
              <p className="text-[#64748B] mb-4">{phone}</p>
              <a 
                href={getWhatsAppLink('general')}
                onClick={() => trackWhatsAppClick('general')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E90FF] font-semibold hover:text-[#00D4FF] flex items-center gap-2"
              >
                Envoyer un message →
              </a>
            </div>

            {/* Phone */}
            <div className="bg-white p-8 rounded-lg border border-[#E2E8F0] hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-lg flex items-center justify-center mb-4">
                <Phone size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">Téléphone</h3>
              <p className="text-[#64748B] mb-4">{phone}</p>
              <a href={`tel:${phone}`} onClick={() => trackEvent('phone_click', { phone_number: phone, location: 'contact_page' })} className="text-[#1E90FF] font-semibold hover:text-[#00D4FF] flex items-center gap-2">
                Appeler maintenant →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="gtc-section-gray py-24">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="bg-white p-12 rounded-lg border border-[#E2E8F0]">
            <div className="gtc-line-separator mb-8"></div>
            <h2 className="text-4xl font-bold text-[#0B1F3A] mb-2">Envoyez-nous un message</h2>
            <p className="text-[#64748B] mb-8">
              Remplissez le formulaire ci-dessous et nous vous répondrons dans les 24 heures.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-[#0B1F3A] mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF] focus:ring-opacity-20"
                    placeholder="Votre nom"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#0B1F3A] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF] focus:ring-opacity-20"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-[#0B1F3A] mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF] focus:ring-opacity-20"
                    placeholder="+243 XXX XXX XXX"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-[#0B1F3A] mb-2">
                    Sujet *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF] focus:ring-opacity-20"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="data-analytics">Data Analytics</option>
                    <option value="excel-automation">Excel Automation</option>
                    <option value="development">Développement Logiciel</option>
                    <option value="training">Formation</option>
                    <option value="ai-automation">AI & Automation</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-[#0B1F3A] mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF] focus:ring-opacity-20 resize-none"
                  placeholder="Décrivez votre projet ou votre question..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="gtc-btn-primary flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Envoyer le message
                </button>
                <a 
                  href={getWhatsAppLink('general')}
                onClick={() => trackWhatsAppClick('general')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gtc-btn-secondary flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Contactez via WhatsApp
                </a>
              </div>

              {/* Success Message */}
              {submitted && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-2">
                  <span>✓</span>
                  <span>Merci ! Votre message a été envoyé avec succès. Nous vous répondrons bientôt.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Availability */}
      <section className="gtc-section-dark py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Horaires de disponibilité</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#1E90FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">📅</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Lundi - Vendredi</p>
                    <p className="text-[#00D4FF]">9:00 - 18:00 (GMT+1)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#1E90FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">📅</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Samedi</p>
                    <p className="text-[#00D4FF]">10:00 - 14:00 (GMT+1)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#1E90FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">🚫</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Dimanche</p>
                    <p className="text-[#00D4FF]">Fermé</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Réponse rapide garantie</h2>
              <p className="text-[#00D4FF] mb-8 text-lg">
                Nous nous engageons à répondre à tous les messages dans les 24 heures. Pour une réponse plus rapide, utilisez WhatsApp ou appelez-nous directement.
              </p>
              <div className="space-y-3">
                <p className="text-white flex items-center gap-2">
                  <span className="text-[#1E90FF]">✓</span>
                  Support technique 24/7
                </p>
                <p className="text-white flex items-center gap-2">
                  <span className="text-[#1E90FF]">✓</span>
                  Consultation gratuite
                </p>
                <p className="text-white flex items-center gap-2">
                  <span className="text-[#1E90FF]">✓</span>
                  Équipe dédiée à votre projet
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

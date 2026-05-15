import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { trackEvent, trackWhatsAppClick } from '@/lib/conversion';

type BundleOrderModalProps = {
  onClose: () => void;
  whatsappNumber: string;
};

type ProductType = 'E-book (PDF personnalise, non partageable)' | 'Format papier';
type DeliveryMode = 'Email' | 'WhatsApp';
type SendMode = 'WhatsApp' | 'Email';

export default function BundleOrderModal({ onClose, whatsappNumber }: BundleOrderModalProps) {
  const [productType, setProductType] = useState<ProductType>('E-book (PDF personnalise, non partageable)');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('Email');
  const [sendMode, setSendMode] = useState<SendMode>('WhatsApp');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isStaticFallback, setIsStaticFallback] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    address: '',
  });

  const getPrice = () => (productType === 'Format papier' ? 31.5 : 17.5);

  const buildTeamMessage = (createdOrderId: string) =>
    [
      'Bonjour GTC, je souhaite confirmer ma commande Bundle Special.',
      '',
      `Nom: ${form.fullName}`,
      `Email: ${form.email}`,
      `Telephone: ${form.whatsapp}`,
      `Produit: Bundle Special GTC`,
      `Format: ${productType}`,
      `Mode reception: ${deliveryMode}`,
      `Mode envoi choisi: ${sendMode}`,
      `Order ID: ${createdOrderId}`,
      productType === 'Format papier' ? `Adresse: ${form.address}` : null,
      '',
      `Montant: ${getPrice()} USD`,
    ]
      .filter(Boolean)
      .join('\n');

  const sendViaWhatsApp = () => {
    if (!orderId) return;
    trackWhatsAppClick('product');
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildTeamMessage(orderId))}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const sendViaEmail = () => {
    if (!orderId) return;
    window.location.href = `mailto:contact@generaltechconsult.com?subject=${encodeURIComponent(
      'Commande GTC'
    )}&body=${encodeURIComponent(buildTeamMessage(orderId))}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus('loading');
    setSubmitError('');
    setIsStaticFallback(false);

    trackEvent('bundle_order_submit', {
      product_type: productType,
      delivery_mode: deliveryMode,
      send_mode: sendMode,
    });

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.fullName,
          customerEmail: form.email,
          productType,
          productId: `bundle-special-${productType === 'Format papier' ? 'paper' : 'ebook'}-${sendMode.toLowerCase()}-${deliveryMode.toLowerCase()}`,
          amount: getPrice(),
          currency: 'USD',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.orderId) {
        throw new Error(result.error || 'Commande indisponible');
      }

      trackEvent('bundle_order_created', {
        product_type: productType,
        delivery_mode: deliveryMode,
        send_mode: sendMode,
        order_id: result.orderId,
      });

      setOrderId(result.orderId);
      setSubmitStatus('success');
    } catch (error) {
      const fallbackOrderId = `GTC-${Date.now()}`;
      setOrderId(fallbackOrderId);
      setIsStaticFallback(true);
      setSubmitStatus('success');
      setSubmitError(error instanceof Error ? error.message : 'Commande echouee');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1F3A]/75 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#1E90FF]">Bundle Special GTC</p>
            <h2 className="mt-1 text-2xl font-bold text-[#0B1F3A]">Commander maintenant</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#0B1F3A]"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom complet">
              <input
                required
                value={form.fullName}
                onChange={event => setForm(prev => ({ ...prev, fullName: event.target.value }))}
                className="bundle-input"
                placeholder="Votre nom"
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
                className="bundle-input"
                placeholder="vous@email.com"
              />
            </Field>
          </div>

          <Field label="WhatsApp">
            <input
              required
              type="tel"
              value={form.whatsapp}
              onChange={event => setForm(prev => ({ ...prev, whatsapp: event.target.value }))}
              className="bundle-input"
              placeholder="+243 ..."
            />
          </Field>

          <Field label="Mode d'envoi">
            <p className="mb-2 text-xs font-normal text-[#64748B]">
              Choisissez comment vous souhaitez envoyer votre commande.
            </p>
            <select
              required
              value={sendMode}
              onChange={event => setSendMode(event.target.value as SendMode)}
              className="bundle-input"
            >
              <option>WhatsApp</option>
              <option>Email</option>
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type de produit">
              <select
                value={productType}
                onChange={event => setProductType(event.target.value as ProductType)}
                className="bundle-input"
              >
                <option>E-book (PDF personnalise, non partageable)</option>
                <option>Format papier</option>
              </select>
            </Field>
            <Field label="Mode de reception">
              <select
                value={deliveryMode}
                onChange={event => setDeliveryMode(event.target.value as DeliveryMode)}
                className="bundle-input"
              >
                <option>Email</option>
                <option>WhatsApp</option>
              </select>
            </Field>
          </div>

          {productType === 'Format papier' && (
            <Field label="Adresse de livraison">
              <textarea
                required
                value={form.address}
                onChange={event => setForm(prev => ({ ...prev, address: event.target.value }))}
                className="bundle-input min-h-24 resize-y"
                placeholder="Ville, commune, avenue, reference..."
              />
            </Field>
          )}

          <div className="rounded-lg bg-[#E8F7FF] p-4 text-sm text-[#0B1F3A]">
            {productType === 'Format papier' ? (
              <p>
                <strong>Format papier :</strong> 31.50 USD au lieu de 45 USD + livraison 6000 CDF.
              </p>
            ) : (
              <p>
                <strong>E-book :</strong> 17.5 USD au lieu de 25 USD, PDF personnalise et securise.
              </p>
            )}
          </div>

          {submitStatus === 'success' && (
            <div className="grid gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <p className="text-sm font-semibold text-green-700">
                {isStaticFallback
                  ? "Le site statique ne peut pas enregistrer la commande en ligne. Vous pouvez envoyer la demande a notre equipe pour confirmation."
                  : "Votre commande a ete enregistree. Vous pouvez maintenant envoyer la demande a notre equipe pour confirmation."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={sendViaWhatsApp}
                  className="inline-flex items-center justify-center rounded bg-[#25D366] px-5 py-3 font-semibold text-white transition hover:bg-[#1FB75A]"
                >
                  Envoyer via WhatsApp
                </button>
                <button
                  type="button"
                  onClick={sendViaEmail}
                  className="inline-flex items-center justify-center rounded border-2 border-[#1E90FF] px-5 py-3 font-semibold text-[#1E90FF] transition hover:bg-[#1E90FF] hover:text-white"
                >
                  Envoyer par Email
                </button>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-semibold text-red-700">
              Commande non enregistree. {submitError} Vous pouvez reessayer.
            </p>
          )}

          <button
            type="submit"
            disabled={
              submitStatus === 'loading' ||
              !form.fullName ||
              !form.email ||
              !form.whatsapp ||
              (productType === 'Format papier' && !form.address)
            }
            className="gtc-btn-primary inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitStatus === 'loading' ? 'Enregistrement...' : 'Envoyer la commande'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-[#0B1F3A]">
      {label}
      {children}
    </label>
  );
}

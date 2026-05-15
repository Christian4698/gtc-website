import { useState, useEffect } from 'react';
import { X, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';
import { trackFormSubmit } from '@/lib/conversion';

export type FormType = 'software' | 'training' | 'data';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: FormType;
}

const WHATSAPP_NUMBER = '243829664720';
const EMAIL = 'contact@generaltechconsult.com';

export default function ServiceFormModal({ isOpen, onClose, formType }: ServiceFormModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setFormData({});
      }, 300);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, value: string) => {
    const current = (formData[field] as string[]) || [];
    if (current.includes(value)) {
      handleChange(field, current.filter(v => v !== value));
    } else {
      handleChange(field, [...current, value]);
    }
  };

  // Build a structured message
  const buildMessage = (): string => {
    const titles: Record<FormType, string> = {
      software: '🚀 NOUVELLE DEMANDE - LOGICIEL / APP CUSTOM',
      training: '📚 NOUVELLE INSCRIPTION - FORMATION',
      data: '📊 NOUVELLE DEMANDE - ANALYSE DE DONNÉES',
    };

    let message = `${titles[formType]}\n${'─'.repeat(35)}\n\n`;

    if (formType === 'software') {
      message += `👤 Nom: ${formData.fullName || 'N/A'}\n`;
      if (formData.company) message += `🏢 Entreprise: ${formData.company}\n`;
      message += `📧 Email: ${formData.email || 'N/A'}\n`;
      message += `📱 WhatsApp: ${formData.whatsapp || 'N/A'}\n\n`;
      message += `🛠️ Type de solution: ${formData.solutionType || 'N/A'}\n`;
      message += `📝 Besoin: ${formData.need || 'N/A'}\n\n`;
      message += `✅ Fonctionnalités: ${(formData.features || []).join(', ') || 'N/A'}\n`;
      message += `💾 Données existantes: ${formData.hasData || 'N/A'}\n`;
      message += `📦 Volume données: ${formData.dataSize || 'N/A'}\n\n`;
      message += `⏰ Urgence: ${formData.urgency || 'N/A'}\n`;
      message += `💰 Budget: ${formData.budget || 'N/A'} USD\n\n`;
      message += `🎯 Objectif final: ${formData.finalGoal || 'N/A'}`;
    } else if (formType === 'training') {
      message += `👤 Nom: ${formData.name || 'N/A'}\n`;
      message += `📧 Email: ${formData.email || 'N/A'}\n`;
      message += `📱 WhatsApp: ${formData.whatsapp || 'N/A'}\n\n`;
      message += `📚 Type de formation: ${formData.trainingType || 'N/A'}\n`;
      message += `📊 Niveau: ${formData.level || 'N/A'}\n\n`;
      message += `🎯 Objectif: ${formData.goal || 'N/A'}\n`;
      message += `🎬 Format: ${formData.format || 'N/A'}\n\n`;
      message += `📅 Disponibilité: ${formData.availability || 'N/A'}\n\n`;
      message += `💭 Attentes: ${formData.expectations || 'N/A'}`;
    } else if (formType === 'data') {
      message += `👤 Nom: ${formData.name || 'N/A'}\n`;
      message += `📧 Email: ${formData.email || 'N/A'}\n`;
      message += `📱 WhatsApp: ${formData.whatsapp || 'N/A'}\n\n`;
      message += `📊 Type de données: ${formData.dataType || 'N/A'}\n`;
      message += `🎯 Objectif: ${formData.goal || 'N/A'}\n`;
      message += `📦 Volume: ${formData.dataSize || 'N/A'}\n\n`;
      message += `📝 Description du problème: ${formData.problem || 'N/A'}\n\n`;
      message += `📅 Deadline: ${formData.deadline || 'N/A'}`;
    }

    message += `\n\n${'─'.repeat(35)}\n💬 Envoyé via gtcconsult.manus.space`;
    return message;
  };

  const handleSubmit = (method: 'whatsapp' | 'email') => {
    const message = buildMessage();
    const subject = encodeURIComponent('New Client Request - GTC');

    // Track conversion event
    trackFormSubmit(formType, method);

    if (method === 'whatsapp') {
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      const url = `mailto:${EMAIL}?subject=${subject}&body=${encodeURIComponent(message)}`;
      window.location.href = url;
    }
    setSubmitted(true);
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit('whatsapp');
  };

  if (!isOpen) return null;

  const titles: Record<FormType, { title: string; subtitle: string; cta: string; emoji: string }> = {
    software: {
      emoji: '🚀',
      title: 'Logiciel / App Sur Mesure',
      subtitle: 'Décrivez votre projet et recevez une proposition personnalisée',
      cta: 'Recevoir une proposition personnalisée',
    },
    training: {
      emoji: '📚',
      title: 'Inscription Formation',
      subtitle: 'Choisissez votre formation et démarrez votre apprentissage',
      cta: 'Je m\'inscris maintenant',
    },
    data: {
      emoji: '📊',
      title: 'Analyse de Données',
      subtitle: 'Confiez-nous vos données pour des insights stratégiques',
      cta: 'Demander une analyse',
    },
  };

  const config = titles[formType];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0B1F3A]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1F3A] via-[#1E90FF] to-[#00D4FF] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
          <div className="text-3xl mb-2">{config.emoji}</div>
          <h2 className="text-2xl font-bold">{config.title}</h2>
          <p className="text-[#E0F2FF] text-sm mt-1">{config.subtitle}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {submitted ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#1E90FF] to-[#00D4FF] rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="text-white" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-[#0B1F3A] mb-3">Demande envoyée !</h3>
              <p className="text-[#64748B] mb-6">
                Merci pour votre demande. Notre équipe vous contactera dans les <strong className="text-[#1E90FF]">24 heures</strong>.
              </p>
              <p className="text-sm text-[#64748B] mb-6">
                Si la fenêtre WhatsApp ne s'est pas ouverte, vous pouvez aussi nous envoyer un email :
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => handleSubmit('email')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#1E90FF] transition-all font-semibold"
                >
                  <Mail size={18} />
                  Envoyer par email
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#E2E8F0] text-[#64748B] rounded-lg hover:border-[#1E90FF] hover:text-[#1E90FF] transition-all font-semibold"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onFormSubmit} className="p-6 space-y-5">
              {formType === 'software' && (
                <SoftwareFormFields formData={formData} onChange={handleChange} onCheckbox={handleCheckboxChange} />
              )}
              {formType === 'training' && (
                <TrainingFormFields formData={formData} onChange={handleChange} />
              )}
              {formType === 'data' && (
                <DataFormFields formData={formData} onChange={handleChange} />
              )}

              {/* Submit Buttons */}
              <div className="border-t border-[#E2E8F0] pt-5">
                <p className="text-xs text-[#64748B] mb-3 text-center">
                  Choisissez votre méthode d'envoi préférée :
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => handleSubmit('whatsapp')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1E90FF] to-[#00D4FF] text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                  >
                    <MessageCircle size={18} />
                    {config.cta}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit('email')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#0B1F3A] text-[#0B1F3A] rounded-lg hover:bg-[#0B1F3A] hover:text-white transition-all font-semibold"
                  >
                    <Mail size={18} />
                    Email
                  </button>
                </div>
                <p className="text-xs text-center text-[#64748B] mt-3">
                  ⚡ Réponse garantie en 24h
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ FORM FIELDS COMPONENTS ============

interface FieldProps {
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onCheckbox?: (field: string, value: string) => void;
}

function Input({ label, name, type = 'text', required = false, placeholder, formData, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0B1F3A] mb-1.5">
        {label} {required && <span className="text-[#1E90FF]">*</span>}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={formData[name] || ''}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF]/20 text-sm"
      />
    </div>
  );
}

function Textarea({ label, name, required = false, placeholder, formData, onChange, rows = 3 }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0B1F3A] mb-1.5">
        {label} {required && <span className="text-[#1E90FF]">*</span>}
      </label>
      <textarea
        required={required}
        rows={rows}
        placeholder={placeholder}
        value={formData[name] || ''}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF]/20 text-sm resize-none"
      />
    </div>
  );
}

function Select({ label, name, options, required = false, formData, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0B1F3A] mb-1.5">
        {label} {required && <span className="text-[#1E90FF]">*</span>}
      </label>
      <select
        required={required}
        value={formData[name] || ''}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E90FF] focus:ring-2 focus:ring-[#1E90FF]/20 text-sm bg-white"
      >
        <option value="">Sélectionnez...</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function CheckboxGroup({ label, name, options, formData, onCheckbox }: any) {
  const selected = (formData[name] as string[]) || [];
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0B1F3A] mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt: string) => {
          const isChecked = selected.includes(opt);
          return (
            <label
              key={opt}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all text-sm ${
                isChecked
                  ? 'border-[#1E90FF] bg-[#1E90FF]/5 text-[#0B1F3A]'
                  : 'border-[#E2E8F0] text-[#64748B] hover:border-[#1E90FF]/50'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onCheckbox(name, opt)}
                className="accent-[#1E90FF]"
              />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function RadioGroup({ label, name, options, required = false, formData, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0B1F3A] mb-2">
        {label} {required && <span className="text-[#1E90FF]">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => {
          const isSelected = formData[name] === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(name, opt)}
              className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                isSelected
                  ? 'border-[#1E90FF] bg-gradient-to-r from-[#1E90FF] to-[#00D4FF] text-white shadow-md'
                  : 'border-[#E2E8F0] text-[#64748B] hover:border-[#1E90FF]/50'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===== SOFTWARE FORM =====
function SoftwareFormFields({ formData, onChange, onCheckbox }: FieldProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nom complet" name="fullName" required formData={formData} onChange={onChange} placeholder="Votre nom" />
        <Input label="Entreprise (optionnel)" name="company" formData={formData} onChange={onChange} placeholder="Nom de votre entreprise" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Email" name="email" type="email" required formData={formData} onChange={onChange} placeholder="vous@email.com" />
        <Input label="WhatsApp" name="whatsapp" type="tel" required formData={formData} onChange={onChange} placeholder="+243 ..." />
      </div>
      <RadioGroup
        label="Type de solution recherchée"
        name="solutionType"
        required
        options={['Application mobile', 'Système Excel', 'Logiciel de gestion', 'Autre']}
        formData={formData}
        onChange={onChange}
      />
      <Textarea label="Décrivez votre besoin" name="need" required formData={formData} onChange={onChange} placeholder="Quel est votre projet et quels problèmes voulez-vous résoudre ?" rows={3} />
      <CheckboxGroup
        label="Fonctionnalités souhaitées"
        name="features"
        options={['Gestion utilisateurs', 'Tableau de bord', 'Rapports', 'Base de données', 'Notifications', 'Autre']}
        formData={formData}
        onCheckbox={onCheckbox}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RadioGroup label="Données existantes ?" name="hasData" options={['Oui', 'Non']} formData={formData} onChange={onChange} />
        <Select label="Volume de données" name="dataSize" options={['Petit', 'Moyen', 'Grand']} formData={formData} onChange={onChange} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Urgence du projet" name="urgency" required options={['Urgent', '1 mois', 'Flexible']} formData={formData} onChange={onChange} />
        <Select label="Budget (USD)" name="budget" required options={['Moins de 100', '100 - 500', '500 - 1000', '1000+']} formData={formData} onChange={onChange} />
      </div>
      <Textarea label="Objectif final" name="finalGoal" required formData={formData} onChange={onChange} placeholder="Quel résultat attendez-vous au final ?" rows={2} />
    </>
  );
}

// ===== TRAINING FORM =====
function TrainingFormFields({ formData, onChange }: FieldProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nom" name="name" required formData={formData} onChange={onChange} placeholder="Votre nom" />
        <Input label="Email" name="email" type="email" required formData={formData} onChange={onChange} placeholder="vous@email.com" />
      </div>
      <Input label="WhatsApp" name="whatsapp" type="tel" required formData={formData} onChange={onChange} placeholder="+243 ..." />

      <RadioGroup
        label="Type de formation"
        name="trainingType"
        required
        options={['Excel', 'Google Sheets', 'VBA', 'Intelligence Artificielle']}
        formData={formData}
        onChange={onChange}
      />
      <RadioGroup
        label="Niveau"
        name="level"
        required
        options={['Débutant', 'Intermédiaire', 'Avancé', 'Expert']}
        formData={formData}
        onChange={onChange}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Objectif"
          name="goal"
          required
          options={['Travail', 'Business', 'Études', 'Autre']}
          formData={formData}
          onChange={onChange}
        />
        <Select
          label="Format préféré"
          name="format"
          required
          options={['Vidéo', 'Présentiel', 'Les deux']}
          formData={formData}
          onChange={onChange}
        />
      </div>
      <Select
        label="Disponibilité"
        name="availability"
        required
        options={['Maintenant', 'Cette semaine', 'Ce mois']}
        formData={formData}
        onChange={onChange}
      />
      <Textarea label="Vos attentes" name="expectations" formData={formData} onChange={onChange} placeholder="Que voulez-vous apprendre ou maîtriser ?" rows={3} />
    </>
  );
}

// ===== DATA ANALYSIS FORM =====
function DataFormFields({ formData, onChange }: FieldProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nom" name="name" required formData={formData} onChange={onChange} placeholder="Votre nom" />
        <Input label="Email" name="email" type="email" required formData={formData} onChange={onChange} placeholder="vous@email.com" />
      </div>
      <Input label="WhatsApp" name="whatsapp" type="tel" required formData={formData} onChange={onChange} placeholder="+243 ..." />

      <RadioGroup
        label="Type de données"
        name="dataType"
        required
        options={['Excel', 'Google Sheets', 'Base de données', 'Autre']}
        formData={formData}
        onChange={onChange}
      />
      <RadioGroup
        label="Objectif de l'analyse"
        name="goal"
        required
        options={['Tableau de bord', 'Reporting', 'Nettoyage', 'Analyse avancée']}
        formData={formData}
        onChange={onChange}
      />
      <Select
        label="Volume de données"
        name="dataSize"
        required
        options={['Petit (< 1000 lignes)', 'Moyen (1k - 50k)', 'Grand (50k+)']}
        formData={formData}
        onChange={onChange}
      />
      <Textarea label="Description du problème" name="problem" required formData={formData} onChange={onChange} placeholder="Quel problème souhaitez-vous résoudre avec vos données ?" rows={3} />
      <Input label="Deadline souhaitée" name="deadline" type="text" formData={formData} onChange={onChange} placeholder="Ex: 2 semaines, Fin du mois..." />
    </>
  );
}

import { createContext, lazy, Suspense, useContext, useState, ReactNode } from 'react';
import type { FormType } from '@/components/ServiceFormModal';
import { trackEvent } from '@/lib/conversion';

const ServiceFormModal = lazy(() => import('@/components/ServiceFormModal'));

interface FormModalContextType {
  openForm: (type: FormType) => void;
  closeForm: () => void;
}

const FormModalContext = createContext<FormModalContextType | undefined>(undefined);

export function FormModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formType, setFormType] = useState<FormType>('software');

  const openForm = (type: FormType) => {
    setFormType(type);
    setIsOpen(true);
    // GA4: track modal open as an intent signal
    trackEvent('form_open', { form_type: type });
  };

  const closeForm = () => {
    setIsOpen(false);
    trackEvent('form_close', { form_type: formType });
  };

  return (
    <FormModalContext.Provider value={{ openForm, closeForm }}>
      {children}
      {isOpen && (
        <Suspense fallback={null}>
          <ServiceFormModal isOpen={isOpen} onClose={closeForm} formType={formType} />
        </Suspense>
      )}
    </FormModalContext.Provider>
  );
}

export function useFormModal() {
  const context = useContext(FormModalContext);
  if (!context) {
    throw new Error('useFormModal must be used within a FormModalProvider');
  }
  return context;
}

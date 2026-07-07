import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/common/BackButton';

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-4 sm:px-6 lg:px-8">
      <BackButton className="mb-6" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto prose prose-gray dark:prose-invert"
      >
        <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-8">{t('terms.title')}</h1>
        <p className="text-gray-500 font-medium">{t('terms.lastUpdated')}</p>
        
        <div className="glass-card p-8 rounded-2xl mt-8">
          <h2 className="text-xl font-bold mt-0">{t('terms.sections.acceptanceTitle')}</h2>
          <p>
            {t('terms.sections.acceptanceBody')}
          </p>

          <h2 className="text-xl font-bold mt-8">{t('terms.sections.serviceTitle')}</h2>
          <p>
            {t('terms.sections.serviceBody')}
          </p>

          <h2 className="text-xl font-bold mt-8">{t('terms.sections.conductTitle')}</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>{t('terms.sections.conductItem1')}</li>
            <li>{t('terms.sections.conductItem2')}</li>
            <li>{t('terms.sections.conductItem3')}</li>
            <li>{t('terms.sections.conductItem4')}</li>
          </ul>

          <h2 className="text-xl font-bold mt-8">{t('terms.sections.privacyTitle')}</h2>
          <p>
            {t('terms.sections.privacyBody')}
          </p>

          <h2 className="text-xl font-bold mt-8">{t('terms.sections.liabilityTitle')}</h2>
          <p>
            {t('terms.sections.liabilityBody')}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;

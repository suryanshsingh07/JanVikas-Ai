import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/common/BackButton';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-4 sm:px-6 lg:px-8">
      <BackButton className="mb-6" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto prose prose-gray dark:prose-invert"
      >
        <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-8">{t('privacy.title')}</h1>
        <p className="text-gray-500 font-medium">{t('privacy.lastUpdated')}</p>
        
        <div className="glass-card p-8 rounded-2xl mt-8">
          <h2 className="text-xl font-bold mt-0">{t('privacy.sections.informationTitle')}</h2>
          <p>{t('privacy.sections.informationBody')}</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>{t('privacy.sections.accountInfo')}:</strong> {t('privacy.sections.accountInfoBody')}</li>
            <li><strong>{t('privacy.sections.submissionData')}:</strong> {t('privacy.sections.submissionDataBody')}</li>
            <li><strong>{t('privacy.sections.usageData')}:</strong> {t('privacy.sections.usageDataBody')}</li>
          </ul>

          <h2 className="text-xl font-bold mt-8">{t('privacy.sections.useTitle')}</h2>
          <p>{t('privacy.sections.useBody')}</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>{t('privacy.sections.useItem1')}</li>
            <li>{t('privacy.sections.useItem2')}</li>
            <li>{t('privacy.sections.useItem3')}</li>
            <li>{t('privacy.sections.useItem4')}</li>
          </ul>

          <h2 className="text-xl font-bold mt-8">{t('privacy.sections.processingTitle')}</h2>
          <p>
            {t('privacy.sections.processingBody')}
          </p>

          <h2 className="text-xl font-bold mt-8">{t('privacy.sections.sharingTitle')}</h2>
          <p>
            {t('privacy.sections.sharingBody')}
          </p>

          <h2 className="text-xl font-bold mt-8">{t('privacy.sections.rightsTitle')}</h2>
          <p>
            {t('privacy.sections.rightsBody')}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;

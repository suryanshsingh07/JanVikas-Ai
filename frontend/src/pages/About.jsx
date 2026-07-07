import React from 'react';
import { Shield, Target, Users, Code, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/common/BackButton';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <BackButton className="mb-6" />
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">{t('about.title')}</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-16">
          {/* Mission */}
          <section className="glass-card p-8 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl shrink-0">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">{t('about.missionTitle')}</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('about.missionBody')}
                </p>
              </div>
            </div>
          </section>

          {/* Core Values */}
          <section>
            <h2 className="text-2xl font-bold mb-8 text-center">{t('about.principlesTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl">
                <Shield className="w-8 h-8 text-success mb-4" />
                <h3 className="text-lg font-bold mb-2">{t('about.cards.transparencyTitle')}</h3>
                <p className="text-sm text-gray-500">{t('about.cards.transparencyBody')}</p>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <Users className="w-8 h-8 text-info mb-4" />
                <h3 className="text-lg font-bold mb-2">{t('about.cards.inclusivityTitle')}</h3>
                <p className="text-sm text-gray-500">{t('about.cards.inclusivityBody')}</p>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <Code className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">{t('about.cards.innovationTitle')}</h3>
                <p className="text-sm text-gray-500">{t('about.cards.innovationBody')}</p>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <Award className="w-8 h-8 text-warning mb-4" />
                <h3 className="text-lg font-bold mb-2">{t('about.cards.actionTitle')}</h3>
                <p className="text-sm text-gray-500">{t('about.cards.actionBody')}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, ShieldCheck, Github, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const links = {
    [t('footer.sections.product')]: [
      { label: t('footer.links.citizenPortal'), to: '/citizen' },
      { label: t('footer.links.officerDashboard'), to: '/officer' },
      { label: t('footer.links.adminConsole'), to: '/admin' },
      { label: t('footer.links.aiFeatures'), href: '#features' },
      { label: t('footer.links.pricing'), to: '/pricing' },
    ],
    [t('footer.sections.platform')]: [
      { label: t('footer.links.howItWorks'), href: '#how-it-works' },
      { label: t('footer.links.security'), href: '#' },
      { label: t('footer.links.systemStatus'), href: '#' },
      { label: t('footer.links.apiReference'), href: '#' },
      { label: t('footer.links.integrations'), href: '#' },
    ],
    [t('footer.sections.resources')]: [
      { label: t('footer.links.documentation'), href: '#' },
      { label: t('footer.links.caseStudies'), href: '#' },
      { label: t('footer.links.blogUpdates'), href: '#' },
      { label: t('footer.links.communityForum'), href: '#' },
      { label: t('footer.links.openData'), href: '#' },
    ],
    [t('footer.sections.legal')]: [
      { label: t('footer.links.privacyPolicy'), to: '/privacy' },
      { label: t('footer.links.termsOfService'), to: '/terms' },
      { label: t('footer.links.dataProcessing'), href: '#' },
      { label: t('footer.links.cookiePolicy'), href: '#' },
      { label: t('footer.links.dpdpCompliance'), href: '#' },
    ],
  };

  return (
    <footer className="bg-surface border-t border-border pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/favicon.ico" className="w-8 h-8 object-contain" alt="JanVikas Logo" />
              <span className="font-display font-black text-xl tracking-tight text-foreground">
                JanVikas <span className="text-primary-500">AI</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed max-w-xs">
              {t('footer.brandDescription')}
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              <a href="mailto:contact@janvikas.ai" className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary-500 transition-colors">
                <Mail size={12} /> contact@janvikas.ai
              </a>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin size={12} /> New Delhi, India
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              {[
                { icon: <Twitter size={15} />, href: '#', label: 'Twitter' },
                { icon: <Github size={15} />, href: '#', label: 'GitHub' },
                { icon: <Linkedin size={15} />, href: '#', label: 'LinkedIn' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-surfaceHover border border-border flex items-center justify-center text-gray-500 hover:text-primary-500 hover:border-primary-500/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section} className="md:col-span-1">
              <h4 className="font-semibold text-sm mb-4 text-foreground">{section}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.to ? (
                      <Link to={item.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="py-6 border-y border-border mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: <ShieldCheck size={14} />, text: t('footer.badges.meityCertified') },
              { icon: <ShieldCheck size={14} />, text: t('footer.badges.iso27001') },
              { icon: <ShieldCheck size={14} />, text: t('footer.badges.dpiitRecognised') },
              { icon: <Activity size={14} />, text: t('footer.badges.systemsOperational'), accent: true },
              { icon: <ShieldCheck size={14} />, text: t('footer.badges.dpdpActCompliant') },
            ].map((b) => (
              <div
                key={b.text}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                  b.accent
                    ? 'text-success border-success/30 bg-success/5'
                    : 'text-gray-500 border-border bg-surfaceHover/50'
                }`}
              >
                <span className={b.accent ? 'text-success' : 'text-gray-400'}>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>{t('footer.bottom.copyright', { year })}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t('footer.bottom.privacy')}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t('footer.bottom.terms')}</Link>
            <a href="#contact" className="hover:text-foreground transition-colors">{t('footer.bottom.contact')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

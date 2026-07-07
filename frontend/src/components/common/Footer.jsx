import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Github, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  const links = {
    Product: [
      { label: 'Citizen Portal', to: '/citizen' },
      { label: 'Official Dashboard', to: '/official' },
      { label: 'Admin Console', to: '/admin' },
      { label: 'AI Features', href: '#features' },
      { label: 'Pricing', to: '/pricing' },
    ],
    Platform: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Security', href: '#' },
      { label: 'System Status', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Integrations', href: '#' },
    ],
    Resources: [
      { label: 'Documentation', href: '#' },
      { label: 'Case Studies', href: '#' },
      { label: 'Blog & Updates', href: '#' },
      { label: 'Community Forum', href: '#' },
      { label: 'Open Data', href: '#' },
    ],
    Legal: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Data Processing', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'DPDP Compliance', href: '#' },
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
              Empowering Indian democracy through AI. Bridging the gap between 1.4 billion citizens and their representatives — one complaint at a time.
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
              { icon: <ShieldCheck size={14} />, text: 'MeitY Certified' },
              { icon: <ShieldCheck size={14} />, text: 'ISO 27001' },
              { icon: <ShieldCheck size={14} />, text: 'DPIIT Recognised' },
              { icon: <Activity size={14} />, text: 'All Systems Operational', accent: true },
              { icon: <ShieldCheck size={14} />, text: 'DPDP Act Compliant' },
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
          <p>© {year} JanVikas AI Technologies Pvt. Ltd. · Built for Bharat 🇮🇳</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

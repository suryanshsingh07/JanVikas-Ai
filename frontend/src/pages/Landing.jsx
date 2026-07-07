import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, Activity, Map, Users, BrainCircuit, ShieldCheck, Zap,
  MessageSquare, Briefcase, Mic, Camera, BarChart3, TrendingUp,
  CheckCircle2, ChevronDown, ChevronUp, Globe, Database, Bell, Star
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import StatCounter from '../components/ui/StatCounter';
import api from '../services/api';

/* ── Particle Background ── */
const ParticleBackground = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 6,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary-400/20 dark:bg-primary-400/15 particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

/* ── Cursor Spotlight ── */
const CursorSpotlight = () => {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div
      className="cursor-spotlight"
      style={{ left: pos.x, top: pos.y, position: 'fixed', zIndex: 0 }}
    />
  );
};

/* ── Typewriter Effect ── */
const Typewriter = ({ texts }) => {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = texts[idx];
    let timer;
    if (!deleting && displayed.length < target.length) {
      timer = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === target.length) {
      timer = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % texts.length);
    }
    return () => clearTimeout(timer);
  }, [displayed, deleting, idx, texts]);

  return (
    <span>
      {displayed}
      <span className="cursor-blink text-primary-500">|</span>
    </span>
  );
};

/* ── AI Feature Card ── */
const AIFeatureCard = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass-card rounded-2xl p-6 hover:border-primary-500/40 transition-all group hover:-translate-y-1 hover:shadow-2xl"
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-info/20 flex items-center justify-center mb-4 border border-primary-500/20 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="font-semibold text-base mb-2 text-foreground">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

/* ── FAQ Item ── */
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between px-6 py-4 hover:bg-surfaceHover transition-colors"
      >
        <span className="font-medium text-sm">{q}</span>
        {open ? <ChevronUp size={16} className="text-primary-500" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
};

/* ══════════════════════ MAIN LANDING ══════════════════════ */
const Landing = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const [stats, setStats] = useState({
    activeIssues: 2847,
    resolvedToday: 143,
    aiPriorityQueue: 38,
    avgResolutionTime: '4.2d',
    languagesSupported: 22,
    complaintsAnalysed: 450000,
    districtsCovered: 145,
    aiAccuracy: 94
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/public/stats');
        if (res.success) {
          setStats({
            activeIssues: res.data.activeSubmissions || 0,
            resolvedToday: res.data.resolvedToday || 0,
            aiPriorityQueue: res.data.aiPriorityQueue || 0,
            avgResolutionTime: res.data.avgResolutionTime || '0d',
            languagesSupported: res.data.languagesSupported || 22,
            complaintsAnalysed: res.data.totalSubmissions || 0,
            districtsCovered: res.data.districtsCovered || 0,
            aiAccuracy: res.data.aiAccuracy || 94
          });
        }
      } catch (err) {
        console.error("Failed to fetch public stats");
      }
    };
    fetchStats();
  }, []);

  const aiFeatures = [
    { icon: <Mic className="w-5 h-5 text-primary-500" />, title: t('landing.cards.voiceTitle'), description: t('landing.cards.voiceDescription') },
    { icon: <Camera className="w-5 h-5 text-warning" />, title: t('landing.cards.imageTitle'), description: t('landing.cards.imageDescription') },
    { icon: <ShieldCheck className="w-5 h-5 text-success" />, title: t('landing.cards.fraudTitle'), description: t('landing.cards.fraudDescription') },
    { icon: <BrainCircuit className="w-5 h-5 text-info" />, title: t('landing.cards.nlpTitle'), description: t('landing.cards.nlpDescription') },
    { icon: <Map className="w-5 h-5 text-danger" />, title: t('landing.cards.heatmapTitle'), description: t('landing.cards.heatmapDescription') },
    { icon: <TrendingUp className="w-5 h-5 text-purple-500" />, title: t('landing.cards.predictiveTitle'), description: t('landing.cards.predictiveDescription') },
  ];

  const useCases = [
    { role: t('landing.useCases.citizensTitle'), icon: <Users className="w-6 h-6 text-primary-500" />, color: 'from-primary-500/10 to-primary-600/5', points: [t('landing.useCases.citizensPoint1'), t('landing.useCases.citizensPoint2'), t('landing.useCases.citizensPoint3'), t('landing.useCases.citizensPoint4')] },
    { role: t('landing.useCases.officialsTitle'), icon: <Briefcase className="w-6 h-6 text-info" />, color: 'from-info/10 to-blue-600/5', points: [t('landing.useCases.officialsPoint1'), t('landing.useCases.officialsPoint2'), t('landing.useCases.officialsPoint3'), t('landing.useCases.officialsPoint4')] },
    { role: t('landing.useCases.departmentsTitle'), icon: <Database className="w-6 h-6 text-warning" />, color: 'from-warning/10 to-yellow-600/5', points: [t('landing.useCases.departmentsPoint1'), t('landing.useCases.departmentsPoint2'), t('landing.useCases.departmentsPoint3'), t('landing.useCases.departmentsPoint4')] },
    { role: t('landing.useCases.ngosTitle'), icon: <Globe className="w-6 h-6 text-success" />, color: 'from-success/10 to-green-600/5', points: [t('landing.useCases.ngosPoint1'), t('landing.useCases.ngosPoint2'), t('landing.useCases.ngosPoint3'), t('landing.useCases.ngosPoint4')] },
  ];

  const faqs = [
    { q: t('landing.faqs.q1'), a: t('landing.faqs.a1') },
    { q: t('landing.faqs.q2'), a: t('landing.faqs.a2') },
    { q: t('landing.faqs.q3'), a: t('landing.faqs.a3') },
    { q: t('landing.faqs.q4'), a: t('landing.faqs.a4') },
    { q: t('landing.faqs.q5'), a: t('landing.faqs.a5') },
  ];

  const testimonials = [
    { name: t('landing.testimonials.oneName'), quote: t('landing.testimonials.oneQuote'), avatar: '🏛️' },
    { name: t('landing.testimonials.twoName'), quote: t('landing.testimonials.twoQuote'), avatar: '⚖️' },
    { name: t('landing.testimonials.threeName'), quote: t('landing.testimonials.threeQuote'), avatar: '🌆' },
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <CursorSpotlight />

      {/* ══ HERO SECTION ══ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
        <ParticleBackground />

        {/* Mesh gradient orbs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[700px] h-[700px] bg-primary-500/8 dark:bg-primary-500/12 rounded-full blur-3xl -top-32 -left-32 animate-float" />
          <div className="absolute w-[500px] h-[500px] bg-info/8 dark:bg-info/12 rounded-full blur-3xl bottom-0 right-0 animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute w-[300px] h-[300px] bg-purple-500/6 dark:bg-purple-500/10 rounded-full blur-2xl top-1/2 left-1/2 animate-float" style={{ animationDelay: '1.5s' }} />
          {/* Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>

        <motion.div className="relative z-10 container mx-auto px-4 text-center max-w-6xl">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-surface/80 border border-border text-xs font-medium mb-8 sm:mb-10 shadow-lg backdrop-blur-md badge-shimmer"
          >
            <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-success font-semibold">{t('landing.badge')}</span>
            <span className="text-gray-400">·</span>
            {t('landing.badgeMeta')}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight mb-6 leading-[1.05]"
          >
            {t('landing.title1')}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-violet-500 to-info animate-gradient">
              {t('landing.title2')}
            </span>
          </motion.h1>

          {/* Typewriter tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-400 font-medium mb-4 min-h-8"
          >
            <Typewriter texts={[t('landing.typewriter.aiPowered'), t('landing.typewriter.multilingual'), t('landing.typewriter.realTime'), t('landing.typewriter.dataDriven')]} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed"
          >
            {t('landing.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16"
          >
            <Link
              to={isAuthenticated ? '/citizen' : '/register'}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary-500/30 glow-pulse text-base"
            >
              {t('landing.getStarted')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface/80 hover:bg-surfaceHover border border-border rounded-full font-semibold transition-all active:scale-95 backdrop-blur-md text-base"
            >
              {t('landing.learnMore')}
            </a>
          </motion.div>

          {/* Mini AI Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative max-w-4xl mx-auto px-2 sm:px-0"
          >
            <div className="glass-card rounded-2xl p-3 sm:p-4 border border-border/50 shadow-2xl animate-shimmer">
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="w-3 h-3 rounded-full bg-danger/70" />
                <div className="w-3 h-3 rounded-full bg-warning/70" />
                <div className="w-3 h-3 rounded-full bg-success/70" />
                <span className="ml-3 text-xs text-gray-500 font-mono">JanVikas AI — Official Dashboard</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {[
                  { label: 'Active Issues', value: stats.activeIssues, color: 'text-primary-500', bg: 'bg-primary-500/10 border-primary-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] glow-pulse' },
                  { label: 'Resolved Today', value: stats.resolvedToday, color: 'text-success', bg: 'bg-success/10 border-success/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
                  { label: 'AI Priority Queue', value: stats.aiPriorityQueue, color: 'text-warning', bg: 'bg-warning/10 border-warning/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
                  { label: 'Avg. Resolution', value: stats.avgResolutionTime, color: 'text-info', bg: 'bg-info/10 border-info/30 shadow-[0_0_15px_rgba(14,165,233,0.15)]' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} rounded-xl p-3 text-center border relative overflow-hidden group`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <p className={`text-2xl font-black ${stat.color}`}>
                      {typeof stat.value === 'number' ? <StatCounter value={stat.value} /> : stat.value}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 bg-surface/50 rounded-xl p-4 border border-border/30 min-h-[96px] flex items-center justify-center">
                  <div className="flex gap-1.5 items-end h-16 w-full">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 72, 88].map((h, i) => (
                      <div key={i} className="w-3 bg-primary-500/60 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="bg-surface/50 rounded-xl p-3 border border-border/30 min-h-[96px] flex flex-col justify-center gap-2">
                  {['Road Damage', 'Water Supply', 'Sanitation'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: ['#3b82f6', '#f59e0b', '#10b981'][i] }} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating notification */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -top-4 -right-4 glass-card rounded-xl p-3 flex items-center gap-2 shadow-xl border border-border text-xs md:flex"
            >
              <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center">
                <CheckCircle2 size={12} className="text-success" />
              </div>
              <div>
                <p className="font-medium">Issue Resolved</p>
                <p className="text-gray-500 text-[10px]">Road repair — Sector 14</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

      </section>

      {/* ══ TRUST / BADGES ══ */}
      <section className="py-10 border-y border-border bg-surfaceHover/40 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">{t('landing.trustTitle')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-80">
            {['MeitY Certified', 'ISO 27001', 'DPIIT Recognised', 'NIC Integrated', 'Digital India', 'G20 Tech Partner', 'NASSCOM GovTech'].map((t) => (
              <span key={t} className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ IMPACT STATS ══ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: stats.languagesSupported, suffix: '', label: 'Languages Supported', color: 'text-primary-500' },
              { value: stats.complaintsAnalysed, suffix: '+', label: 'Complaints Analysed', color: 'text-info' },
              { value: stats.districtsCovered, suffix: '', label: 'Districts Covered', color: 'text-warning' },
              { value: stats.aiAccuracy, suffix: '%', label: 'AI Accuracy', color: 'text-success' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`text-4xl md:text-5xl font-display font-black mb-2 ${stat.color}`}>
                  <StatCounter value={stat.value} duration={2} className="inline" />{stat.suffix}
                </div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROBLEM → SOLUTION ══ */}
      <section className="py-24 bg-surface/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-black mb-4">{t('landing.problemTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('landing.problemSubtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-8 border-danger/20 border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                  <span className="text-lg">❌</span>
                </div>
                <h3 className="text-xl font-bold text-danger">{t('landing.beforeTitle')}</h3>
              </div>
              <ul className="space-y-3">
                {t('landing.beforePoints', { returnObjects: true }).map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                    <span className="text-danger mt-0.5">✗</span> {p}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solution */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-8 border-success/20 border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-lg">✅</span>
                </div>
                <h3 className="text-xl font-bold text-success">{t('landing.afterTitle')}</h3>
              </div>
              <ul className="space-y-3">
                {t('landing.afterPoints', { returnObjects: true }).map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                    <CheckCircle2 size={14} className="text-success mt-0.5 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black mb-4">{t('landing.sectionHowItWorksTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('landing.sectionHowItWorksSubtitle')}</p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary-500/50 via-info/50 to-success/50" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', icon: <Mic className="w-6 h-6 text-primary-500" />, title: 'Citizen Input', desc: 'Voice, text, or image submission in any of 22 languages from any device', bg: 'bg-primary-500/10', border: 'border-primary-500/30', pill: 'bg-primary-500 text-white' },
                { step: '02', icon: <BrainCircuit className="w-6 h-6 text-info" />, title: 'AI Analysis', desc: 'Automatic categorisation, deduplication, sentiment scoring, and geo-tagging', bg: 'bg-info/10', border: 'border-info/30', pill: 'bg-info text-white' },
                { step: '03', icon: <TrendingUp className="w-6 h-6 text-warning" />, title: 'Priority Score', desc: 'Multi-factor algorithm ranks issues by urgency, equity, and impact', bg: 'bg-warning/10', border: 'border-warning/30', pill: 'bg-warning text-white' },
                { step: '04', icon: <CheckCircle2 className="w-6 h-6 text-success" />, title: 'Government Action', desc: 'Officials receive AI-briefed agenda and resolve issues with tracked accountability', bg: 'bg-success/10', border: 'border-success/30', pill: 'bg-success text-white' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className={`w-24 h-24 rounded-full ${item.bg} border-2 border-dashed ${item.border} flex items-center justify-center mb-4 relative shadow-sm`}>
                    <div className={`w-14 h-14 rounded-full ${item.bg} flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    <span className={`absolute -top-2 -right-2 text-xs font-mono font-bold ${item.pill} px-2 py-0.5 rounded-full`}>{item.step}</span>
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ AI INTELLIGENCE SHOWCASE ══ */}
      <section id="features" className="py-24 bg-surface/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black mb-4">{t('landing.sectionFeaturesTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('landing.sectionFeaturesSubtitle')}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFeatures.map((f, i) => <AIFeatureCard key={i} {...f} delay={i * 0.08} />)}
          </div>
        </div>
      </section>

      {/* ══ LIVE DASHBOARD PREVIEW ══ */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-black mb-4">{t('landing.sectionPreviewTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('landing.sectionPreviewSubtitle')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-5xl mx-auto glass-card rounded-3xl p-6 shadow-2xl border border-border"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: t('landing.previewCards.mapView'), icon: <Map size={18} />, desc: t('landing.previewCards.mapDesc'), color: 'text-primary-500 bg-primary-500/10' },
                { label: t('landing.previewCards.analytics'), icon: <BarChart3 size={18} />, desc: t('landing.previewCards.analyticsDesc'), color: 'text-info bg-info/10' },
                { label: t('landing.previewCards.aiRecs'), icon: <BrainCircuit size={18} />, desc: t('landing.previewCards.aiRecsDesc'), color: 'text-warning bg-warning/10' },
                { label: t('landing.previewCards.priority'), icon: <TrendingUp size={18} />, desc: t('landing.previewCards.priorityDesc'), color: 'text-success bg-success/10' },
              ].map((card, i) => (
                <div key={i} className={`${card.color} rounded-xl p-4 border border-border/30`}>
                  <div className="flex items-center gap-2 mb-1">
                    {card.icon}
                    <span className="font-semibold text-sm">{card.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{card.desc}</p>
                </div>
              ))}
            </div>
            {/* Fake chart area */}
            <div className="bg-surface/50 rounded-2xl p-6 border border-border/30 flex items-center justify-center h-40">
              <div className="flex gap-1.5 items-end h-24 w-full max-w-sm">
                {[30, 55, 42, 78, 65, 90, 72, 88, 60, 95, 80, 85].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className="flex-1 rounded-t-md"
                    style={{ background: `hsl(${220 + i * 5}, 80%, 60%)`, opacity: 0.7 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ USE CASES ══ */}
      <section className="py-24 bg-surface/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black mb-4">{t('landing.sectionUseCasesTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('landing.sectionUseCasesSubtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card rounded-2xl p-6 border border-border bg-gradient-to-br ${uc.color} hover:-translate-y-2 transition-all`}
              >
                <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center mb-4 border border-border shadow-sm">
                  {uc.icon}
                </div>
                <h3 className="font-bold text-lg mb-4">{uc.role}</h3>
                <ul className="space-y-2">
                  {uc.points.map((p, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <CheckCircle2 size={12} className="text-success mt-0.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black mb-4">{t('landing.sectionTestimonialsTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('landing.sectionTestimonialsSubtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card rounded-2xl p-6 border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, j) => <Star key={j} size={14} className="text-warning fill-warning" />)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" className="py-24 bg-surface/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-black mb-4">{t('landing.sectionFaqTitle')}</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <FAQItem q={f.q} a={f.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[800px] h-[400px] bg-primary-500/8 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-6xl font-display font-black mb-6 leading-tight">
              {t('landing.sectionCtaTitle')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-violet-500 to-info animate-gradient">
                {t('landing.sectionCtaHighlight')}
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              {t('landing.sectionCtaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? '/citizen' : '/register'}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-bold transition-all hover:scale-105 shadow-2xl shadow-primary-500/30 text-lg"
              >
                Start for Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-5 bg-surface hover:bg-surfaceHover border border-border rounded-full font-bold transition-all text-lg"
              >
                <MessageSquare size={18} /> Talk to Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ CONTACT FORM ══ */}
      <section id="contact" className="py-24 bg-surface/30 border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black mb-4">{t('landing.sectionContactTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('landing.sectionContactSubtitle')}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-8 md:p-12 border border-border shadow-xl">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('landing.contact.fullNameLabel')}</label>
                  <input type="text" className="input" placeholder={t('landing.contact.fullNamePlaceholder')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('landing.contact.emailLabel')}</label>
                  <input type="email" className="input" placeholder={t('landing.contact.emailPlaceholder')} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('landing.contact.orgLabel')}</label>
                  <input type="text" className="input" placeholder={t('landing.contact.orgPlaceholder')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('landing.contact.subjectLabel')}</label>
                  <select className="select">
                    <option>{t('landing.contact.subjectPlaceholder')}</option>
                    <option>District Deployment Request</option>
                    <option>API / Integration</option>
                    <option>Technical Support</option>
                    <option>Platform Feedback</option>
                    <option>Media / Press</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('landing.contact.messageLabel')}</label>
                <textarea className="input min-h-[130px] resize-y" placeholder={t('landing.contact.messagePlaceholder')} />
              </div>
              <button className="btn btn-primary w-full py-3.5 text-base font-semibold flex items-center justify-center gap-2 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-transform">
                <MessageSquare size={18} />
                {t('landing.contact.submitButton')}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

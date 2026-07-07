import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/common/ThemeToggle';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground transition-colors duration-300">
      {/* Left side - Decorative/Branding */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary-900 to-black p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Patterns */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full blur-3xl mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-info/20 rounded-full blur-3xl mix-blend-screen" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-white">
            <img src="/favicon.ico" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
            <span className="font-display font-bold text-2xl tracking-tight">JanVikas AI</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight"
          >
            Empowering Democracy <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Through Technology
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-primary-100 text-lg leading-relaxed"
          >
            Join the platform that bridges the gap between citizens and their elected representatives using advanced Artificial Intelligence.
          </motion.p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-primary-200 text-sm">
          <span>&copy; {new Date().getFullYear()} JanVikas AI</span>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>

      {/* Right side - Form Area */}
      <div className="w-full md:w-1/2 flex flex-col relative">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
          <ThemeToggle />
        </div>
        
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 md:px-16 lg:px-24 py-12">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <img src="/favicon.ico" alt="JanVikas AI" className="w-8 h-8 object-contain rounded-md" />
            <span className="font-display font-bold text-xl">JanVikas AI</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

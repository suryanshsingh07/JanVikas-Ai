import React from 'react';
import { Shield, Target, Users, Code, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">About JanVikas AI</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Empowering citizens and enabling responsive governance through Artificial Intelligence.
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
                <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  JanVikas AI was built to solve the fundamental disconnect between citizens and government officials. 
                  In a nation as vast and diverse as India, millions of civic issues go unheard due to language barriers, 
                  redundant reporting, and manual processing bottlenecks. We leverage GenAI to bridge this gap, ensuring 
                  every voice is heard, analyzed, and actioned.
                </p>
              </div>
            </div>
          </section>

          {/* Core Values */}
          <section>
            <h2 className="text-2xl font-bold mb-8 text-center">Core Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl">
                <Shield className="w-8 h-8 text-success mb-4" />
                <h3 className="text-lg font-bold mb-2">Transparency & Security</h3>
                <p className="text-sm text-gray-500">Every interaction is securely logged, and citizens have full visibility into the lifecycle of their submissions.</p>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <Users className="w-8 h-8 text-info mb-4" />
                <h3 className="text-lg font-bold mb-2">Inclusivity</h3>
                <p className="text-sm text-gray-500">Language should never be a barrier to governance. Our 12+ language support ensures rural and urban citizens have equal access.</p>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <Code className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">Open Innovation</h3>
                <p className="text-sm text-gray-500">Built using scalable, modern tech stacks to serve as a robust blueprint for state and national IT departments.</p>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <Award className="w-8 h-8 text-warning mb-4" />
                <h3 className="text-lg font-bold mb-2">Data-Driven Action</h3>
                <p className="text-sm text-gray-500">We don't just collect complaints; our AI provides prescriptive analytics for optimal budget allocation.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;

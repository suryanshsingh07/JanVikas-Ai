import React from 'react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto prose prose-gray dark:prose-invert"
      >
        <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-8">Terms of Service</h1>
        <p className="text-gray-500 font-medium">Last Updated: July 2026</p>
        
        <div className="glass-card p-8 rounded-2xl mt-8">
          <h2 className="text-xl font-bold mt-0">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the JanVikas AI platform ("the Platform"), you agree to comply with and be bound by these Terms of Service. 
            If you do not agree with any part of these terms, you must not use the Platform.
          </p>

          <h2 className="text-xl font-bold mt-8">2. Description of Service</h2>
          <p>
            JanVikas AI is a GovTech SaaS platform designed to facilitate civic engagement between citizens and government officials. 
            The Platform uses AI to translate, deduplicate, and prioritize civic issues.
          </p>

          <h2 className="text-xl font-bold mt-8">3. User Conduct and Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You agree to provide accurate and truthful information when reporting civic issues.</li>
            <li>You agree not to submit false, malicious, or spam requests.</li>
            <li>You agree not to use the Platform for any illegal or unauthorized purpose.</li>
            <li>The Platform relies on AI; while we strive for accuracy, automated translations and categorizations may occasionally err.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8">4. Privacy and Data</h2>
          <p>
            Your use of the Platform is also governed by our Privacy Policy. By using the Platform, you consent to the collection and use of information as detailed therein.
          </p>

          <h2 className="text-xl font-bold mt-8">5. Limitation of Liability</h2>
          <p>
            JanVikas AI is a technological intermediary. We do not guarantee that any civic issue reported through the Platform will be resolved by the respective government authorities. 
            We are not liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the Platform.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;

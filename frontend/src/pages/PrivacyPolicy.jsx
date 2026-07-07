import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto prose prose-gray dark:prose-invert"
      >
        <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-8">Privacy Policy</h1>
        <p className="text-gray-500 font-medium">Last Updated: July 2026</p>
        
        <div className="glass-card p-8 rounded-2xl mt-8">
          <h2 className="text-xl font-bold mt-0">1. Information We Collect</h2>
          <p>We collect information to provide better services to all our users. The types of data we collect include:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, phone number, and location details (district/state).</li>
            <li><strong>Submission Data:</strong> Text, voice recordings, and images submitted as part of civic issues.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our Platform.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8">2. How We Use Your Information</h2>
          <p>The information we collect is used to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Facilitate the reporting and tracking of civic issues.</li>
            <li>Use AI/NLP models to translate, analyze, and deduplicate submissions.</li>
            <li>Provide officials with aggregated, anonymized demographic and geographic insights.</li>
            <li>Send you updates via SMS or email regarding your submissions.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8">3. AI Processing and Data Retention</h2>
          <p>
            Your voice and text submissions are processed by AI models to generate English/Hindi transcripts and summaries. 
            We do not use personally identifiable information (PII) to train public AI models. Data is securely retained on cloud servers located in India, 
            compliant with data protection regulations.
          </p>

          <h2 className="text-xl font-bold mt-8">4. Data Sharing</h2>
          <p>
            We share your civic submissions (which may include your name and location) with the relevant government officials assigned to your jurisdiction. 
            We do not sell your personal data to third-party marketers.
          </p>

          <h2 className="text-xl font-bold mt-8">5. Your Rights</h2>
          <p>
            You have the right to access, update, or request the deletion of your personal information. You can do so by contacting our support team or via your profile settings.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;

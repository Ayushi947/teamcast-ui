import React from 'react';
import { motion } from 'framer-motion';

interface CandidateRecommendationBannerProps {
  groundingInfo: string;
}

export const CandidateRecommendationBanner: React.FC<
  CandidateRecommendationBannerProps
> = ({ groundingInfo }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.5,
        ease: 'easeOut',
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="mb-8 w-full"
    >
      <motion.div
        initial={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
        animate={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="from-primary to-primary/80 rounded-xl bg-gradient-to-r px-6 py-8 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="ml-10 text-start"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mb-2 text-2xl font-semibold"
          >
            Top candidates for your role
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="text-base text-white/90"
          >
            {groundingInfo}
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

'use client';

import { motion } from 'framer-motion';

interface BooleanAnswerProps {
  value: string | null;
  onChange: (value: string) => void;
}

export const BooleanAnswer = ({ value, onChange }: BooleanAnswerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full space-x-4"
    >
      {['Yes', 'No'].map((option) => (
        <motion.button
          key={option}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(option)}
          className={`flex-1 rounded-xl border p-4 text-center transition-all duration-200 ${
            value === option
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-input bg-background text-foreground hover:border-primary hover:bg-accent'
          }`}
        >
          <div className="flex items-center justify-center">
            <div
              className={`mr-3 h-5 w-5 rounded-full border-2 transition-colors ${
                value === option
                  ? 'border-primary bg-primary'
                  : 'border-input bg-background'
              }`}
            >
              {value === option && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="bg-background h-2 w-2 rounded-full" />
                </div>
              )}
            </div>
            <span className="font-medium">{option}</span>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
};

'use client';

import { motion } from 'framer-motion';

interface MultipleChoiceAnswerProps {
  options: Record<string, string>;
  value: string | null;
  onChange: (value: string) => void;
}

export const MultipleChoiceAnswer = ({
  options,
  value,
  onChange,
}: MultipleChoiceAnswerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-3"
    >
      {Object.entries(options).map(([key, text]) => (
        <motion.button
          key={key}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(key)}
          className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
            value === key
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-input bg-background text-foreground hover:border-primary hover:bg-accent'
          }`}
        >
          <div className="flex items-center">
            <div
              className={`mr-3 h-5 w-5 rounded-full border-2 transition-colors ${
                value === key
                  ? 'border-primary bg-primary'
                  : 'border-input bg-background'
              }`}
            >
              {value === key && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="bg-background h-2 w-2 rounded-full" />
                </div>
              )}
            </div>
            <span className="text-foreground mr-2 font-medium">{key}.</span>
            <span className="text-foreground">{text}</span>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
};

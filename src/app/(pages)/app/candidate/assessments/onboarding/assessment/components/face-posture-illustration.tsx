'use client';

import { motion } from 'framer-motion';

export function FacePostureIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <svg
          width="280"
          height="360"
          viewBox="0 0 280 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Background circle */}
          <circle
            cx="140"
            cy="180"
            r="130"
            fill="url(#gradient1)"
            opacity="0.1"
          />

          {/* Neck */}
          <rect
            x="120"
            y="220"
            width="40"
            height="60"
            rx="8"
            fill="url(#skinGradient)"
            className="stroke-border"
            strokeWidth="2"
          />

          {/* Shoulders (slight) */}
          <path
            d="M 100 280 Q 100 260 120 250 L 160 250 Q 180 260 180 280"
            fill="url(#skinGradient)"
            stroke="var(--border)"
            strokeWidth="2"
          />

          {/* Face oval */}
          <ellipse
            cx="140"
            cy="160"
            rx="60"
            ry="70"
            fill="url(#skinGradient)"
            stroke="var(--border)"
            strokeWidth="2"
          />

          {/* Hair */}
          <path
            d="M 80 100 Q 80 80 100 90 Q 120 85 140 90 Q 160 85 180 90 Q 200 80 200 100 Q 200 120 180 130 Q 160 125 140 130 Q 120 125 100 130 Q 80 120 80 100 Z"
            fill="url(#hairGradient)"
            opacity="0.8"
          />

          {/* Eyes */}
          <ellipse cx="120" cy="150" rx="8" ry="6" fill="#1a1a1a" />
          <ellipse cx="160" cy="150" rx="8" ry="6" fill="#1a1a1a" />

          {/* Nose */}
          <path
            d="M 140 150 Q 135 165 140 175 Q 145 165 140 150"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />

          {/* Mouth */}
          <path
            d="M 125 185 Q 140 190 155 185"
            stroke="#1a1a1a"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Camera frame indicator */}
          <rect
            x="20"
            y="40"
            width="240"
            height="300"
            rx="12"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeDasharray="8 4"
            opacity="0.6"
          />

          {/* Checkmark overlay */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <circle
              cx="220"
              cy="80"
              r="20"
              fill="var(--primary)"
              opacity="0.9"
            />
            <path
              d="M 212 80 L 218 86 L 228 72"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </motion.g>

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
              <stop
                offset="100%"
                stopColor="var(--primary)"
                stopOpacity="0.05"
              />
            </linearGradient>
            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdbcb4" />
              <stop offset="100%" stopColor="#f4a5a0" />
            </linearGradient>
            <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2c2c2c" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </linearGradient>
          </defs>
        </svg>

        {/* Label */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <p className="text-text-primary text-sm font-medium">
            Face, Neck & Shoulders Visible
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';

interface AIAvatarProps {
  isSpeaking: boolean;
  audioLevel?: number;
  isAudioLevelMode?: boolean;
}

export function AIAvatar({
  isSpeaking,
  audioLevel = -1,
  isAudioLevelMode = false,
}: AIAvatarProps) {
  // Calculate scale intensity
  let baseScale, secondaryScale, avatarScale, iconScale, animationSpeed;

  const shouldAnimate = isAudioLevelMode ? audioLevel > 1 : isSpeaking;
  const shouldShowRings = isAudioLevelMode ? audioLevel > 1 : isSpeaking;

  if (!isAudioLevelMode) {
    // Default mode: fixed animation values when speaking
    baseScale = 0.15;
    secondaryScale = 0.1;
    avatarScale = 0.03;
    iconScale = 0.1;
    animationSpeed = 4;
  } else if (isAudioLevelMode) {
    // Audio level mode: scale based on audio level value (0-10 range)
    const audioLevelMultiplier = Math.min(1 + audioLevel / 10, 1); // Cap at 10
    baseScale = 0.15 * audioLevelMultiplier;
    secondaryScale = 0.1 * audioLevelMultiplier;
    avatarScale = 0.03 * audioLevelMultiplier;
    iconScale = 0.1 * audioLevelMultiplier;
    // Higher audio level = faster animation: audio level 0 = 4s, audio level 10 = 1s (slower range)
    animationSpeed = Math.max(1, 4 - (audioLevel / 10) * 3);
  } else {
    // No animation for invalid pitch values
    baseScale = 0;
    secondaryScale = 0;
    avatarScale = 0;
    iconScale = 0;
    animationSpeed = 1;
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative flex items-center justify-center"
    >
      {/* Main glow effect */}
      <motion.div
        animate={{
          scale: shouldAnimate ? [1, 1 + baseScale, 1] : 1,
          opacity: shouldAnimate ? [0.3, 0.4, 0.3] : 0.3,
        }}
        transition={{
          duration: animationSpeed,
          repeat: shouldAnimate ? Infinity : 0,
          ease: 'easeInOut',
          // Smooth transition when stopping animation
          ...(shouldAnimate ? {} : { duration: 0.8, ease: 'easeOut' }),
        }}
        className="bg-primary/20 absolute inset-[-80px] rounded-full blur-[80px]"
      />

      {/* Secondary glow */}
      <motion.div
        animate={{
          scale: shouldAnimate ? [1, 1 + secondaryScale, 1] : 1,
          opacity: shouldAnimate ? [0.4, 0.5, 0.4] : 0.4,
        }}
        transition={{
          duration: animationSpeed * 0.8,
          repeat: shouldAnimate ? Infinity : 0,
          ease: 'easeInOut',
          delay: shouldAnimate ? 0.3 : 0,
          // Smooth transition when stopping animation
          ...(shouldAnimate ? {} : { duration: 0.8, ease: 'easeOut' }),
        }}
        className="bg-primary/30 absolute inset-[-40px] rounded-full blur-[40px]"
      />

      {/* Avatar circle */}
      <motion.div
        animate={{
          scale: shouldAnimate ? [1, 1 + avatarScale, 1] : 1,
        }}
        transition={{
          duration: animationSpeed * 0.7,
          repeat: shouldAnimate ? Infinity : 0,
          ease: 'easeInOut',
          // Smooth transition when stopping animation
          ...(shouldAnimate ? {} : { duration: 0.6, ease: 'easeOut' }),
        }}
        className="bg-card relative flex h-32 w-32 items-center justify-center rounded-full shadow-lg"
      >
        <motion.span
          animate={{
            scale: shouldAnimate ? [1, 1 + iconScale, 1] : 1,
          }}
          transition={{
            duration: animationSpeed * 0.7,
            repeat: shouldAnimate ? Infinity : 0,
            ease: 'easeInOut',
            // Smooth transition when stopping animation
            ...(shouldAnimate ? {} : { duration: 0.6, ease: 'easeOut' }),
          }}
          className="text-primary text-2xl font-bold"
        >
          <Bot className="text-primary h-16 w-16" />
        </motion.span>
      </motion.div>

      {/* Pulse rings */}
      <AnimatePresence mode="wait">
        {shouldShowRings && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="border-primary/40 absolute inset-0 rounded-full border-1 shadow-lg"
                initial={{ scale: 1, opacity: 0 }}
                animate={{
                  scale: [1, 1.6 + baseScale * 2],
                  opacity: [0, 0.8, 0],
                }}
                exit={{
                  scale: 1,
                  opacity: 0,
                  transition: {
                    duration: 0.3,
                    delay: i * 0.1, // Staggered exit
                    ease: 'easeOut',
                  },
                }}
                transition={{
                  duration: animationSpeed * 0.7,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeOut',
                }}
                style={{
                  boxShadow: `0 0 ${20 + i * 10}px rgba(var(--primary), 0.3)`,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

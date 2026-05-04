import { motion } from 'framer-motion';
import { AIAvatar } from '@/components/app/common/animations/ai-avatar';

interface LoadingOverlayProps {
  isPolling: boolean;
  pollingMessage: string;
}

export const LoadingOverlay = ({
  isPolling,
  pollingMessage,
}: LoadingOverlayProps) => {
  if (!isPolling) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-card relative w-full max-w-xl rounded-2xl p-10 shadow-lg dark:bg-gray-800"
      >
        <div className="flex flex-col items-center">
          {/* AI Avatar */}
          <div className="mb-16 scale-125 pt-16">
            <AIAvatar isSpeaking={true} />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-foreground mb-4 text-xl font-semibold dark:text-white">
              Analyzing Your Profile
            </h3>
            <p className="text-md text-muted-foreground mb-8 dark:text-gray-300">
              {pollingMessage}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

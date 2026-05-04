import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  isLoading: boolean;
  loadingMessage: string;
}

export const LoadingOverlay = ({
  isLoading,
  loadingMessage,
}: LoadingOverlayProps) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="mx-4 max-w-md rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800"
          >
            <div className="text-center">
              <div className="mb-4">
                <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
              </div>
              <h3 className="mb-2 text-lg font-semibold dark:text-white">
                Processing...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loadingMessage}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

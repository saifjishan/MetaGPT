import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-dark z-50">
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: 'var(--primary-glow)',
            filter: 'blur(15px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: 'var(--secondary-glow)',
            filter: 'blur(15px)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="relative z-10 flex items-center justify-center w-32 h-32 bg-dark rounded-full glow-blue-strong"
          animate={{
            boxShadow: [
              '0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)',
              '0 0 15px rgba(59, 130, 246, 0.9), 0 0 30px rgba(59, 130, 246, 0.7), 0 0 45px rgba(59, 130, 246, 0.5)',
              '0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span className="text-3xl font-bold gradient-text">Meta</span>
          <span className="text-3xl font-bold text-white">GPT</span>
        </motion.div>
      </div>
      
      <motion.div
        className="mt-8 text-xl font-medium text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <span className="thinking-dots">Loading</span>
      </motion.div>
      
      <motion.div
        className="mt-4 text-sm text-gray-400 max-w-md text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Initializing multi-agent framework with Gemini and xAI integration
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
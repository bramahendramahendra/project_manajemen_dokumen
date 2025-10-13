import React from 'react';
import { motion } from 'framer-motion';

interface AlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}

const alertStyles = {
  info: {
    gradient: 'from-blue-50 via-blue-100 to-blue-50 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-blue-900/20',
    iconGradient: 'from-blue-500 to-blue-600',
    textTitle: 'text-blue-800 dark:text-blue-300',
    textMessage: 'text-blue-700 dark:text-blue-200',
    buttonGradient: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    patternColor: 'rgba(59, 130, 246, 0.1)',
    particleColor: 'bg-blue-400',
    closeHoverBg: 'hover:bg-blue-200 dark:hover:bg-blue-900/50',
    closeText: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    gradient: 'from-yellow-50 via-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:via-yellow-800/30 dark:to-yellow-900/20',
    iconGradient: 'from-yellow-500 to-yellow-600',
    textTitle: 'text-yellow-800 dark:text-yellow-300',
    textMessage: 'text-yellow-700 dark:text-yellow-200',
    buttonGradient: 'from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    patternColor: 'rgba(234, 179, 8, 0.1)',
    particleColor: 'bg-yellow-400',
    closeHoverBg: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
    closeText: 'text-yellow-600 dark:text-yellow-400',
  },
  error: {
    gradient: 'from-red-50 via-red-100 to-red-50 dark:from-red-900/20 dark:via-red-800/30 dark:to-red-900/20',
    iconGradient: 'from-red-500 to-red-600',
    textTitle: 'text-red-800 dark:text-red-300',
    textMessage: 'text-red-700 dark:text-red-200',
    buttonGradient: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    patternColor: 'rgba(239, 68, 68, 0.1)',
    particleColor: 'bg-red-400',
    closeHoverBg: 'hover:bg-red-200 dark:hover:bg-red-900/50',
    closeText: 'text-red-600 dark:text-red-400',
  },
  success: {
    gradient: 'from-green-50 via-green-100 to-green-50 dark:from-green-900/20 dark:via-green-800/30 dark:to-green-900/20',
    iconGradient: 'from-green-500 to-green-600',
    textTitle: 'text-green-800 dark:text-green-300',
    textMessage: 'text-green-700 dark:text-green-200',
    buttonGradient: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    patternColor: 'rgba(34, 197, 94, 0.1)',
    particleColor: 'bg-green-400',
    closeHoverBg: 'hover:bg-green-200 dark:hover:bg-green-900/50',
    closeText: 'text-green-600 dark:text-green-400',
  },
};

const AlertIcon = ({ type }: { type: AlertProps['type'] }) => {
  const icons = {
    info: (
      <motion.path 
        fillRule="evenodd" 
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
        clipRule="evenodd"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
    ),
    warning: (
      <motion.path 
        fillRule="evenodd" 
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
        clipRule="evenodd"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
    ),
    error: (
      <motion.path 
        fillRule="evenodd" 
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
        clipRule="evenodd"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
    ),
    success: (
      <motion.path 
        fillRule="evenodd" 
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
        clipRule="evenodd"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
    ),
  };

  return (
    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
      {icons[type]}
    </svg>
  );
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onRetry,
  onClose,
  className = '',
}) => {
  const styles = alertStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br ${styles.gradient} ${className}`}
      style={{
        boxShadow: `0 10px 40px -10px ${styles.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${styles.patternColor} 10px, ${styles.patternColor} 20px)`,
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Glowing Border Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          boxShadow: `inset 0 0 20px ${styles.glowColor}`,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 p-5">
        <div className="flex items-start gap-4">
          {/* 3D Animated Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="flex-shrink-0"
          >
            <div className="relative">
              {/* Pulsing Circles Behind Icon */}
              <motion.div
                className={`absolute inset-0 rounded-full ${styles.particleColor}`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className={`absolute inset-0 rounded-full ${styles.particleColor}`}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />

              {/* Main Icon Circle with 3D Effect */}
              <motion.div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${styles.iconGradient}`}
                style={{
                  boxShadow: `0 4px 12px ${styles.glowColor}, inset 0 -1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 4px rgba(255, 255, 255, 0.3)`,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <AlertIcon type={type} />

                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent"
                  animate={{
                    opacity: [0, 0.5, 0],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Message Content */}
          <div className="flex-1 min-w-0 pt-1">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title && (
                <h3 className={`text-base font-bold ${styles.textTitle} mb-1`}>
                  {title}
                </h3>
              )}
              <p className={`text-sm ${styles.textMessage} leading-relaxed`}>
                {message}
              </p>
            </motion.div>

            {/* Retry Button (if provided) */}
            {onRetry && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={onRetry}
                className={`mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${styles.buttonGradient} px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95`}
                style={{
                  boxShadow: `0 4px 12px ${styles.glowColor}`,
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Coba Lagi
              </motion.button>
            )}
          </div>

          {/* Close Button */}
          {onClose && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={onClose}
              className={`flex-shrink-0 rounded-full p-1.5 ${styles.closeText} transition-all ${styles.closeHoverBg} active:scale-90`}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Tutup"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          )}
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent ${styles.textTitle}`}
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          filter: 'blur(4px)',
        }}
      />

      {/* Floating Particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute h-1 w-1 rounded-full ${styles.particleColor}`}
          style={{
            left: `${20 + i * 15}%`,
            top: '50%',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
};

// Loading Alert Component dengan 3D Effect
interface LoadingAlertProps {
  message?: string;
  onClose?: () => void;
}

export const LoadingAlert: React.FC<LoadingAlertProps> = ({ 
  message = 'Memuat data...',
  onClose
}) => {
  const styles = alertStyles.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br ${styles.gradient}`}
      style={{
        boxShadow: `0 10px 40px -10px ${styles.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${styles.patternColor} 10px, ${styles.patternColor} 20px)`,
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Glowing Border Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          boxShadow: `inset 0 0 20px ${styles.glowColor}`,
        }}
      />

      <div className="relative z-10 p-5">
        <div className="flex items-center gap-4">
          {/* 3D Spinner */}
          <div className="relative flex-shrink-0">
            <motion.div
              className={`h-12 w-12 rounded-full bg-gradient-to-br ${styles.iconGradient}`}
              style={{
                boxShadow: `0 8px 16px ${styles.glowColor}, inset 0 -2px 8px rgba(0, 0, 0, 0.2), inset 0 2px 8px rgba(255, 255, 255, 0.3)`,
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <motion.div
                className="absolute inset-2 rounded-full border-4 border-transparent border-t-white"
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>

            {/* Orbiting Particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-white"
                style={{
                  marginLeft: '-4px',
                  marginTop: '-4px',
                }}
                animate={{
                  x: [0, 30 * Math.cos((i * 2 * Math.PI) / 3), 0],
                  y: [0, 30 * Math.sin((i * 2 * Math.PI) / 3), 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`flex-1 text-sm font-semibold ${styles.textTitle}`}
          >
            {message}
          </motion.p>

          {/* Close Button */}
          {onClose && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={onClose}
              className={`flex-shrink-0 rounded-full p-1.5 ${styles.closeText} transition-all ${styles.closeHoverBg} active:scale-90`}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Tutup"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          )}
        </div>
      </div>

      {/* Floating Particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute h-1 w-1 rounded-full ${styles.particleColor}`}
          style={{
            left: `${20 + i * 15}%`,
            top: '50%',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
};
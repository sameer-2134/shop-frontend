import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingBag, CheckCircle2 } from 'lucide-react';

const WelcomeModal = ({ show, name }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="welcome-overlay"
        >
          <motion.div 
            initial={{ scale: 0.5, y: 100, rotateX: 45 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="welcome-card-3d"
          >
            <div className="confetti-icon">
              <Sparkles className="sparkle-icon" />
            </div>
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="success-ring"
            >
              <CheckCircle2 size={80} color="#00ffcc" strokeWidth={1} />
            </motion.div>

            <h2>Welcome to the Elite, <br/><span>{name}</span></h2>
            <p>Your portal to premium shopping is now active.</p>
            
            <div className="loading-bar-container">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
                className="loading-bar-fill"
              />
            </div>
            <span className="redirect-text">Teleporting to Gallery...</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
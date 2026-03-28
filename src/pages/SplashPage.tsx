import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GhanaLogo from '@/components/GhanaLogo';

export default function SplashPage() {
 const navigate = useNavigate();

 return (
 <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg">
 <motion.div
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
 className="relative z-10 flex flex-col items-center gap-6"
 >
 <GhanaLogo size={120} showText={false} />

 <motion.h1
 className="font-display font-extrabold text-5xl md:text-7xl tracking-wider text-foreground"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.6 }}
 >
 GHANA
 </motion.h1>

 <motion.p
 className="text-foreground-secondary text-lg font-body tracking-wide"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.9 }}
 >
 Intelligent Cloud. Zero Waste.
 </motion.p>

 <motion.button
 onClick={() => navigate('/login')}
 className="mt-8 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider border border-primary-bright/30 relative overflow-hidden transition-transform hover:scale-105 active:scale-95"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 1.2 }}
 whileHover={{ boxShadow: '0 0 30px hsl(0 100% 25% / 0.4)' }}
 >
 Enter Platform
 </motion.button>
 </motion.div>
 </div>
 );
}

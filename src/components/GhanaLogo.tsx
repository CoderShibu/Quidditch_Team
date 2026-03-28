import { motion } from 'framer-motion';

interface Props {
 size?: number;
 showText?: boolean;
 className?: string;
}

export default function GhanaLogo({ size = 80, showText = true, className = '' }: Props) {
 return (
 <div className={`flex items-center gap-3 ${className}`}>
 <motion.div
 className="relative flex items-center justify-center rounded-full"
 style={{ width: size, height: size }}
 whileHover={{ scale: 1.05 }}
 >
 {/* Glowing ring */}
 <div
 className="absolute inset-0 rounded-full glow-pulse"
 style={{ border: '2px solid hsl(var(--primary))' }}
 />
 <div
 className="absolute inset-1 rounded-full"
 style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.15), transparent)' }}
 />
 <span
 className="font-display font-extrabold text-primary-hot"
 style={{ fontSize: size * 0.45 }}
 >
 G
 </span>
 </motion.div>
 {showText && (
 <span className="font-display font-extrabold text-foreground tracking-wider"style={{ fontSize: size * 0.35 }}>
 GHANA
 </span>
 )}
 </div>
 );
}

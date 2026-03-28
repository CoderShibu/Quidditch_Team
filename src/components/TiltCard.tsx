import { useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
 children: ReactNode;
 className?: string;
 glowColor?: string;
}

export default function TiltCard({ children, className = '', glowColor }: TiltCardProps) {
 const ref = useRef<HTMLDivElement>(null);
 const [style, setStyle] = useState({ rotateX: 0, rotateY: 0 });

 const handleMouse = (e: React.MouseEvent) => {
 const el = ref.current;
 if (!el) return;
 const rect = el.getBoundingClientRect();
 const x = e.clientX - rect.left;
 const y = e.clientY - rect.top;
 const centerX = rect.width / 2;
 const centerY = rect.height / 2;
 setStyle({
 rotateY: ((x - centerX) / centerX) * 8,
 rotateX: ((centerY - y) / centerY) * 8,
 });
 };

 const handleLeave = () => setStyle({ rotateX: 0, rotateY: 0 });

 return (
 <motion.div
 ref={ref}
 onMouseMove={handleMouse}
 onMouseLeave={handleLeave}
 animate={style}
 transition={{ type: 'spring', stiffness: 300, damping: 20 }}
 style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
 className={`relative group ${className}`}
 >
 <div className={`absolute -inset-[1px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm ${glowColor || 'bg-primary-glow'}`} />
 <div className="relative glass rounded-lg p-6 h-full">
 {children}
 </div>
 </motion.div>
 );
}

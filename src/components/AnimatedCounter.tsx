import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Props {
 value: number;
 prefix?: string;
 suffix?: string;
 decimals?: number;
 duration?: number;
 className?: string;
}

export default function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, duration = 1.5, className = '' }: Props) {
 const ref = useRef(null);
 const inView = useInView(ref, { once: true });
 const [display, setDisplay] = useState(0);

 useEffect(() => {
 if (!inView) return;
 const start = performance.now();
 const animate = (now: number) => {
 const elapsed = (now - start) / 1000;
 const progress = Math.min(elapsed / duration, 1);
 const eased = 1 - Math.pow(1 - progress, 3);
 setDisplay(eased * value);
 if (progress < 1) requestAnimationFrame(animate);
 };
 requestAnimationFrame(animate);
 }, [inView, value, duration]);

 return (
 <motion.span
 ref={ref}
 className={`font-mono ${className}`}
 initial={{ opacity: 0, y: 20 }}
 animate={inView ? { opacity: 1, y: 0 } : {}}
 transition={{ duration: 0.5 }}
 >
 {prefix}{display.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}
 </motion.span>
 );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Zap } from 'lucide-react';

const aiMessages = [
 { role: 'ai' as const, text: "I detected 3 idle EC2 instances costing $47/day. Shall I stop them?", confidence: 94 },
 { role: 'ai' as const, text: "Lambda function 'process-orders' has runaway concurrency. I can reduce the limit from 800 to 100, saving ~$43/day.", confidence: 87 },
 { role: 'ai' as const, text: "Your S3 bucket 'data-exports' would save $7.20/day with Glacier lifecycle policies.", confidence: 91 },
];

export default function OptimizeAIButton() {
 const [open, setOpen] = useState(false);
 const [selectedMsg, setSelectedMsg] = useState(0);
 const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});

 return (
 <>
 <motion.button
 onClick={() => setOpen(true)}
 className="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-hot flex items-center justify-center shadow-lg glow-pulse"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 >
 <Bot size={24} className="text-foreground"/>
 </motion.button>

 <AnimatePresence>
 {open && (
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 20 }}
 className="fixed bottom-36 md:bottom-24 right-6 z-50 w-80 sm:w-96 glass rounded-xl shadow-2xl overflow-hidden border border-border"
 >
 <div className="flex items-center justify-between p-4 border-b border-border">
 <div className="flex items-center gap-2">
 <Bot size={20} className="text-primary-hot"/>
 <span className="font-display font-bold text-sm">OptimizeAI</span>
 </div>
 <button onClick={() => setOpen(false)} className="text-foreground-muted hover:text-foreground">
 <X size={18} />
 </button>
 </div>

 <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
 {aiMessages.map((msg, i) => (
 <div key={i} className="space-y-2">
 <div className="bg-muted rounded-lg p-3 text-sm text-foreground-secondary">
 {msg.text}
 </div>
 <div className="flex items-center gap-2">
 <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
 <div
 className="h-full bg-primary-hot rounded-full transition-all"
 style={{ width: `${msg.confidence}%` }}
 />
 </div>
 <span className="text-xs font-mono text-foreground-muted">{msg.confidence}%</span>
 </div>
 {!confirmed[i] ? (
 <button
 onClick={() => setConfirmed({ ...confirmed, [i]: true })}
 className="flex items-center gap-1 text-xs font-body px-3 py-1.5 rounded-md bg-primary/20 text-primary-hot hover:bg-primary/30 transition-colors"
 >
 <Zap size={12} />
 Apply Optimization
 </button>
 ) : (
 <span className="text-xs text-success font-mono">✓ Optimization applied</span>
 )}
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { optimizations } from '@/data/mockData';
import { History, FileText, ArrowDown } from 'lucide-react';

const statusColors: Record<string, string> = {
 completed: 'bg-success/20 text-success border-[#10b981]/30',
 'in-progress': 'bg-warning/20 text-warning border-[#f59e0b]/30',
 failed: 'bg-destructive/20 text-destructive border-[#ef4444]/30',
};

const fade = {
 hidden: { opacity: 0 },
 show: { opacity: 1, transition: { duration: 0.25, ease: "easeOut"} }
};

export default function OptimizationHistoryPage() {
 const [serviceFilter, setServiceFilter] = useState('');
 const services = [...new Set(optimizations.map(o => o.service))];
 const filtered = optimizations.filter(o => !serviceFilter || o.service === serviceFilter);

 const totalSaved = optimizations.reduce((s, o) => s + o.totalSavings, 0);
 const avgSavings = totalSaved / optimizations.length;

 return (
 <motion.div initial="hidden"animate="show"variants={fade} className="space-y-6 pb-8">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <h2 className="font-display font-bold text-lg flex items-center gap-2 text-foreground">
 <History size={20} className="text-primary-hot"/> Optimization History
 </h2>
 <div className="flex gap-2">
 <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="border border-border rounded px-3 py-1.5 text-xs font-body text-foreground outline-none">
 <option value="">All Services</option>
 {services.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 <button className="flex items-center gap-1 px-4 py-1.5 rounded bg-primary text-primary-foreground text-foreground font-bold text-xs hover:bg-primary/80 transition-colors shadow-[0_0_10px_rgba(153,51,51,0.3)]">
 <FileText size={14} /> AI Report
 </button>
 </div>
 </div>

 {/* Summary stats */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[
 { label: 'Total Optimizations', value: optimizations.length.toString() },
 { label: 'Total Saved', value: `$${totalSaved.toLocaleString()}` },
 { label: 'Avg Savings/Action', value: `$${avgSavings.toFixed(0)}` },
 ].map(s => (
 <div key={s.label} className="glass rounded-xl p-5 text-center border border-border shadow-md">
 <p className="text-foreground-muted text-xs font-body uppercase font-bold tracking-wider">{s.label}</p>
 <p className="text-2xl font-mono font-bold text-foreground mt-2">{s.value}</p>
 </div>
 ))}
 </div>

 {/* Timeline */}
 <div className="relative mt-8">
 <div className="absolute left-6 top-0 bottom-0 w-px bg-[#460000]"/>
 <div className="space-y-6 pl-14">
 {filtered.map((o, i) => (
 <div key={o.id} className="glass rounded-xl p-5 relative border border-border shadow-md hover:border-primary/50 transition-colors">
 <div className="absolute -left-[37px] top-6 w-4 h-4 rounded-full border-[3px] border-primary shadow-[0_0_10px_#993333]"/>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <span className="font-display font-bold text-foreground">{o.action}</span>
 <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border ${statusColors[o.status]}`}>{o.status}</span>
 </div>
 <div className="flex flex-wrap gap-4 text-xs font-mono bg-background p-2 inline-flex rounded border border-border/50">
 <span className="text-foreground-muted font-body">{o.date}</span>
 <span className="text-[#460000]">|</span>
 <span className="text-foreground">{o.service}</span>
 <span className="text-[#460000]">|</span>
 <span className="text-foreground">{o.resourceId}</span>
 </div>
 </div>
 <div className="flex items-center gap-6 text-sm bg-background px-4 py-3 rounded-lg border border-border/50">
 <div className="text-center">
 <p className="text-[10px] text-foreground-muted uppercase font-bold tracking-wider mb-1">Before</p>
 <p className="font-mono text-foreground">${o.costBefore}/day</p>
 </div>
 <ArrowDown size={16} className="text-success animate-bounce"/>
 <div className="text-center">
 <p className="text-[10px] text-foreground-muted uppercase font-bold tracking-wider mb-1">After</p>
 <p className="font-mono text-success">${o.costAfter}/day</p>
 </div>
 <div className="text-center border-l border-border pl-6 ml-2">
 <p className="text-[10px] text-foreground-muted uppercase font-bold tracking-wider mb-1">Saved</p>
 <p className="font-mono font-bold text-success">${o.totalSavings}</p>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </motion.div>
 );
}

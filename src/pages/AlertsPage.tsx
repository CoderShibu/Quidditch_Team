import { useState } from 'react';
import { motion } from 'framer-motion';
import { alerts } from '@/data/mockData';
import { Bell, Check, Clock, AlertTriangle, X, Settings2, Save } from 'lucide-react';
import { toast } from 'sonner';

const fade = {
 hidden: { opacity: 0 },
 show: { opacity: 1, transition: { duration: 0.25, ease: "easeOut"} }
};

const severityColors: Record<string, string> = {
 critical: 'bg-red-900/40 text-red-400 border-red-600/30',
 high: 'bg-orange-900/40 text-orange-400 border-orange-600/30',
 medium: 'bg-yellow-900/40 text-yellow-400 border-yellow-600/30',
 low: 'bg-blue-900/40 text-blue-400 border-blue-600/30',
};

export default function AlertsPage() {
 const [data, setData] = useState(alerts);
 const [sevFilter, setSevFilter] = useState('');
 const [page, setPage] = useState(0);
 const perPage = 6;

 const filtered = data.filter(a => !sevFilter || a.severity === sevFilter);
 const paged = filtered.slice(page * perPage, (page + 1) * perPage);
 const totalPages = Math.ceil(filtered.length / perPage);

 const resolve = (id: string) => {
 setData(d => d.map(a => a.id === id ? { ...a, resolved: true, actionTaken: 'Resolved manually' } : a));
 toast.success('Alert resolved');
 };

 const snooze = (id: string) => {
 setData(d => d.map(a => a.id === id ? { ...a, snoozed: true } : a));
 toast('Alert snoozed for 1 hour');
 };

 return (
 <motion.div initial="hidden"animate="show"variants={fade} className="space-y-6 pb-8">
 {/* Alert Summary Bar */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="border border-border rounded-xl p-4 flex items-center justify-between shadow-inner">
 <span className="text-xs text-foreground-muted uppercase font-bold tracking-wider">Total Alerts</span>
 <span className="text-2xl font-mono text-foreground font-bold">7</span>
 </div>
 <div className="border border-[#ef4444]/40 rounded-xl p-4 flex items-center justify-between shadow-[inset_0_0_15px_rgba(239,68,68,0.1)] relative overflow-hidden">
 <div className="absolute inset-x-0 bottom-0 h-8 bg-destructive/10 blur-xl"></div>
 <span className="text-xs text-destructive uppercase font-bold tracking-wider relative z-10">Critical</span>
 <span className="text-2xl font-mono text-destructive font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] relative z-10">2</span>
 </div>
 <div className="border border-[#10b981]/40 rounded-xl p-4 flex items-center justify-between shadow-inner">
 <span className="text-xs text-success uppercase font-bold tracking-wider">Resolved Today</span>
 <span className="text-2xl font-mono text-success font-bold">3</span>
 </div>
 <div className="border border-[#f59e0b]/40 rounded-xl p-4 flex items-center justify-between shadow-inner">
 <span className="text-xs text-warning uppercase font-bold tracking-wider">Snoozed</span>
 <span className="text-2xl font-mono text-warning font-bold">1</span>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
 <h2 className="font-display font-bold text-lg flex items-center gap-2 text-foreground">
 <Bell size={20} className="text-primary-hot"/> Alert Center
 </h2>
 <div className="flex gap-2">
 <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="border border-border rounded px-3 py-1.5 text-xs font-body text-foreground outline-none focus:border-primary">
 <option value="">All Severity</option>
 {['critical','high','medium','low'].map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 </div>

 {/* Table */}
 <div className="border border-border rounded-xl overflow-x-auto shadow-lg">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-foreground-muted text-xs font-body bg-background/50">
 <th className="text-left p-4">Time</th>
 <th className="text-left p-4">Resource</th>
 <th className="text-left p-4">Region</th>
 <th className="text-left p-4">Type</th>
 <th className="text-left p-4">Severity</th>
 <th className="text-right p-4">Impact</th>
 <th className="text-left p-4">Action</th>
 <th className="text-right p-4">Options</th>
 </tr>
 </thead>
 <tbody>
 {paged.map((a, idx) => (
 <tr key={a.id} className={`border-b border-border/50 hover:bg-primary text-primary-foreground/10 transition-colors ${a.resolved ? 'opacity-40' : ''} ${idx === paged.length - 1 ? 'border-0' : ''}`}>
 <td className="p-4 font-mono text-xs text-foreground">{new Date(a.timestamp).toLocaleString()}</td>
 <td className="p-4 font-mono text-xs text-foreground-muted">{a.resourceId}</td>
 <td className="p-4 text-xs text-foreground">{a.region}</td>
 <td className="p-4 text-xs text-foreground">{a.type}</td>
 <td className="p-4"><span className={`text-[10px] px-2.5 py-1 rounded border uppercase font-bold tracking-wide ${severityColors[a.severity]}`}>{a.severity}</span></td>
 <td className="p-4 text-right font-mono text-xs text-primary-hot font-bold">${a.costImpact}/day</td>
 <td className="p-4 text-xs text-foreground-muted">{a.actionTaken}</td>
 <td className="p-4 text-right">
 {!a.resolved && (
 <div className="flex gap-2 justify-end">
 <button onClick={() => resolve(a.id)} className="p-1.5 rounded hover:bg-success/20 text-success transition-colors"title="Resolve">
 <Check size={16} />
 </button>
 <button onClick={() => snooze(a.id)} className="p-1.5 rounded hover:bg-muted text-foreground-muted transition-colors"title="Snooze">
 <Clock size={16} />
 </button>
 </div>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {totalPages > 1 && (
 <div className="flex justify-center gap-1 mt-4">
 {Array.from({ length: totalPages }, (_, i) => (
 <button
 key={i}
 onClick={() => setPage(i)}
 className={`w-8 h-8 rounded text-xs font-mono transition-colors border ${page === i ? 'bg-primary text-primary-foreground border-primary text-foreground' : 'border-border text-foreground-muted hover:'}`}
 >
 {i + 1}
 </button>
 ))}
 </div>
 )}

 {/* Notification Settings & Modal Preview Section */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
 
 {/* Notification Settings */}
 <div className="border border-border rounded-xl p-6 shadow-lg">
 <div className="flex items-center gap-2 mb-6">
 <Settings2 size={18} className="text-primary-hot"/>
 <h3 className="font-display font-bold text-sm text-foreground">Notification Settings</h3>
 </div>
 <div className="flex flex-col md:flex-row gap-8">
 <div className="flex-1 space-y-4">
 <label className="flex items-center justify-between cursor-pointer group">
 <span className="text-sm text-foreground-muted font-medium">Email Alerts</span>
 <div className="relative w-10 h-5 bg-primary text-primary-foreground rounded-full shadow-[0_0_8px_rgba(153,51,51,0.4)]">
 <div className="absolute right-1 top-1 bg-white w-3 h-3 rounded-full"></div>
 </div>
 </label>
 <label className="flex items-center justify-between cursor-pointer group">
 <span className="text-sm text-foreground-muted font-medium">In-App Alerts</span>
 <div className="relative w-10 h-5 bg-primary text-primary-foreground rounded-full shadow-[0_0_8px_rgba(153,51,51,0.4)]">
 <div className="absolute right-1 top-1 bg-white w-3 h-3 rounded-full"></div>
 </div>
 </label>
 <label className="flex items-center justify-between cursor-pointer group">
 <span className="text-sm text-foreground-muted font-medium">SMS Alerts</span>
 <div className="relative w-10 h-5 bg-[#460000] rounded-full">
 <div className="absolute left-1 top-1 bg-[#800000] w-3 h-3 rounded-full"></div>
 </div>
 </label>
 </div>
 
 <div className="hidden md:block w-px bg-[#460000]"></div>
 
 <div className="flex-1 space-y-4">
 <div>
 <label className="block text-xs text-foreground-muted mb-1 font-medium">Warn after idle time</label>
 <div className="flex items-center gap-2">
 <input type="number"defaultValue={2} className="w-16 bg-background border border-border rounded px-2 py-1 text-sm text-foreground text-center font-mono outline-none focus:border-primary"/>
 <span className="text-sm text-foreground-muted">hours</span>
 </div>
 </div>
 <div>
 <label className="block text-xs text-foreground-muted mb-1 font-medium">Cost limit</label>
 <div className="flex items-center gap-2">
 <span className="text-sm text-foreground-muted">$</span>
 <input type="number"defaultValue={500} className="w-20 bg-background border border-border rounded px-2 py-1 text-sm text-foreground text-center font-mono outline-none focus:border-primary"/>
 <span className="text-sm text-foreground-muted">/day</span>
 </div>
 </div>
 <button onClick={() => toast.success('Settings saved successfully')} className="mt-4 flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground hover:bg-primary/80 text-foreground py-2 rounded text-xs font-bold font-display transition-colors active:scale-95 shadow-[0_0_10px_rgba(153,51,51,0.2)]">
 <Save size={14} /> Save Settings
 </button>
 </div>
 </div>
 </div>

 {/* Mock Modal Preview */}
 <div className="border border-border rounded-xl p-6 shadow-lg relative overflow-hidden">
 <div className="absolute top-0 right-0 bg-primary text-primary-foreground/20 text-primary-hot text-[10px] font-bold px-3 py-1 rounded-bl-lg border-b border-l border-primary/30 tracking-wider">
 PREVIEW
 </div>
 <div className="flex items-center gap-2 mb-2">
 <AlertTriangle size={18} className="text-primary-hot"/>
 <h3 className="font-display font-bold text-sm text-foreground">Smart Warning System</h3>
 </div>
 <p className="text-xs text-foreground-muted mb-5 tracking-wide">Triggers automatically when established limit is exceeded.</p>
 
 <div className="bg-background border border-[#ef4444]/40 rounded-lg p-5 shadow-[0_0_15px_rgba(239,68,68,0.1)] mt-2">
 <div className="flex items-center gap-2 mb-3">
 <Bell size={18} className="text-destructive animate-pulse"/>
 <span className="font-display font-bold text-base text-foreground">Cost Limit Exceeded</span>
 </div>
 <p className="text-sm text-foreground-muted leading-relaxed mb-4">
 ⚠️ You are exceeding your cost limit of <strong>$500/day</strong><br/>
 Current spend: <span className="text-destructive font-mono font-bold">$623/day</span><br/><br/>
 Do you want to continue?
 </p>
 <div className="flex gap-2 justify-end mt-2">
 <button className="px-3 py-1.5 rounded bg-muted text-foreground-muted text-xs hover: transition-colors border border-transparent hover:border-border">
 No, Stop & Alert
 </button>
 <button className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-white text-xs font-bold shadow-[0_0_10px_rgba(153,51,51,0.3)]">
 Yes, Continue
 </button>
 </div>
 </div>
 </div>
 </div>

 </motion.div>
 );
}

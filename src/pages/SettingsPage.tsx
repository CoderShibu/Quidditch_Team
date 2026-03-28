import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
 Settings, User, Cloud, CreditCard, ShieldCheck, Key, AlertTriangle, 
 Trash2, Plus, Copy, CheckCircle2, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const fade = {
 hidden: { opacity: 0 },
 show: { opacity: 1, transition: { duration: 0.25, ease: "easeOut"} }
};

export default function SettingsPage() {
 const [copiedKey, setCopiedKey] = useState(false);
 const [apiKey] = useState('ghana_live_9f8e7d6c5b4a3x2y1z');

 const copyKey = () => {
 navigator.clipboard.writeText(apiKey);
 setCopiedKey(true);
 toast.success('API Key copied to clipboard');
 setTimeout(() => setCopiedKey(false), 2000);
 };

 const inputClass = "w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-primary transition-colors shadow-inner placeholder:text-[#460000]";
 const labelClass = "text-xs font-bold font-body text-foreground-muted uppercase tracking-wider block mb-1.5";
 const sectionClass = "glass rounded-xl p-6 md:p-8 border border-border shadow-lg relative overflow-hidden";
 const sectionHeaderClass = "font-display font-bold text-lg text-foreground flex items-center gap-2 mb-6";

 return (
 <motion.div initial="hidden"animate="show"variants={fade} className="relative min-h-[calc(100vh-140px)] w-full">
 <div className="max-w-[720px] mx-auto pb-32 space-y-8 pt-2">
 <div className="flex items-center gap-3 mb-2">
 <Settings size={28} className="text-primary-hot"/>
 <h2 className="font-display font-bold text-2xl text-foreground">Platform Settings</h2>
 </div>

 {/* 1. Profile Details */}
 <div className={sectionClass}>
 <h3 className={sectionHeaderClass}><User size={20} className="text-primary-hot"/> Profile Details</h3>
 <div className="space-y-5">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div>
 <label className={labelClass}>Full Name</label>
 <input className={inputClass} defaultValue="Quidditch User"/>
 </div>
 <div>
 <label className={labelClass}>Email Address</label>
 <input className={inputClass} defaultValue="team@ghana.cloud"type="email"/>
 </div>
 </div>
 <div>
 <label className={labelClass}>Company / Organization</label>
 <input className={inputClass} defaultValue="AWS Solutions Inc."/>
 </div>
 <div className="pt-2">
 <label className="flex items-center gap-3 cursor-pointer group">
 <div className="relative w-12 h-6 bg-primary text-primary-foreground rounded-full shadow-[0_0_8px_rgba(153,51,51,0.4)]">
 <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full transition-all"></div>
 </div>
 <div>
 <span className="text-sm text-foreground font-bold block">Two-Factor Authentication</span>
 <span className="text-xs text-foreground-muted">Secure your account with 2FA</span>
 </div>
 </label>
 </div>
 </div>
 </div>

        {/* 2. Cloud Connections */}
        <div className={sectionClass}>
          <h3 className={sectionHeaderClass}><Cloud size={20} className="text-primary-hot"/> Cloud Connections</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-lg bg-[#0a0000] border border-[#460000]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#ff9900]/10 flex items-center justify-center border border-[#ff9900]/30 shrink-0">
                  <span className="font-bold text-[#ff9900] text-sm">AWS</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#f2e6e6] mb-1">Production Environment</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-foreground-muted">
                    <span>Region: <span className="text-[#c58a8a]">us-east-1</span></span>
                    <span className="hidden sm:inline text-[#460000]">•</span>
                    <span>Account ID: <span className="text-[#c58a8a]">**** 9821</span></span>
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center gap-2 px-3 py-1.5 rounded bg-success/10 border border-[#10b981]/20 self-start sm:self-center">
                <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                <span className="text-success text-xs font-bold uppercase tracking-wide">Connected</span>
              </div>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#460000] rounded-lg text-foreground-muted hover:bg-[#1a0000] hover:text-[#f2e6e6] hover:border-[#993333] transition-colors text-sm font-bold border-[2px]">
              <Plus size={16} /> Add Cloud Provider
            </button>
          </div>
        </div>

 {/* 3. Billing & Plans */}
 <div className={sectionClass}>
 <div className="absolute top-0 right-0 bg-primary text-primary-foreground/20 text-primary-hot text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg border-b border-l border-primary/30 tracking-wider">
 Current Plan
 </div>
 <h3 className={sectionHeaderClass}><CreditCard size={20} className="text-primary-hot"/> Billing & Plans</h3>
 <div className="bg-background border border-primary/50 p-5 rounded-lg shadow-[0_0_15px_rgba(153,51,51,0.1)]">
 <div className="flex justify-between items-start mb-4">
 <div>
 <h4 className="font-bold text-lg text-foreground">Enterprise Guardian</h4>
 <p className="text-xs text-foreground-muted">Up to $50k/mo managed spend</p>
 </div>
 <span className="text-2xl font-mono text-foreground font-bold">$299<span className="text-sm text-foreground-muted font-body">/mo</span></span>
 </div>
 <div className="space-y-2 mb-5">
 {['Live AI Cost Intelligence', 'Unlimited Automated Interventions', 'Custom Compliance Rules'].map((feat, i) => (
 <div key={i} className="flex items-center gap-2 text-sm text-foreground-muted">
 <CheckCircle2 size={14} className="text-success"/> {feat}
 </div>
 ))}
 </div>
 <div className="flex gap-3">
 <button className="flex-1 py-2 border border-border text-foreground rounded text-sm font-bold hover:bg-background transition-colors">Manage Billing</button>
 <button className="flex-1 py-2 bg-primary text-primary-foreground text-foreground rounded text-sm font-bold shadow-[0_0_10px_rgba(153,51,51,0.3)] hover:bg-primary/80 transition-colors">Upgrade Plan</button>
 </div>
 </div>
 </div>

 {/* 4. Compliance Checks */}
 <div className={sectionClass}>
 <h3 className={sectionHeaderClass}><ShieldCheck size={20} className="text-primary-hot"/> Compliance Checks</h3>
 <div className="space-y-3">
 {[
 { name: 'SOC 2 Type II Auditing', desc: 'Scan infrastructure for SOC 2 violations', active: true },
 { name: 'HIPAA Data Protection', desc: 'Ensure endpoints and storage meet HIPAA standards', active: false },
 { name: 'GDPR Privacy Engine', desc: 'Enforce European data residence policies', active: true },
 ].map((check, i) => (
 <div key={i} className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer hover:bg-primary text-primary-foreground/5 ${check.active ? 'bg-primary text-primary-foreground/10 border-primary/30' : 'bg-background border-border'}`}>
 <div>
 <h4 className="font-bold text-sm text-foreground">{check.name}</h4>
 <p className="text-xs text-foreground-muted mt-1">{check.desc}</p>
 </div>
 <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${check.active ? 'bg-primary text-primary-foreground border-primary' : 'border-border '}`}>
 {check.active && <CheckCircle2 size={12} className="text-white"/>}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* 5. API Keys */}
 <div className={sectionClass}>
 <h3 className={sectionHeaderClass}><Key size={20} className="text-primary-hot"/> API Keys</h3>
 <p className="text-sm text-foreground-muted mb-4">Integrate Ghana AI directly into your CI/CD pipelines.</p>
 <div className="space-y-3">
 <div>
 <label className={labelClass}>Production Secret Key</label>
 <div className="flex gap-2">
 <div className="flex-1 flex items-center bg-background border border-border rounded-lg px-4 py-2 opacity-80 backdrop-blur">
 <input 
 type="password"
 value={apiKey} 
 readOnly 
 className="bg-transparent border-none outline-none w-full font-mono text-sm text-foreground"
 />
 </div>
 <button 
 onClick={copyKey}
 className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-primary text-primary-foreground/20 hover:border-primary transition-colors flex items-center gap-2"
 >
 {copiedKey ? <CheckCircle2 size={16} className="text-success"/> : <Copy size={16} />}
 </button>
 </div>
 </div>
 <button className="text-foreground-muted text-sm font-bold hover:text-primary-hot transition-colors flex items-center gap-1 mt-2">
 Generate New Key <ChevronRight size={14} />
 </button>
 </div>
 </div>

 {/* 6. Danger Zone */}
 <div className="rounded-xl p-6 md:p-8 bg-transparent border-2 border-dashed border-[#ef4444]/30">
 <h3 className="font-display font-bold text-lg text-destructive flex items-center gap-2 mb-2">
 <AlertTriangle size={20} /> Danger Zone
 </h3>
 <p className="text-sm text-foreground-muted mb-5">Irreversible actions that will permanently affect your account data and configurations.</p>
 
 <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border border-[#ef4444]/20 bg-destructive/5 rounded-lg p-5">
 <div>
 <h4 className="font-bold text-foreground text-sm md:text-base">Reset Intelligence Brain</h4>
 <p className="text-xs text-foreground-muted">Delete all machine learning baseline data</p>
 </div>
 <button className="px-4 py-2 bg-transparent border border-[#ef4444] text-destructive rounded text-sm font-bold hover:bg-destructive hover:text-white transition-colors whitespace-nowrap">
 Reset Data
 </button>
 </div>
 
 <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border border-[#ef4444]/20 bg-destructive/5 rounded-lg p-5 mt-4">
 <div>
 <h4 className="font-bold text-foreground text-sm md:text-base">Delete Account & Platform</h4>
 <p className="text-xs text-foreground-muted">Permanently remove organization</p>
 </div>
 <button className="px-4 py-2 bg-destructive text-white rounded text-sm font-bold hover:bg-red-700 transition-colors whitespace-nowrap flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
 <Trash2 size={16} /> Delete Platform
 </button>
 </div>
 </div>

 </div>

 {/* Floating Sticky Save Button */}
 <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-gradient-to-t from-[#0a0000] via-[#0a0000]/90 to-transparent z-40 border-t border-border/50 backdrop-blur-sm">
 <div className="max-w-[720px] mx-auto flex items-center justify-between">
 <p className="text-sm font-body text-foreground-muted hidden sm:block">You have unsaved changes in <strong className="text-foreground">Profile Details</strong>.</p>
 <button 
 onClick={() => toast.success('All settings saved successfully.')}
 className="w-full sm:w-auto px-10 py-3 rounded-lg bg-primary text-primary-foreground text-white font-display font-bold hover:bg-primary/80 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(153,51,51,0.4)] flex items-center justify-center gap-2"
 >
 Save All Changes
 </button>
 </div>
 </div>
 </motion.div>
 );
}

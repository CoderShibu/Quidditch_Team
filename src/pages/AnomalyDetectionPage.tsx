import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Search, Bot, X, Zap, Bell, Check, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { api } from '@/services/api';

type Anomaly = {
  id: number; title: string; type: string; description: string;
  service: string; resourceId: string; region: string;
  severity: string; status: string; costImpact: number;
  detectedAt: string; cascade: string[];
};

const severityColors: Record<string, string> = {
  critical: 'bg-red-900/40 text-red-400 border border-red-600/30',
  high: 'bg-orange-900/40 text-orange-400 border border-orange-600/30',
  medium: 'bg-yellow-900/40 text-yellow-400 border border-yellow-600/30',
  low: 'bg-blue-900/40 text-blue-400 border border-blue-600/30',
};
const statusColors: Record<string, string> = {
  open: 'text-destructive',
  investigating: 'text-warning',
  resolved: 'text-success',
};

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="backdrop-blur-md"
        style={{
          background: '#1a0000',
          border: '1px solid #993333',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: '0 0 16px rgba(153,51,51,0.4)',
          color: '#f2e6e6',
          fontFamily: '"Space Mono", monospace'
        }}
      >
        <p className="text-sm border-b border-[#993333]/30 pb-1 mb-2 text-[#f2e6e6]/80">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-mono text-sm">
              <span className="opacity-80 font-body mr-2 capitalize">{entry.name}:</span>
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AnomalyDetectionPage() {
  const [filter, setFilter] = useState({ severity: '', service: '', status: '' });
  const [aiModal, setAiModal] = useState<Anomaly | null>(null);
  const [aiState, setAiState] = useState<{ loading: boolean; data: any; error: string | null }>({
    loading: false, data: null, error: null
  });
  const [showAllAnomalies, setShowAllAnomalies] = useState(false);
  const [liveAnomalies, setLiveAnomalies] = useState<Anomaly[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [anomalyRes, trendRes] = await Promise.allSettled([
        api.getAnomalies(),
        api.getAnomalyTrend()
      ]);
      if (anomalyRes.status === 'fulfilled') setLiveAnomalies(anomalyRes.value || []);
      if (trendRes.status === 'fulfilled') setTrendData(trendRes.value || []);
    } catch {
      toast.error('Failed to load anomaly data');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const investigateAnomaly = async (anomaly: Anomaly, retry = false) => {
    setAiModal(anomaly);
    setAiState({ loading: true, data: null, error: null });
    try {
      const result = await api.analyzeAnomaly({
        type: anomaly.title,
        service: anomaly.service,
        resourceId: anomaly.resourceId,
        costImpact: anomaly.costImpact,
        cascade: anomaly.cascade || []
      });
      setAiState({ loading: false, data: result, error: null });
    } catch (err: any) {
      if (!retry) {
        setAiState({ loading: true, data: null, error: 'AI analysis failed — retrying...' });
        setTimeout(() => investigateAnomaly(anomaly, true), 2000);
      } else {
        setAiState({ loading: false, data: null, error: 'AI analysis failed permanently.' });
      }
    }
  };

  // Trigger states
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [autoStopHours, setAutoStopHours] = useState(2);
  const [autoStopDays, setAutoStopDays] = useState(1);
  const [autoAction, setAutoAction] = useState('Stop Instance');
  const [autoServices, setAutoServices] = useState({ ec2: true, lambda: true, rds: false, s3: false });

  const [manualEnabled, setManualEnabled] = useState(true);
  const [manualMethod, setManualMethod] = useState('Both');
  const [manualHours, setManualHours] = useState(1);
  const [manualShowCost, setManualShowCost] = useState(true);
  const [manualRequireConfirm, setManualRequireConfirm] = useState(true);

  const filtered = liveAnomalies.filter(a =>
    (!filter.severity || a.severity === filter.severity) &&
    (!filter.service || a.service === filter.service) &&
    (!filter.status || a.status === filter.status)
  );

  const displayedAnomalies = showAllAnomalies ? filtered : filtered.slice(0, 4);
  const services = [...new Set(liveAnomalies.map(a => a.service))];

  return (
    <motion.div initial="hidden" animate="show" variants={fade} className="space-y-6 pb-8">
      {/* Filters */}
      <div className="glass rounded-lg p-4 flex flex-wrap gap-3 items-center border border-border">
        <Search size={16} className="text-foreground-muted"/>
        <select value={filter.severity} onChange={e => setFilter({ ...filter, severity: e.target.value })} className="bg-background border border-border rounded px-3 py-1.5 text-xs font-body text-foreground outline-none focus:border-primary">
          <option value="">All Severity</option>
          {['critical','high','medium','low'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filter.service} onChange={e => setFilter({ ...filter, service: e.target.value })} className="bg-background border border-border rounded px-3 py-1.5 text-xs font-body text-foreground outline-none focus:border-primary">
          <option value="">All Services</option>
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="bg-background border border-border rounded px-3 py-1.5 text-xs font-body text-foreground outline-none focus:border-primary">
          <option value="">All Status</option>
          {['open','investigating','resolved'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Anomaly cards */}
      <div className="grid gap-4">
        {displayedAnomalies.map((a) => (
          <div key={a.id} className="glass rounded-lg p-5 border border-border hover:border-primary/60 transition-colors shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-destructive"/>
                  <span className="font-display font-bold text-sm text-foreground">{a.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${severityColors[a.severity]}`}>{a.severity}</span>
                  <span className={`text-[10px] font-mono capitalize px-2 py-0.5 rounded bg-background border border-border/50 ${statusColors[a.status]}`}>{a.status}</span>
                </div>
                <p className="text-xs text-foreground-muted font-body mb-3">{a.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-foreground-muted font-mono bg-background p-2 rounded border border-border/50 inline-flex">
                  <span className="text-foreground">{a.service}</span>
                  <span>|</span>
                  <span className="text-foreground">{a.resourceId}</span>
                  <span>|</span>
                  <span className="text-foreground">{a.region}</span>
                  <span>|</span>
                  <span className="text-destructive font-bold">+${a.costImpact}/day</span>
                </div>
              </div>
              <button
                onClick={() => investigateAnomaly(a)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#993333] text-[#f2e6e6] text-xs font-bold hover:bg-[#800000] transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(153,51,51,0.3)] min-w-[140px] justify-center"
              >
                <Bot size={14} /> Investigate
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showAllAnomalies && filtered.length > 4 && (
        <div className="flex justify-center mt-2">
          <button 
            onClick={() => setShowAllAnomalies(true)}
            className="text-sm font-bold text-[#c58a8a] hover:text-[#f2e6e6] transition-colors border border-[#460000] rounded-full px-6 py-2 bg-[#1a0000] hover:bg-[#460000]/50"
          >
            Show All ({filtered.length - 4} more)
          </button>
        </div>
      )}

      {/* TRIGGERS SECTION */}
      <div className="pt-8">
        <h2 className="text-[18px] font-display font-bold text-foreground mb-1">Customization of Triggers</h2>
        <p className="text-sm font-body text-foreground-muted mb-6">Configure how Ghana responds to detected anomalies</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AUTO ACTION CARD */}
          <div className="glass rounded-xl p-6 border border-[#460000] relative overflow-hidden flex flex-col h-full bg-[#0a0000]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1a0000] border border-[#993333]/50 flex items-center justify-center text-[#993333]">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-md">Automatic Instance Management</h3>
                  <p className="text-xs text-foreground-muted max-w-[250px] mt-1">Automatically stop/terminate idle instances when they exceed your defined time threshold</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold font-mono text-foreground-muted">{autoEnabled ? 'ON' : 'OFF'}</span>
                <button 
                  onClick={() => setAutoEnabled(!autoEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${autoEnabled ? 'bg-[#993333]' : 'bg-[#1a0000] border border-[#460000]'}`}
                >
                  <motion.div animate={{ x: autoEnabled ? 20 : 2 }} className={`w-4 h-4 rounded-full absolute top-[1px] ${autoEnabled ? 'bg-[#f2e6e6]' : 'bg-[#c58a8a]'}`} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {autoEnabled && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex-1 flex flex-col">
                  <div className="space-y-4 pt-4 border-t border-[#460000]/50 mt-2 flex-1">
                    
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm text-foreground">Stop instance after <span className="text-[#c58a8a] font-mono">hours</span> of idle time</label>
                      <input type="number" min="1" max="72" value={autoStopHours} onChange={e => setAutoStopHours(Number(e.target.value))} className="w-16 bg-[#0a0000] border border-[#460000] rounded px-2 py-1 text-sm text-[#f2e6e6] text-center font-mono focus:border-[#993333] outline-none" />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm text-foreground">Stop instance after <span className="text-[#c58a8a] font-mono">days</span> if not resolved</label>
                      <input type="number" min="1" value={autoStopDays} onChange={e => setAutoStopDays(Number(e.target.value))} className="w-16 bg-[#0a0000] border border-[#460000] rounded px-2 py-1 text-sm text-[#f2e6e6] text-center font-mono focus:border-[#993333] outline-none" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-2">Action to take</label>
                      <select value={autoAction} onChange={e => setAutoAction(e.target.value)} className="w-full bg-[#1a0000] border border-[#460000] rounded px-3 py-2 text-sm text-foreground outline-none focus:border-[#993333] appearance-none">
                        <option>Stop Instance</option>
                        <option>Terminate Instance</option>
                        <option>Scale Down</option>
                        <option>Reduce Concurrency</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-2">Services affected</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(autoServices).map(([key, value]) => (
                          <button 
                            key={key} 
                            onClick={() => setAutoServices(prev => ({ ...prev, [key]: !value }))}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] font-bold transition-all uppercase ${value ? 'border-[#993333] bg-[#993333]/20 text-[#f2e6e6]' : 'border-[#460000] bg-[#1a0000] text-foreground-muted'}`}
                          >
                            <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${value ? 'bg-[#993333] border-[#993333]' : 'border-[#460000]'}`}>
                              {value && <Check size={10} strokeWidth={4} className="text-[#f2e6e6]" />}
                            </div>
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-orange-900/20 border border-orange-900/40 p-3 rounded-lg flex items-start gap-2 mt-4 text-orange-400">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <p className="text-[11px] font-medium leading-tight">Automatic actions cannot be undone. Ensure snapshots are configured.</p>
                    </div>

                  </div>
                  <div className="pt-5 mt-auto">
                    <button onClick={() => toast.success('Automatic rules saved')} className="w-full py-2.5 rounded bg-[#993333] text-[#f2e6e6] font-bold text-sm hover:bg-[#800000] transition-colors shadow-[0_0_15px_rgba(153,51,51,0.3)]">
                      Save Automatic Rules
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MANUAL ALERT CARD */}
          <div className="glass rounded-xl p-6 border border-[#460000] relative overflow-hidden flex flex-col h-full bg-[#0a0000]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1a0000] border border-[#993333]/50 flex items-center justify-center text-[#993333]">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-md">Manual Alert & Approval</h3>
                  <p className="text-xs text-foreground-muted max-w-[250px] mt-1">Ghana will alert you first and wait for your decision before taking any action</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold font-mono text-foreground-muted">{manualEnabled ? 'ON' : 'OFF'}</span>
                <button 
                  onClick={() => setManualEnabled(!manualEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${manualEnabled ? 'bg-[#993333]' : 'bg-[#1a0000] border border-[#460000]'}`}
                >
                  <motion.div animate={{ x: manualEnabled ? 20 : 2 }} className={`w-4 h-4 rounded-full absolute top-[1px] ${manualEnabled ? 'bg-[#f2e6e6]' : 'bg-[#c58a8a]'}`} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {manualEnabled && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex-1 flex flex-col">
                  <div className="space-y-4 pt-4 border-t border-[#460000]/50 mt-2 flex-1">
                    
                    <div>
                      <label className="block text-[10px] font-bold text-foreground-muted uppercase tracking-wider mb-2">Alert Method</label>
                      <div className="flex items-center gap-2 bg-[#1a0000] p-1 rounded-lg border border-[#460000] w-fit">
                        {['In-App Alert', 'Email', 'Both'].map(m => (
                          <button 
                            key={m} 
                            onClick={() => setManualMethod(m)}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${manualMethod === m ? 'bg-[#993333] text-[#f2e6e6] shadow-[0_0_10px_rgba(153,51,51,0.4)]' : 'text-foreground-muted hover:text-foreground'}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm text-foreground">Send alert after <span className="text-[#c58a8a] font-mono">hours</span> idle</label>
                      <input type="number" min="1" value={manualHours} onChange={e => setManualHours(Number(e.target.value))} className="w-16 bg-[#0a0000] border border-[#460000] rounded px-2 py-1 text-sm text-[#f2e6e6] text-center font-mono focus:border-[#993333] outline-none" />
                    </div>

                    <div className="flex items-center justify-between gap-4 py-1.5 border-t border-[#460000]/30 pt-3">
                      <label className="text-sm font-medium text-foreground">Show cost impact in alert</label>
                      <button onClick={() => setManualShowCost(!manualShowCost)} className={`w-10 h-5 rounded-full transition-colors relative ${manualShowCost ? 'bg-[#993333]' : 'bg-[#1a0000] border border-[#460000]'}`}>
                        <motion.div animate={{ x: manualShowCost ? 20 : 2 }} className={`w-4 h-4 rounded-full absolute top-[1px] ${manualShowCost ? 'bg-[#f2e6e6]' : 'bg-[#c58a8a]'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#460000]/30 pb-3">
                      <label className="text-sm font-medium text-foreground">Require confirmation to stop</label>
                      <button onClick={() => setManualRequireConfirm(!manualRequireConfirm)} className={`w-10 h-5 rounded-full transition-colors relative ${manualRequireConfirm ? 'bg-[#993333]' : 'bg-[#1a0000] border border-[#460000]'}`}>
                        <motion.div animate={{ x: manualRequireConfirm ? 20 : 2 }} className={`w-4 h-4 rounded-full absolute top-[1px] ${manualRequireConfirm ? 'bg-[#f2e6e6]' : 'bg-[#c58a8a]'}`} />
                      </button>
                    </div>

                    <div className="bg-[#140000] border border-[#460000] p-4 rounded-lg mt-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1a0000] border-b border-l border-[#460000] rounded-bl-lg text-[10px] font-mono font-bold text-[#c58a8a]">PREVIEW</div>
                      <div className="flex items-start gap-3 mt-1">
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                        <div className="w-full">
                          <p className="font-bold text-sm text-[#f2e6e6]">Ghana Alert: i-0a1b2c3d is idle for {manualHours} hour{manualHours>1?'s':''}</p>
                          {manualShowCost && <p className="text-[11px] text-[#c58a8a] mt-1 font-medium">Estimated waste: $47.20/day</p>}
                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#460000]/50 w-full">
                            {manualRequireConfirm && <button className="px-3 py-1.5 bg-[#993333] text-[#f2e6e6] text-[10px] font-bold rounded shadow-[0_0_8px_rgba(153,51,51,0.4)]">Stop Instance</button>}
                            <button className="px-3 py-1.5 bg-[#1a0000] border border-[#460000] text-[#f2e6e6] text-[10px] font-bold rounded hover:bg-[#460000]/50 transition-colors">Snooze 4h</button>
                            <button className="px-3 py-1.5 bg-transparent border border-transparent text-[#c58a8a] text-[10px] font-bold rounded hover:text-white transition-colors">Ignore</button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                  <div className="pt-5 mt-auto">
                    <button onClick={() => toast.success('Manual rules saved')} className="w-full py-2.5 rounded border border-[#993333] text-[#f2e6e6] bg-transparent font-bold text-sm hover:bg-[#1a0000] transition-colors shadow-[0_0_10px_rgba(153,51,51,0.0)] hover:shadow-[0_0_15px_rgba(153,51,51,0.3)]">
                      Save Manual Rules
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Trend chart */}
      <div className="glass rounded-lg p-6 border border-border mt-8">
        <h3 className="font-display font-bold text-sm mb-4 text-foreground">Anomaly Trend (14 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#460000" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'hsl(0 25% 65%)', fontSize: 10 }} axisLine={{ stroke: '#460000' }} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(0 25% 65%)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="critical" stackId="a" fill="#dc2626" radius={[2,2,0,0]} />
            <Bar dataKey="high" stackId="a" fill="#ea580c" radius={[2,2,0,0]} />
            <Bar dataKey="count" fill="#993333" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Modal */}
      <AnimatePresence>
        {aiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setAiModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`glass rounded-xl overflow-hidden flex flex-col w-full border border-[#460000] shadow-[0_0_50px_rgba(0,0,0,0.8)] ${aiState.loading || aiState.error ? 'max-w-md p-8' : 'max-w-2xl'}`}
              onClick={e => e.stopPropagation()}
            >
              {aiState.loading || aiState.error ? (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border-4 border-[#1a0000] flex items-center justify-center">
                      <Bot size={28} className="text-primary-hot opacity-80" />
                    </div>
                    {aiState.loading && !aiState.error && (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-primary-hot border-r-primary border-b-transparent border-l-transparent drop-shadow-[0_0_8px_rgba(153,51,51,0.8)]"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-display font-bold text-foreground mb-2">
                    {aiState.error ? 'Connection Error' : 'Ghana AI Investigating...'}
                  </h3>
                  <p className="text-sm font-mono text-[#c58a8a]">
                    {aiState.error || `Analyzing ${aiModal.title} on ${aiModal.service}...`}
                  </p>
                  
                  {(aiState.error && !aiState.error.includes('retrying')) && (
                    <button 
                      onClick={() => setAiModal(null)}
                      className="mt-6 px-6 py-2 rounded bg-[#1a0000] border border-[#460000] text-sm font-bold text-foreground-muted hover:text-foreground transition-colors"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              ) : aiState.data ? (
                <>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#1a0000] to-[#0a0000] p-5 border-b border-[#460000] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#993333]/20 rounded-lg text-primary-hot border border-[#993333]/30 shadow-[0_0_10px_rgba(153,51,51,0.2)]">
                        <Bot size={20} />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-lg text-foreground leading-tight">AI Analysis Complete</h2>
                        <p className="text-xs font-mono text-foreground-muted truncate max-w-[300px]">{aiModal.resourceId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-[#c58a8a] tracking-wider mb-1">Confidence</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[#1a0000] rounded-full overflow-hidden border border-[#460000] shadow-inner">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-[#993333] to-[#df5050]"
                              initial={{ width: 0 }}
                              animate={{ width: `${aiState.data.confidence}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-success">{aiState.data.confidence}%</span>
                        </div>
                      </div>
                      <button onClick={() => setAiModal(null)} className="p-1 hover:bg-[#220000] rounded text-foreground-muted hover:text-foreground transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 bg-[#0a0000] space-y-6 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted mb-2 font-mono">1. What Happened</h4>
                        <p className="text-sm font-body text-[#f2e6e6] leading-relaxed bg-[#140000] p-4 rounded-lg border border-[#460000]/50">{aiState.data.analysis}</p>
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted mb-2 font-mono">2. Root Cause</h4>
                        <p className="text-sm font-body text-[#c58a8a] leading-relaxed bg-[#140000] p-4 rounded-lg border border-[#460000]/50">{aiState.data.rootCause}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted mb-2 font-mono">3. Recommended Action</h4>
                      <div className="bg-[#220000] border border-primary p-4 rounded-lg shadow-[0_0_15px_rgba(153,51,51,0.15)] flex items-start gap-3">
                        <Zap size={18} className="text-primary-hot mt-0.5 shrink-0" />
                        <p className="text-sm font-bold text-primary-hot leading-relaxed">{aiState.data.recommendation}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted mb-3 font-mono">4. Steps to Fix</h4>
                      <div className="space-y-2">
                        {aiState.data.steps.map((step: string, i: number) => (
                          <label key={i} className="flex items-start gap-3 p-3 rounded bg-[#1a0000] border border-[#460000] hover:border-primary/50 transition-colors cursor-pointer group">
                            <input type="checkbox" className="mt-1 w-4 h-4 rounded border-[#460000] bg-[#0a0000] text-primary focus:ring-primary focus:ring-offset-[#0a0000]" />
                            <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">{step}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 bg-[#140000] p-4 rounded-lg border border-[#460000]/50">
                      <div>
                        <span className="block text-[10px] uppercase text-foreground-muted mb-1 font-mono">Savings</span>
                        <span className="text-sm font-bold text-success font-mono">${aiState.data.estimatedSavings.toLocaleString()}/day</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase text-foreground-muted mb-1 font-mono">Priority</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${aiState.data.priority === 'Immediate' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'}`}>{aiState.data.priority}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase text-foreground-muted mb-1 font-mono">Fix Time</span>
                        <span className="text-sm font-bold text-[#f2e6e6] font-mono">{aiState.data.estimatedFixTime}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase text-foreground-muted mb-1 font-mono">Service</span>
                        <span className="text-xs px-2 py-0.5 border border-[#460000] rounded text-foreground font-mono bg-[#1a0000]">{aiModal.service}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-[#460000] bg-[#1a0000] flex justify-between items-center">
                    <button onClick={() => setAiModal(null)} className="px-4 py-2 rounded text-xs font-bold text-foreground-muted hover:text-foreground transition-colors">
                      Dismiss
                    </button>
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 rounded border border-[#460000] bg-[#140000] text-xs font-bold text-[#c58a8a] hover:bg-[#220000] transition-colors">
                        Snooze
                      </button>
                      <button 
                        onClick={() => {
                          toast.success('Optimization Fix Applied', { description: 'The recommended action has been executed successfully.' });
                          setAiModal(null);
                        }}
                        className="px-6 py-2 rounded bg-[#993333] hover:bg-[#800000] text-[#f2e6e6] text-sm font-bold shadow-[0_0_15px_rgba(153,51,51,0.3)] transition-all flex items-center gap-2"
                      >
                        Apply Fix <Zap size={14} />
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

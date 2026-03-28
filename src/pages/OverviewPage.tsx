import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingDown, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import TiltCard from '@/components/TiltCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import SparklineChart from '@/components/SparklineChart';
import { dashboardMetrics, aiInsights, sparklineData } from '@/data/mockData';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/services/api';

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }
};

export default function OverviewPage() {
  const [insightIdx, setInsightIdx] = useState(0);
  const [aiState, setAiState] = useState<{loading: boolean, data: any, error: any}>({
    loading: true, data: null, error: null
  });

  const fetchAI = async () => {
    setAiState({ loading: true, data: null, error: null });
    try {
      const cached = localStorage.getItem('ghana_ai_insights');
      const cacheTime = localStorage.getItem('ghana_ai_insights_time');
      if (cached && cacheTime && (Date.now() - parseInt(cacheTime) < 5 * 60 * 1000)) {
        setAiState({ loading: false, data: JSON.parse(cached), error: null });
        return;
      }
      
      const summary = await api.getSummary();
      const result = await api.getAIInsights({
        totalCost: summary.totalThisMonth,
        dailyBurn: summary.dailyBurn || 391.67,
        budget: 15000,
        budgetUsed: summary.budgetUsed,
        ec2: 4821,
        lambda: 1893,
        rds: 1240,
        s3: 642,
        anomalies: summary.totalAnomalies,
        saved: summary.moneySaved
      });
      localStorage.setItem('ghana_ai_insights', JSON.stringify(result));
      localStorage.setItem('ghana_ai_insights_time', Date.now().toString());
      setAiState({ loading: false, data: result, error: null });
    } catch (err: any) {
      setAiState({ loading: false, data: null, error: err.message });
    }
  };

  useEffect(() => {
    fetchAI();
  }, []);

  useEffect(() => {
    if (!aiState.data?.insights) return;
    const t = setInterval(() => setInsightIdx(i => (i + 1) % aiState.data.insights.length), 5000);
    return () => clearInterval(t);
  }, [aiState.data]);

  const m = dashboardMetrics;
  const budgetPercent = Math.min((m.totalCostThisMonth / m.budget) * 100, 100);

  return (
    <motion.div variants={fade} initial="hidden" animate="show" className="space-y-6 pb-8">
      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <TiltCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground-muted text-xs font-body uppercase tracking-wider">Total Cost</p>
              <AnimatedCounter value={m.totalCostThisMonth} prefix="$" className="text-2xl font-bold text-foreground"/>
              <p className="text-xs text-primary-hot font-mono mt-1">↓ 12% vs last month</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10"><DollarSign size={20} className="text-primary-hot"/></div>
          </div>
          <div className="mt-3"><SparklineChart data={sparklineData.cost} /></div>
        </TiltCard>

        <TiltCard glowColor="bg-green-900/40">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground-muted text-xs font-body uppercase tracking-wider">Total Saved</p>
              <AnimatedCounter value={m.totalSaved} prefix="$" decimals={2} className="text-2xl font-bold text-success"/>
              <p className="text-xs text-success font-mono mt-1">↑ {m.savingsPercentage}% efficiency</p>
            </div>
            <div className="p-2 rounded-lg bg-success/10"><TrendingDown size={20} className="text-success"/></div>
          </div>
          <div className="mt-3"><SparklineChart data={sparklineData.savings} color="#22c55e"/></div>
        </TiltCard>

        <TiltCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground-muted text-xs font-body uppercase tracking-wider">Anomalies</p>
              <AnimatedCounter value={m.totalAnomalies} className="text-2xl font-bold text-foreground"/>
              <p className="text-xs text-foreground-muted font-mono mt-1">
                {m.criticalAnomalies} critical · {m.highAnomalies} high
              </p>
            </div>
            <div className="p-2 rounded-lg bg-warning/10"><AlertTriangle size={20} className="text-warning"/></div>
          </div>
          <div className="mt-3"><SparklineChart data={sparklineData.anomalies} color="#f59e0b"/></div>
        </TiltCard>

        <TiltCard glowColor="bg-green-900/40">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground-muted text-xs font-body uppercase tracking-wider">Optimizations</p>
              <AnimatedCounter value={m.optimizationsExecuted} className="text-2xl font-bold text-foreground"/>
              <p className="text-xs text-success font-mono mt-1">{m.optimizationSuccessRate}% success rate</p>
            </div>
            <div className="p-2 rounded-lg bg-success/10"><CheckCircle size={20} className="text-success"/></div>
          </div>
          <div className="mt-3"><SparklineChart data={sparklineData.optimizations} color="#22c55e"/></div>
        </TiltCard>
      </div>

      {/* Row 2: Burn Rate & Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <div className="glass rounded-lg p-6 flex flex-col h-full bg-[#0a0000]">
            <h3 className="font-display font-bold text-sm mb-4 text-foreground">Daily Burn Rate</h3>
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-32 h-32 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#460000" strokeWidth="8"/>
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none" stroke="#993333" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={264}
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 * (1 - budgetPercent / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-mono font-bold text-foreground">${m.burnRate}</span>
                  <span className="text-xs text-foreground-muted">/day</span>
                </div>
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Budget</span>
                  <span className="font-mono text-foreground">${m.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Spent</span>
                  <span className="font-mono text-foreground">${m.totalCostThisMonth.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-[#460000] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary-hot rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${budgetPercent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-foreground-muted">{budgetPercent.toFixed(1)}% of budget used</p>
              </div>
            </div>

            {/* Row 1 — 3 small stat pills */}
            <div className="grid grid-cols-3 gap-2 mt-2 pt-5 border-t border-[#460000]/50">
              <div className="bg-[#220000] border border-[#460000] rounded p-2 text-center">
                <p className="text-[10px] text-foreground-muted font-mono mb-1 leading-tight">Avg Daily</p>
                <p className="text-xs font-mono font-bold text-[#f2e6e6]">$391.67</p>
              </div>
              <div className="bg-[#220000] border border-[#460000] rounded p-2 text-center">
                <p className="text-[10px] text-foreground-muted font-mono mb-1 leading-tight">Projected Month</p>
                <p className="text-xs font-mono font-bold text-[#f2e6e6]">$12,141</p>
              </div>
              <div className="bg-[#220000] border border-[#460000] rounded p-2 text-center">
                <p className="text-[10px] text-foreground-muted font-mono mb-1 leading-tight">Days Remaining</p>
                <p className="text-xs font-mono font-bold text-[#f2e6e6]">3</p>
              </div>
            </div>

            {/* Row 2 — Spend Velocity */}
            <div className="mt-5">
              <p className="text-[11px] font-bold text-foreground mb-3 uppercase tracking-wider text-foreground-muted">Spend Velocity (last 7 days)</p>
              <div className="flex items-end justify-between h-12 gap-1 mb-2">
                {[342, 378, 401, 356, 389, 412, 391].map((val, i, arr) => (
                  <motion.div
                    key={i}
                    className={`flex-1 rounded-t-sm ${i === arr.length - 1 ? 'bg-[#ef4444]' : 'bg-[#460000]'}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / 412) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                ))}
              </div>
              <p className="text-[11px] font-mono text-amber-500 font-medium">↑ 4.2% vs previous week</p>
            </div>

            {/* Row 3 — Budget by Service */}
            <div className="mt-5 pt-5 border-t border-[#460000]/50 flex-1 flex flex-col">
              <p className="text-[11px] font-bold text-foreground mb-4 uppercase tracking-wider text-foreground-muted">Budget by Service</p>
              <div className="space-y-3.5 mb-1 mt-auto">
                {[
                  { name: 'EC2', spent: 4821, limit: 6000 },
                  { name: 'Lambda', spent: 1893, limit: 3000 },
                  { name: 'RDS', spent: 1240, limit: 2000 },
                  { name: 'S3', spent: 642, limit: 1500 },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-semibold text-foreground uppercase w-14 shrink-0">{s.name}</span>
                    <div className="flex-1 h-1.5 bg-[#1a0000] rounded-full overflow-hidden border border-[#460000]/30 shadow-inner">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#800000] to-[#993333] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((s.spent / s.limit) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + (i * 0.1) }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-foreground-muted w-28 text-right shrink-0 tracking-tight">
                      <span className="text-[#f2e6e6] font-bold">${s.spent.toLocaleString()}</span> / ${s.limit.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-lg p-6 bg-[#0a0000] flex flex-col h-full border border-[#460000]/30 shadow-[0_0_20px_rgba(153,51,51,0.05)]">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-primary-hot drop-shadow-[0_0_8px_rgba(223,80,80,0.8)]"/>
            <h3 className="font-display font-bold text-sm text-foreground tracking-wide">AI Insight of the Day</h3>
          </div>
          
          {aiState.loading ? (
            <div className="flex-1 flex flex-col items-center justify-center animate-pulse py-8">
              <div className="w-8 h-8 rounded-full border-2 border-[#993333] border-t-transparent animate-spin mb-4 shadow-[0_0_12px_rgba(153,51,51,0.5)]"></div>
              <p className="text-sm font-mono text-[#c58a8a]">Ghana AI is analyzing your infrastructure...</p>
            </div>
          ) : aiState.error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
              <p className="text-sm text-foreground-muted font-mono mb-4">AI analysis temporarily unavailable</p>
              <button onClick={fetchAI} className="px-4 py-1.5 rounded bg-[#220000] border border-[#460000] text-xs font-mono font-bold text-[#f2e6e6] hover:bg-[#460000] transition-colors">
                Retry Analysis
              </button>
            </div>
          ) : aiState.data?.insights && aiState.data.insights.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={insightIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[15px] font-bold text-[#f2e6e6] leading-tight flex items-center gap-2">
                      {aiState.data.insights[insightIdx].title}
                    </h4>
                  </div>
                  <p className="text-[#c58a8a] text-[13px] font-body leading-relaxed flex-1 mt-1 font-medium">
                    {aiState.data.insights[insightIdx].body}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-[#460000]/50 flex items-center justify-between">
                    <div className="flex flex-col gap-1 w-24">
                      <span className="text-[9px] uppercase tracking-wider text-foreground-muted font-mono">AI Confidence</span>
                      <div className="h-1 bg-[#1a0000] rounded-full overflow-hidden border border-[#460000]/30 shadow-inner">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-[#993333] to-[#df5050]"
                          initial={{ width: 0 }}
                          animate={{ width: `${aiState.data.insights[insightIdx].confidence}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <span className="text-[10px] text-[#f2e6e6] font-mono font-bold">{aiState.data.insights[insightIdx].confidence}%</span>
                    </div>
                    <button className="px-3 py-1.5 rounded bg-primary-hot hover:bg-primary transition-all text-[11px] font-mono font-bold text-white shadow-[0_0_12px_rgba(153,51,51,0.4)]">
                      {aiState.data.insights[insightIdx].action}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex gap-1.5 mt-5 justify-center">
                {aiState.data.insights.map((_: any, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setInsightIdx(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${i === insightIdx ? 'w-4 bg-primary-hot shadow-[0_0_6px_#993333]' : 'w-1.5 bg-[#460000] cursor-pointer hover:bg-[#993333]'}`} 
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Row 3: Top Cost Drivers This Week */}
      <div className="glass rounded-lg p-6 border border-border">
        <h3 className="font-display font-bold text-sm mb-6 text-foreground">Top Cost Drivers This Week</h3>
        <div className="space-y-4">
          {[
            { service: 'EC2', amount: 4821, max: 4821, change: '+2.4%' },
            { service: 'Lambda', amount: 1893, max: 4821, change: '-1.2%' },
            { service: 'RDS', amount: 1240, max: 4821, change: '+0.5%' },
            { service: 'S3', amount: 642, max: 4821, change: '+1.1%' },
            { service: 'CloudFront', amount: 387, max: 4821, change: '-0.3%' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-24 text-sm font-medium text-foreground">{item.service}</span>
              <div className="flex-1 h-6 bg-background border border-border rounded overflow-hidden relative">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#800000] to-[#993333]"
                  initial={{ width: 0 }} 
                  animate={{ width: `${(item.amount / item.max) * 100}%` }} 
                  transition={{ duration: 1, ease: "easeOut", delay: 0.1 * idx }}
                />
              </div>
              <div className="w-24 flex justify-between items-center text-sm font-mono">
                <span className="text-foreground pr-2">${item.amount.toLocaleString()}</span>
                <span className={item.change.startsWith('+') ? 'text-destructive text-[10px]' : 'text-success text-[10px]'}>{item.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Anomalies and Optimizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Recent Anomalies */}
        <div className="glass rounded-lg p-6 border border-border flex flex-col">
          <h3 className="font-display font-bold text-sm mb-4 text-foreground">Recent Anomalies</h3>
          <div className="space-y-0">
            {[
              { name: 'Idle EC2 Instance Detected', service: 'EC2', impact: '+$18.50', time: '2 hrs ago', severity: 'high' },
              { name: 'Unused EBS Volume', service: 'EBS', impact: '+$5.00', time: '5 hrs ago', severity: 'medium' },
              { name: 'High S3 PUT Requests', service: 'S3', impact: '+$12.30', time: '1 day ago', severity: 'low' }
            ].map((a, i) => (
              <div className="flex items-center justify-between text-sm py-3 border-b border-[#460000]/50 last:border-0" key={i}>
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${a.severity === 'high' ? 'bg-destructive' : a.severity === 'medium' ? 'bg-warning' : 'bg-success'}`} />
                  <span className="font-medium text-foreground">{a.name}</span>
                  <span className="text-[10px] bg-[#460000] px-1.5 py-0.5 rounded text-foreground uppercase">{a.service}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-destructive">{a.impact}</span>
                  <span className="text-xs text-foreground-muted font-body whitespace-nowrap">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-4 text-right">
            <Link to="/dashboard/anomalies" className="text-xs text-primary-hot hover:text-foreground transition-colors font-medium">View All →</Link>
          </div>
        </div>

        {/* Right: Optimization Wins */}
        <div className="glass rounded-lg p-6 border border-border flex flex-col">
          <h3 className="font-display font-bold text-sm mb-4 text-foreground">Optimization Wins This Week</h3>
          <div className="space-y-0">
            {[
              { label: 'Stopped idle staging DB', saved: '$120.00', date: 'Today' },
              { label: 'Downsized overprovisioned EC2', saved: '$45.50', date: 'Yesterday' },
              { label: 'Deleted unattached IPs', saved: '$12.00', date: 'Mar 24' },
            ].map((w, i) => (
              <div className="flex items-center justify-between text-sm py-3 border-b border-[#460000]/50 last:border-0" key={i}>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success"/>
                  <span className="font-medium text-foreground">{w.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-success font-bold">{w.saved}</span>
                  <span className="text-xs text-foreground-muted font-body whitespace-nowrap">{w.date}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-6 flex items-center justify-between">
            <div className="bg-success/10 text-success px-3 py-1.5 rounded border border-[#10b981]/20 font-mono text-[11px] uppercase font-bold shadow-[0_0_8px_rgba(16,185,129,0.15)] flex items-center gap-2">
              <CheckCircle className="w-4 h-4"/> $847 saved this week
            </div>
            <Link to="/dashboard/history" className="text-xs text-primary-hot hover:text-foreground transition-colors font-medium">View History →</Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { serviceCosts } from '@/data/mockData';
import { FileText, Mail, DownloadCloud, X, Lock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '@/services/api';

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }
};

type TimeRange = '1D' | '7D' | '30D' | '90D';

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
          {payload.map((entry: any, index: number) => {
            let color = entry.color;
            if (entry.name === 'Before') color = '#c58a8a';
            if (entry.name === 'After') color = '#4ade80';
            
            return (
              <p key={index} style={{ color }} className="font-mono text-sm">
                <span className="opacity-80 font-body mr-2">{entry.name}:</span>
                {typeof entry.value === 'number' ? `$${entry.value.toLocaleString()}` : entry.value}
              </p>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function CostMonitorPage() {
  const [range, setRange] = useState<TimeRange>('30D');
  const [costState, setCostState] = useState<{ loading: boolean, data: any, predictions: any, total: number }>({ loading: true, data: [], predictions: [], total: 0 });
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportAction, setExportAction] = useState<'pdf' | 'mail' | 'both'>('pdf');
  const [mailRecipient, setMailRecipient] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportPhase, setExportPhase] = useState('');

  const [selections, setSelections] = useState({
    costOverTime: true,
    costByService: true,
    beforeAfter: true,
    anomalies: false,
    alerts: false,
    history: false,
    topDrivers: false
  });

  const fetchCosts = async (r: TimeRange) => {
    setCostState(prev => ({ ...prev, loading: true }));
    try {
      const days = r === '1D' ? 1 : r === '7D' ? 7 : r === '30D' ? 30 : 90;
      const res = await api.getCosts(days);
      setCostState({ 
        loading: false, 
        data: res.data || [], 
        predictions: res.predictions || [],
        total: res.totalCost || 0
      });
    } catch (err) {
      toast.error('Failed to load live cost data');
      setCostState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchCosts(range);
  }, [range]);

  const combinedChartData = [...costState.data, ...costState.predictions];

  const comparisonData = [
    { service: 'EC2', before: 4820, after: 3200 },
    { service: 'Lambda', before: 2150, after: 1400 },
    { service: 'S3', before: 1340, after: 1100 },
    { service: 'RDS', before: 2640, after: 2100 },
    { service: 'CloudFront', before: 800, after: 450 },
  ];

  const handleOpenExport = (action: 'pdf' | 'mail' | 'both') => {
    setExportAction(action);
    setIsExportModalOpen(true);
  };

  const toggleAll = () => {
    const allSelected = (Object.values(selections) as boolean[]).every(Boolean);
    setSelections({
      costOverTime: !allSelected,
      costByService: !allSelected,
      beforeAfter: !allSelected,
      anomalies: !allSelected,
      alerts: !allSelected,
      history: !allSelected,
      topDrivers: !allSelected
    });
  };

  const executeExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((exportAction === 'mail' || exportAction === 'both') && !mailRecipient) {
      toast.error('Please enter a recipient email address.');
      return;
    }

    setIsGenerating(true);
    
    try {
      setExportPhase('[●○○○] Fetching your data...');
      const summary = await api.getSummary();

      setExportPhase('[●●○○] Ghana AI writing your report summary...');
      const aiResult = await api.getReportSummary({
        totalCost: summary.totalThisMonth,
        moneySaved: summary.moneySaved,
        anomalies: summary.totalAnomalies,
        optimizations: summary.optimizationsExecuted,
        dailyBurn: 391.67,
        budgetUsed: summary.budgetUsed
      }).catch(() => ({ summary: 'Ghana AI summary generation fallback.' }));

      setExportPhase('[●●●○] Building your PDF...');
      const doc = new jsPDF();
      
      // Title
      doc.setFillColor(26, 0, 0);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(242, 230, 230);
      doc.setFontSize(22);
      doc.text("Ghana Cloud Guard", 14, 20);
      doc.setFontSize(14);
      doc.setTextColor(153, 51, 51);
      doc.text("Cost & Usage Intelligence Report", 14, 30);
      
      // AI Summary
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(16);
      doc.text("Executive AI Summary", 14, 55);
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      const splitText = doc.splitTextToSize(aiResult?.summary || '', 180);
      doc.text(splitText, 14, 65);

      let currentY = 65 + (splitText.length * 5) + 15;

      autoTable(doc, {
        startY: currentY,
        head: [['Metric', 'Value']],
        body: [
          ['Total Cloud Spend (This Month)', '$' + summary.totalThisMonth],
          ['Total Saved (This Month)', '$' + summary.moneySaved],
          ['Anomalies Detected', summary.totalAnomalies + ' Active'],
          ['AI Efficiency Score', '94%']
        ],
        headStyles: { fillColor: [153, 51, 51] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      currentY = (doc as any).lastAutoTable.finalY + 20;

      if (selections.costByService) {
        if (currentY > 250) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text("Cost by Service Breakdown", 14, currentY);
        autoTable(doc, {
          startY: currentY + 10,
          head: [['Service', 'Cost ($)', 'Trend']],
          body: serviceCosts.map(s => [s.service, s.cost.toString(), s.color]),
          headStyles: { fillColor: [26, 0, 0] },
        });
        currentY = (doc as any).lastAutoTable.finalY + 20;
      }

      if (selections.beforeAfter) {
        if (currentY > 250) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text("Optimization Impact", 14, currentY);
        autoTable(doc, {
          startY: currentY + 10,
          head: [['Service', 'Before ($)', 'After ($)', 'Saved ($)']],
          body: comparisonData.map(c => [c.service, c.before.toString(), c.after.toString(), (c.before - c.after).toString()]),
          headStyles: { fillColor: [16, 185, 129] },
        });
      }
      
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated automatically by Ghana Cloud Guard on ${new Date().toLocaleDateString()}`, 14, 290);

      setExportPhase('[●●●●] Done!');
      
      if (exportAction === 'pdf' || exportAction === 'both') {
        doc.save(`Ghana_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF report generated and downloaded.');
      }
      
      if (exportAction === 'mail' || exportAction === 'both') {
        const pdfBase64 = btoa(doc.output());
        await api.sendReport({
          recipientEmail: mailRecipient,
          selectedSections: Object.keys(selections).filter(k => selections[k as keyof typeof selections]),
          reportData: summary,
          pdfBase64
        });
        toast.success(`Cloud report dispatched securely to ${mailRecipient}`);
      }
    } catch (err: any) {
      toast.error('Failed to generate report: ' + err.message);
    } finally {
      setIsGenerating(false);
      setIsExportModalOpen(false);
      setExportPhase('');
    }
  };

  const sectionsList = [
    { id: 'costOverTime', label: 'Cost Over Time Chart' },
    { id: 'costByService', label: 'Cost by Service Breakdown' },
    { id: 'beforeAfter', label: 'Before vs After Optimization' },
    { id: 'anomalies', label: 'Anomaly Detection Summary' },
    { id: 'alerts', label: 'Active Alerts Summary' },
    { id: 'history', label: 'Optimization History' },
    { id: 'topDrivers', label: 'Top Cost Drivers' }
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={fade} className="space-y-6 pb-8 relative">
      <div className="flex flex-wrap items-center justify-end gap-[12px] pt-2 mb-2">
        <button 
          onClick={() => handleOpenExport('pdf')}
          className="flex items-center gap-2 h-10 px-4 rounded-lg border border-[#993333] text-[#f2e6e6] bg-transparent text-sm font-bold shadow-[0_0_10px_rgba(153,51,51,0.0)] hover:bg-[#1a0000] hover:shadow-[0_0_15px_rgba(153,51,51,0.3)] transition-all"
        >
          <FileText size={16} /> Export PDF
        </button>
        <button 
          onClick={() => handleOpenExport('mail')}
          className="flex items-center gap-2 h-10 px-4 rounded-lg border border-[#993333] text-[#f2e6e6] bg-transparent text-sm font-bold shadow-[0_0_10px_rgba(153,51,51,0.0)] hover:bg-[#1a0000] hover:shadow-[0_0_15px_rgba(153,51,51,0.3)] transition-all"
        >
          <Mail size={16} /> Send to Mail
        </button>
        <button 
          onClick={() => handleOpenExport('both')}
          className="relative overflow-hidden flex items-center gap-2 h-10 px-5 rounded-lg text-[#f2e6e6] text-sm font-bold shadow-[0_0_15px_rgba(153,51,51,0.4)] group"
          style={{ background: 'linear-gradient(135deg, #800000, #993333)' }}
        >
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"></div>
          <DownloadCloud size={16} className="relative z-10" /> 
          <span className="relative z-10">Download + Mail</span>
        </button>
      </div>

      <div className="glass rounded-lg p-6 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h3 className="font-display font-bold text-foreground">Cost Over Time</h3>
          <div className="flex gap-1">
            {(['1D', '7D', '30D', '90D'] as TimeRange[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${range === r ? 'bg-primary text-primary-foreground text-foreground shadow-[0_0_8px_rgba(153,51,51,0.4)]' : 'bg-background border border-border text-foreground-muted hover:text-foreground'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {costState.loading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#993333] border-t-transparent animate-spin rounded-full shadow-[0_0_12px_rgba(153,51,51,0.5)]"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#460000" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'hsl(0 25% 65%)', fontSize: 11 }} axisLine={{ stroke: '#460000' }} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(0 25% 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#460000', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }} />
              <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#ef4444', stroke: '#1a0000', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="predicted" stroke="#c58a8a" strokeWidth={2} strokeDasharray="6 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {costState.predictions && costState.predictions.length > 0 && !costState.loading && (
          <div className="mt-4 p-4 rounded-lg bg-[#220000]/50 border border-primary/30 flex items-start gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-primary-hot animate-pulse shadow-[0_0_8px_#993333]"></div>
            <div>
              <p className="text-sm font-bold text-[#f2e6e6]">Ghana ML Model Forecast</p>
              <p className="text-xs font-mono text-[#c58a8a] mt-1">
                Ghana predicts your cost will be <strong className="text-white">${costState.predictions.reduce((acc: number, val: any) => acc + (val.predicted ? Number(val.predicted) : 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> over the next 7 days based on historical patterns.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-lg p-6 border border-border">
          <h3 className="font-display font-bold mb-4 text-foreground">Cost by Service</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={serviceCosts} dataKey="cost" nameKey="service" innerRadius={60} outerRadius={90} stroke="#1a0000" strokeWidth={2} paddingAngle={2}>
                {serviceCosts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend formatter={(value) => <span className="text-foreground-secondary text-xs ml-1">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-lg p-6 border border-border">
          <h3 className="font-display font-bold mb-4 text-foreground">Before vs After Optimization</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#460000" vertical={false} />
              <XAxis dataKey="service" tick={{ fill: 'hsl(0 25% 65%)', fontSize: 11 }} axisLine={{ stroke: '#460000' }} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(0 25% 65%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="before" fill="#993333" name="Before" radius={[4, 4, 0, 0]} />
              <Bar dataKey="after" fill="#10b981" name="After" radius={[4, 4, 0, 0]} />
              <Legend formatter={(value) => <span className="text-foreground-secondary text-xs ml-1">{value}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <AnimatePresence>
        {isExportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60 backdrop-blur-sm p-4"
            onClick={() => setIsExportModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#140000] rounded-xl p-6 max-w-md w-full border border-[#460000] shadow-[0_0_40px_rgba(0,0,0,0.8)]"
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={executeExport} className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#460000]/50">
                  <h3 className="font-display font-bold text-lg text-[#f2e6e6] flex items-center gap-2">
                    {exportAction === 'pdf' ? <FileText size={18} className="text-[#993333]" /> : <Mail size={18} className="text-[#993333]" />} 
                    Select Report Content
                  </h3>
                  <button type="button" onClick={toggleAll} className="text-[10px] font-bold text-[#c58a8a] border border-[#460000] px-3 py-1 rounded bg-[#0a0000] hover:bg-[#1a0000] transition-colors">
                    Toggle All
                  </button>
                </div>
                
                <div className="space-y-3 py-2 max-h-[40vh] overflow-y-auto 
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:bg-[#0a0000]
                  [&::-webkit-scrollbar-thumb]:bg-[#460000]
                  [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                  
                  {/* Locked item */}
                  <div className="flex items-center gap-3 p-2 rounded bg-[#0a0000] border border-[#460000]/30 cursor-not-allowed opacity-80" title="Always included in all reports">
                    <div className="w-4 h-4 rounded-sm border border-[#993333] bg-[#993333] flex items-center justify-center shrink-0">
                      <Lock size={10} className="text-[#f2e6e6]" />
                    </div>
                    <span className="text-sm font-medium text-[#f2e6e6] select-none flex-1">Overview Summary</span>
                    <span className="text-[9px] font-mono text-[#c58a8a] bg-[#1a0000] px-2 py-0.5 rounded border border-[#460000]/30">Always included</span>
                  </div>

                  {/* Toggle items */}
                  {sectionsList.map((sec) => (
                    <label key={sec.id} className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors ${selections[sec.id as keyof typeof selections] ? 'bg-[#1a0000] border-[#993333]/30' : 'bg-transparent border-transparent hover:bg-[#1a0000]/50'}`}>
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${selections[sec.id as keyof typeof selections] ? 'border-[#993333] bg-[#993333]' : 'border-[#460000] bg-[#0a0000]'}`}>
                        {selections[sec.id as keyof typeof selections] && <Check size={12} className="text-[#f2e6e6]" strokeWidth={3} />}
                      </div>
                      <span className={`text-sm select-none transition-colors ${selections[sec.id as keyof typeof selections] ? 'font-medium text-[#f2e6e6]' : 'text-foreground-muted hover:text-[#c58a8a]'}`}>
                        {sec.label}
                      </span>
                    </label>
                  ))}
                  
                </div>

                {(exportAction === 'mail' || exportAction === 'both') && (
                  <div className="pt-3 border-t border-[#460000]/50">
                    <label className="text-xs font-bold text-[#c58a8a] uppercase tracking-wider block mb-1.5">Recipient Email</label>
                    <input 
                      type="email" 
                      required
                      value={mailRecipient}
                      onChange={(e) => setMailRecipient(e.target.value)}
                      placeholder="team@ghana.cloud"
                      className="w-full px-3 py-2.5 rounded border border-[#460000] bg-[#0a0000] text-[#f2e6e6] text-sm focus:outline-none focus:border-[#993333] transition-colors"
                    />
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsExportModalOpen(false)} className="flex-1 py-2.5 rounded bg-[#1a0000] border border-[#460000] text-[#f2e6e6] font-bold text-sm hover:bg-[#0a0000] transition-colors shadow-inner">
                    Cancel
                  </button>
                  <button type="submit" disabled={isGenerating} className="flex-[2] py-2.5 rounded bg-[#993333] text-[#f2e6e6] font-bold text-sm hover:bg-[#800000] transition-colors shadow-[0_0_15px_rgba(153,51,51,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
                    {isGenerating ? (
                      <span className="flex items-center text-xs justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {exportPhase || 'Working...'}</span>
                    ) : (
                      <>{exportAction === 'pdf' ? 'Generate PDF' : exportAction === 'mail' ? 'Send Report' : 'Download & Send'}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

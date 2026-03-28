import { useState, useEffect, useRef } from 'react';
import { Bell, Sun, Moon, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { anomalies } from '@/data/mockData';
import { toast } from 'sonner';

export default function DashboardHeader() {
  const [time, setTime] = useState(new Date());
  const [isDark, setIsDark] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(
    anomalies.slice(0, 4).map(a => ({ ...a, isRead: false }))
  );
  
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const notifyTimer = setInterval(() => {
      toast.custom((t) => (
        <div 
          onClick={() => { navigate('/dashboard/alerts'); toast.dismiss(t); }}
          className="bg-[#1a0000] border border-[#993333] text-[#f2e6e6] p-4 rounded-lg shadow-[0_0_20px_rgba(153,51,51,0.4)] flex items-start gap-3 w-80 cursor-pointer pointer-events-auto"
        >
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-sm">New anomaly detected</p>
            <p className="text-xs text-[#c58a8a] mt-1">Idle EC2 in us-east-1 — $47/day</p>
          </div>
        </div>
      ), { duration: 5000, position: 'bottom-right' });
    }, 45000);
    return () => clearInterval(notifyTimer);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light');
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = localStorage.getItem('ghana_user') || 'User';

  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');
  const ss = time.getSeconds().toString().padStart(2, '0');

  return (
    <header className="min-h-[64px] border-b border-border shadow-[0_4px_20px_rgba(153,51,51,0.08)] bg-background/90 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex flex-col py-2">
        <div className="relative inline-block self-start">
          <h2 className="text-[22px] font-display font-bold text-foreground">
            {greeting}, {userName}
          </h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="h-px bg-primary text-primary-foreground w-full absolute -bottom-1 left-0 origin-left shadow-[0_0_8px_#993333]"
          />
        </div>
        <p className="text-[15px] font-mono mt-2" style={{ color: '#c58a8a' }}>
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          {' · '}
          {hh}:{mm}:<span className="text-primary-hot animate-[pulse_1s_ease-in-out_infinite] font-bold">{ss}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 lg:gap-4 relative">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg text-foreground hover: hover:text-foreground hover:scale-110 hover:shadow-[0_0_15px_rgba(153,51,51,0.4)] transition-all duration-300"
          title="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-lg text-foreground hover:scale-110 hover:shadow-[0_0_15px_rgba(153,51,51,0.4)] transition-all duration-300 relative" 
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse shadow-[0_0_8px_#ef4444] border-2 border-background" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-[#140000] border border-[#460000] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-[#460000]/50 bg-[#1a0000]">
                  <h3 className="font-display font-bold text-[#f2e6e6]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-[#993333] font-bold hover:text-white transition-colors">
                      Mark All Read
                    </button>
                  )}
                </div>
                
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 || unreadCount === 0 && (
                    <div className="p-8 flex flex-col items-center justify-center text-center opacity-70">
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3 text-success">
                        <CheckCircle size={24} />
                      </div>
                      <p className="text-sm text-foreground-muted font-body">No active alerts</p>
                    </div>
                  )}

                  {notifications.map((n, i) => (
                    <div 
                      key={i} 
                      onClick={() => { setShowNotifications(false); navigate('/dashboard/alerts'); }}
                      className={`p-4 border-b border-[#460000]/30 cursor-pointer hover:bg-[#993333]/10 transition-colors flex gap-3 ${!n.isRead ? 'bg-[#1a0000]' : 'opacity-70'}`}
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.severity === 'critical' ? 'bg-red-500 shadow-[0_0_5px_red]' : n.severity === 'high' ? 'bg-orange-500 shadow-[0_0_5px_orange]' : 'bg-gray-500'}`} />
                      <div>
                        <p className="text-sm text-[#f2e6e6] font-medium leading-tight mb-1">{n.description}</p>
                        <p className="text-[11px] text-[#c58a8a] font-mono">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-9 h-9 ml-1 rounded-full bg-primary text-primary-foreground/20 flex items-center justify-center text-sm font-bold text-foreground border border-primary/40 cursor-default hover:scale-110 hover:shadow-[0_0_15px_rgba(153,51,51,0.4)] transition-all duration-300">
          {userName.charAt(0).toUpperCase()}
        </div>

        <button
          onClick={() => { localStorage.removeItem('ghana_user'); navigate('/login'); }}
          className="p-2.5 rounded-lg text-foreground hover: hover:scale-110 hover:shadow-[0_0_15px_rgba(153,51,51,0.4)] transition-all duration-300 ml-1"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

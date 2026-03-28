import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GhanaLogo from '@/components/GhanaLogo';
import { Mail, Lock, ArrowRight, Loader2, User, Building, Cloud } from 'lucide-react';

function LoginParticles() {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 
 useEffect(() => {
 const canvas = canvasRef.current;
 if (!canvas) return;
 const ctx = canvas.getContext('2d');
 if (!ctx) return;
 
 let animId: number;
 const particles: { x: number, y: number, vx: number, vy: number, radius: number }[] = [];
 const count = 50;
 const maxDist = 120;
 
 const resize = () => {
 canvas.width = window.innerWidth;
 canvas.height = window.innerHeight;
 };
 resize();
 window.addEventListener('resize', resize);
 
 for (let i = 0; i < count; i++) {
 particles.push({
 x: Math.random() * canvas.width,
 y: Math.random() * canvas.height,
 vx: (Math.random() - 0.5) * 0.3,
 vy: (Math.random() - 0.5) * 0.3,
 radius: Math.random() * 1.5 + 0.5
 });
 }
 
 const draw = () => {
 ctx.clearRect(0, 0, canvas.width, canvas.height);
 ctx.fillStyle = '#800000';
 
 for (let i = 0; i < particles.length; i++) {
 const p = particles[i];
 p.x += p.vx;
 p.y += p.vy;
 if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
 if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
 
 ctx.beginPath();
 ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
 ctx.fill();
 
 for (let j = i + 1; j < particles.length; j++) {
 const p2 = particles[j];
 const dx = p.x - p2.x;
 const dy = p.y - p2.y;
 const dist = Math.sqrt(dx * dx + dy * dy);
 if (dist < maxDist) {
 ctx.beginPath();
 ctx.moveTo(p.x, p.y);
 ctx.lineTo(p2.x, p2.y);
 ctx.strokeStyle = `rgba(128, 0, 0, ${0.1 * (1 - dist / maxDist)})`;
 ctx.lineWidth = 0.5;
 ctx.stroke();
 }
 }
 }
 animId = requestAnimationFrame(draw);
 };
 draw();
 
 return () => {
 cancelAnimationFrame(animId);
 window.removeEventListener('resize', resize);
 };
 }, []);
 
 return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50"/>;
}

const FloatingInput = ({ 
 icon: Icon, label, type = "text", value, onChange, id, required 
}: any) => {
 const [isFocused, setIsFocused] = useState(false);
 const isActive = isFocused || value.length > 0;
 
 return (
 <div className={`relative flex items-center w-full px-4 py-3 rounded-lg bg-background/60 border transition-all duration-300 ${isFocused ? 'border-primary shadow-[0_0_15px_rgba(153,51,51,0.15)]' : 'border-border'} backdrop-blur-md`}>
 <Icon className={`w-5 h-5 mr-3 transition-colors duration-300 ${isFocused ? 'text-foreground' : 'text-[#800000]'}`} />
 <div className="relative flex-1 h-6">
 <label 
 htmlFor={id}
 className={`absolute left-0 transition-all duration-300 pointer-events-none text-[#800000] font-body ${isActive ? '-top-3 text-[10px] uppercase tracking-wider font-bold text-foreground' : 'top-0.5 text-sm font-medium'}`}
 >
 {label}
 </label>
 <input
 id={id}
 type={type}
 required={required}
 value={value}
 onChange={onChange}
 onFocus={() => setIsFocused(true)}
 onBlur={() => setIsFocused(false)}
 className="w-full h-full bg-transparent border-none outline-none text-foreground font-mono text-sm pt-2 autofill:bg-transparent"
 />
 </div>
 </div>
 );
};

export default function LoginPage() {
 const navigate = useNavigate();
 const [isSignUp, setIsSignUp] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [name, setName] = useState('');
 const [company, setCompany] = useState('');
 const [awsId, setAwsId] = useState('');
 const [confirmPw, setConfirmPw] = useState('');
 const [error, setError] = useState('');

  const submitAction = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  try {
    if (!isSignUp) {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: email, password})
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('ghana_token', data.token);
      localStorage.setItem('ghana_user', data.name || email);
      navigate('/dashboard');
    } else {
      if (password !== confirmPw) { setError('Passwords do not match'); setIsLoading(false); return; }
      const res = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({fullName: name, email, company, awsAccountId: awsId, password})
      });
      if (!res.ok) throw new Error('Signup failed');
      const data = await res.json();
      localStorage.setItem('ghana_token', data.token);
      localStorage.setItem('ghana_user', data.name || name);
      navigate('/dashboard');
    }
  } catch (err: any) {
    // Fallback to local check if backend is unreachable
    if (!isSignUp && (email.toLowerCase() === 'quidditch' && password === 'Team')) {
      localStorage.setItem('ghana_user', 'Ghana Admin');
      localStorage.setItem('ghana_token', 'local_demo_token');
      navigate('/dashboard');
    } else {
      setError(err.message || 'Login failed. Check credentials.');
    }
  } finally {
    setIsLoading(false);
  }
  };

 return (
 <div className="min-h-screen relative flex flex-col items-center justify-center bg-black overflow-hidden px-4 md:px-8 py-12">
 {/* Particle background */}
 <LoginParticles />
 {/* Subtle radial glow */}
 <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_#1a0000_0%,_transparent_70%)]"/>
 
 <motion.div 
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, ease: "easeOut"}}
 className="w-full max-w-[480px] relative z-10 flex flex-col items-center"
 >
 {/* Glowing Crimson Logo */}
 <div className="relative mb-6 mx-auto">
 <div className="absolute inset-0 rounded-full border border-primary shadow-[0_0_15px_#800000] animate-[pulse_3s_ease-in-out_infinite]"/>
 <div className="bg-background p-4 rounded-full relative z-10 w-24 h-24 flex items-center justify-center border border-border">
 <GhanaLogo size={52} showText={false} />
 </div>
 </div>
 
 {/* Title & Tagline */}
 <div className="text-center mb-8">
 <h1 className="font-display font-bold text-4xl mb-2 text-foreground tracking-[0.2em]">GHANA</h1>
 <p className="text-[#800000] text-sm font-body font-medium tracking-wide">
 Intelligent Cloud. Zero Waste.
 </p>
 </div>

 {/* The Card */}
 <div className="w-full /60 backdrop-blur-xl border border-border rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
 <div className="w-full text-center mb-6">
 <h2 className="font-display font-bold text-2xl mb-1 text-foreground tracking-tight">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
 <p className="text-[#800000] text-xs font-body font-medium tracking-wide">
 {isSignUp ? 'Join the intelligent platform' : 'Sign in to your dashboard'}
 </p>
 </div>

 <form className="w-full space-y-3 relative z-20"onSubmit={submitAction}>
 <AnimatePresence mode="wait">
 {!isSignUp ? (
 <motion.div key="login"initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
 <FloatingInput icon={Mail} label="Email / Username"type="text"id="email"value={email} onChange={(e: any) => setEmail(e.target.value)} required />
 <FloatingInput icon={Lock} label="Password"type="password"id="password"value={password} onChange={(e: any) => setPassword(e.target.value)} required />
 
 {/* Terminal Hint Badge */}
 <div className="bg-background border border-border p-2.5 rounded-lg font-mono text-[10px] text-foreground flex items-center gap-2 mt-2 shadow-inner">
 <span className="text-primary-hot font-bold text-xs">$&gt;</span>
 <span className="tracking-wide">HINT: ID=Quidditch PWD=Team</span>
 </div>
 </motion.div>
 ) : (
 <motion.div key="signup"initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
 <FloatingInput icon={User} label="Full Name"id="name"value={name} onChange={(e: any) => setName(e.target.value)} required />
 <FloatingInput icon={Mail} label="Email Address"type="email"id="email_su"value={email} onChange={(e: any) => setEmail(e.target.value)} required />
 <FloatingInput icon={Building} label="Company Name"id="company"value={company} onChange={(e: any) => setCompany(e.target.value)} />
 <FloatingInput icon={Cloud} label="AWS Account ID (optional)"id="aws"value={awsId} onChange={(e: any) => setAwsId(e.target.value)} />
 <FloatingInput icon={Lock} label="Password"type="password"id="pass_su"value={password} onChange={(e: any) => setPassword(e.target.value)} required />
 <FloatingInput icon={Lock} label="Confirm Password"type="password"id="confirm_su"value={confirmPw} onChange={(e: any) => setConfirmPw(e.target.value)} required />
 </motion.div>
 )}
 </AnimatePresence>
 
 <button 
 type="submit"
 disabled={isLoading}
 className="group relative w-full mt-6 bg-primary text-primary-foreground text-foreground font-display font-bold tracking-wider text-sm py-3.5 rounded-lg overflow-hidden transition-all hover:bg-primary/80 hover:shadow-[0_0_20px_rgba(153,51,51,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center"
 >
 <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[#f2e6e6]/20 to-transparent pointer-events-none"/>
 
 {isLoading ? (
 <Loader2 className="w-5 h-5 animate-spin"/>
 ) : (
 <span className="flex items-center gap-2">
 {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"/>
 </span>
 )}
 </button>
 
 {error && <p className="text-primary-hot text-xs font-mono text-center mt-3 bg-primary text-primary-foreground/10 py-1.5 rounded">{error}</p>}
 </form>
 
 <p className="text-center w-full text-xs text-[#800000] mt-6 font-body font-medium">
 {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
 <button type="button"onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-primary-hot hover:text-foreground font-bold tracking-wide transition-colors">
 {isSignUp ? 'Sign In' : 'Sign Up'}
 </button>
 </p>

 {/* Trust Badges */}
 <div className="flex justify-center items-center gap-3 mt-8 w-full text-[9px] text-[#800000] font-bold uppercase tracking-widest pt-5 border-t border-border/60">
 <span className="flex items-center gap-1"><span className="text-xs">🔒</span> Encrypted</span>
 <span className="opacity-40">|</span>
 <span className="flex items-center gap-1"><span className="text-xs">☁️</span> AWS Native</span>
 <span className="opacity-40">|</span>
 <span className="flex items-center gap-1"><span className="text-xs">🤖</span> AI Powered</span>
 </div>
 </div>
 </motion.div>
 </div>
 );
}

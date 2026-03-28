import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, AlertTriangle, Bell, History, Settings } from 'lucide-react';
import GhanaLogo from './GhanaLogo';

const navItems = [
 { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
 { to: '/dashboard/cost', icon: BarChart3, label: 'Cost Monitor' },
 { to: '/dashboard/anomalies', icon: AlertTriangle, label: 'Anomalies' },
 { to: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
 { to: '/dashboard/history', icon: History, label: 'History' },
 { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardSidebar() {
 return (
 <>
 {/* Desktop sidebar */}
 <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-sidebar fixed inset-y-0 left-0 z-30">
 <div className="p-4 border-b border-border">
 <GhanaLogo size={36} />
 </div>
 <nav className="flex-1 py-4 px-2 space-y-1">
 {navItems.map((item) => (
 <NavLink
 key={item.to}
 to={item.to}
 end={item.end}
 className={({ isActive }) =>
 `flex items-center gap-3 px-3 py-2.5 rounded-r-lg text-sm font-body transition-all duration-200 border-l-[3px] ${
 isActive
 ? 'border-primary text-foreground shadow-[inset_10px_0_20px_rgba(153,51,51,0.05)]'
 : 'border-transparent text-foreground-muted hover:text-foreground hover:bg-muted/50'
 }`
 }
 >
 <item.icon size={18} />
 <span>{item.label}</span>
 </NavLink>
 ))}
 </nav>
 </aside>

 {/* Tablet sidebar (icons only) */}
 <aside className="hidden md:flex lg:hidden flex-col w-16 border-r border-border bg-sidebar fixed inset-y-0 left-0 z-30 items-center py-4 gap-2">
 <GhanaLogo size={28} showText={false} className="mb-4"/>
 {navItems.map((item) => (
 <NavLink
 key={item.to}
 to={item.to}
 end={item.end}
 className={({ isActive }) =>
 `flex items-center justify-center w-10 h-10 rounded-r-lg transition-all border-l-[3px] ${
 isActive
 ? 'border-primary text-foreground shadow-[inset_5px_0_10px_rgba(153,51,51,0.05)]'
 : 'border-transparent text-foreground-muted hover:text-foreground hover:bg-muted/50'
 }`
 }
 title={item.label}
 >
 <item.icon size={20} />
 </NavLink>
 ))}
 </aside>

 {/* Mobile bottom tab bar */}
 <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-sidebar border-t border-border flex justify-around py-2 px-1">
 {navItems.map((item) => (
 <NavLink
 key={item.to}
 to={item.to}
 end={item.end}
 className={({ isActive }) =>
 `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] rounded transition-all ${
 isActive ? 'text-primary-hot' : 'text-foreground-muted'
 }`
 }
 >
 <item.icon size={18} />
 <span>{item.label}</span>
 </NavLink>
 ))}
 </nav>
 </>
 );
}

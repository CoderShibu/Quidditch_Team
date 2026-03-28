import { Outlet } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import OptimizeAIButton from '@/components/OptimizeAIButton';

export default function DashboardLayout() {
 return (
 <div className="min-h-screen bg-background">
 <DashboardSidebar />
 <div className="lg:ml-60 md:ml-16 pb-16 md:pb-0">
 <DashboardHeader />
 <main className="p-4 lg:p-6">
 <Outlet />
 </main>
 </div>
 <OptimizeAIButton />
 </div>
 );
}

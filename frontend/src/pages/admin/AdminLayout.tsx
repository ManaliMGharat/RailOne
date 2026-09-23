import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Train, MapPin, Ticket, Users, 
  ShieldCheck, FileText, ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Train Fleet', path: '/admin/trains', icon: Train },
    { name: 'Station Directory', path: '/admin/stations', icon: MapPin },
    { name: 'Passenger Bookings', path: '/admin/bookings', icon: Ticket },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'System Audit Logs', path: '/admin/audit-logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 p-5 space-y-6 flex-shrink-0">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-base text-white tracking-tight">Admin Console</h2>
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block -mt-0.5">
              RailOne Operations
            </span>
          </div>
        </div>

        <nav className="space-y-1.5 text-xs font-semibold">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact
              ? location.pathname === link.path
              : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Passenger UI</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

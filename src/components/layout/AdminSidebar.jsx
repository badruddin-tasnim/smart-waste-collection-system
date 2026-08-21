import { Link, Outlet } from 'react-router-dom';

export default function AdminSidebar() {
  return (
    <div className="flex min-h-screen bg-base text-text-primary font-sans">
      <div className="w-[240px] bg-surface border-r border-border-subtle flex flex-col p-4 shrink-0">
        <h1 className="text-xl font-semibold mb-8 text-accent">SWM</h1>
        <nav className="flex flex-col gap-2">
          <Link to="/admin/dashboard" className="px-3 py-2 rounded text-text-secondary hover:bg-surface2 hover:text-text-primary">Dashboard</Link>
          <Link to="/admin/zones" className="px-3 py-2 rounded text-text-secondary hover:bg-surface2 hover:text-text-primary">Zones</Link>
          <Link to="/admin/routes" className="px-3 py-2 rounded text-text-secondary hover:bg-surface2 hover:text-text-primary">Routes</Link>
          <Link to="/admin/pickups" className="px-3 py-2 rounded text-text-secondary hover:bg-surface2 hover:text-text-primary">Pickups</Link>
          <Link to="/admin/requests" className="px-3 py-2 rounded text-text-secondary hover:bg-surface2 hover:text-text-primary">Requests</Link>
          <Link to="/admin/residents" className="px-3 py-2 rounded text-text-secondary hover:bg-surface2 hover:text-text-primary">Residents</Link>
        </nav>
        <div className="mt-auto">
          <Link to="/login" className="px-3 py-2 rounded text-status-missed hover:bg-surface2 block">Logout</Link>
        </div>
      </div>
      <div className="flex-1 p-6 md:p-8 max-w-[1200px] mx-auto w-full">
        <Outlet />
      </div>
    </div>
  );
}

import { Link, Outlet } from 'react-router-dom';

export default function ResidentNav() {
  return (
    <div className="min-h-screen bg-base text-text-primary font-sans">
      <header className="bg-surface border-b border-border-subtle px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-accent">Smart Waste</h1>
          <nav className="flex gap-4">
            <Link to="/resident/schedule" className="text-text-secondary hover:text-text-primary">Schedule</Link>
            <Link to="/resident/requests" className="text-text-secondary hover:text-text-primary">My Requests</Link>
            <Link to="/resident/profile" className="text-text-secondary hover:text-text-primary">Profile</Link>
          </nav>
        </div>
        <Link to="/login" className="text-status-missed hover:text-text-primary">Logout</Link>
      </header>
      <main className="max-w-[800px] mx-auto w-full p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

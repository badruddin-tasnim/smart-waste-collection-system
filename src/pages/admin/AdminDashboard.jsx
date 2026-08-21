import { useEffect, useState } from "react";
import { getAll, getWhere } from "../../utils/firestore";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../utils/auth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    residents: 0,
    zones: 0,
    routes: 0,
    pendingRequests: 0,
    scheduledPickups: 0,
    missedPickups: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [users, zones, routes, requests, pickups] = await Promise.all([
          getWhere("users", "role", "==", "resident"),
          getAll("zones"),
          getAll("routes"),
          getWhere("requests", "status", "==", "pending"),
          getAll("pickups"),
        ]);
        setStats({
          residents: users.length,
          zones: zones.length,
          routes: routes.length,
          pendingRequests: requests.length,
          scheduledPickups: pickups.filter((p) => p.status === "scheduled").length,
          missedPickups: pickups.filter((p) => p.status === "missed").length,
        });
      } catch {
        // silently fail — stats just show 0
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }

  const cards = [
    {
      label: "Registered Residents",
      value: stats.residents,
      icon: PeopleIcon,
      color: "text-accent",
      bg: "bg-accent/10",
      href: "/admin/residents",
    },
    {
      label: "Collection Zones",
      value: stats.zones,
      icon: MapIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/zones",
    },
    {
      label: "Active Routes",
      value: stats.routes,
      icon: RouteIcon,
      color: "text-violet-600",
      bg: "bg-violet-50",
      href: "/admin/routes",
    },
    {
      label: "Pending Requests",
      value: stats.pendingRequests,
      icon: InboxIcon,
      color: "text-status-pending",
      bg: "bg-yellow-50",
      href: "/admin/requests",
    },
    {
      label: "Scheduled Pickups",
      value: stats.scheduledPickups,
      icon: CalendarIcon,
      color: "text-status-scheduled",
      bg: "bg-surface2",
      href: "/admin/pickups",
    },
    {
      label: "Missed Pickups",
      value: stats.missedPickups,
      icon: AlertIcon,
      color: "text-status-missed",
      bg: "bg-red-50",
      href: "/admin/pickups",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Dashboard</h2>
          <p className="text-text-tertiary text-sm mt-1">
            Overview of the SWM System
          </p>
        </div>
        <button
          id="admin-logout"
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-control border border-status-missed text-status-missed hover:bg-red-50 text-xs transition"
        >
          Sign out
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} navigate={navigate} />
          ))}
        </div>
      )}

      {/* Quick info */}
      <div className="mt-8 p-4 bg-surface border border-border-subtle rounded-card text-sm text-text-secondary">
        <p>
          Signed in as <span className="font-medium text-text-primary">{user?.email}</span> &middot;{" "}
          <span className="text-accent font-medium">Admin</span>
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, href, navigate }) {
  return (
    <button
      onClick={() => navigate(href)}
      className="bg-surface border border-border-subtle rounded-card shadow-card p-5 text-left hover:shadow-md hover:border-border-default transition group"
    >
      <div className={`w-10 h-10 rounded-control flex items-center justify-center mb-3 ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-text-tertiary text-sm mt-0.5">{label}</div>
    </button>
  );
}

// Icon components
function PeopleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function MapIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function RouteIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}
function InboxIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}
function CalendarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function AlertIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

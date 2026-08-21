import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getWhere } from "../../utils/firestore";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUS_STYLES = {
  scheduled: "bg-surface2 text-status-scheduled",
  completed: "bg-green-50 text-status-resolved border border-green-200",
  missed: "bg-red-50 text-status-missed border border-red-200",
};

export default function ResidentSchedule() {
  const { profile } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile?.zone) {
      setLoading(false);
      return;
    }
    getWhere("pickups", "zoneId", "==", profile.zone)
      .then((data) => {
        // Sort by scheduledDate ascending
        data.sort((a, b) => {
          const da = a.scheduledDate?.toDate?.() ?? new Date(a.scheduledDate);
          const db2 = b.scheduledDate?.toDate?.() ?? new Date(b.scheduledDate);
          return da - db2;
        });
        setPickups(data);
      })
      .catch(() => setError("Could not load schedule. Please try again."))
      .finally(() => setLoading(false));
  }, [profile]);

  if (loading) return <LoadingSpinner />;

  if (!profile?.zone) {
    return (
      <EmptyState
        title="No zone assigned"
        message="Your account doesn't have a collection zone yet. Please contact the municipal office or update your profile."
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">My Pickup Schedule</h2>
        <p className="text-text-tertiary text-sm mt-1">
          Upcoming waste collections for your zone
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-control bg-red-50 border border-red-200 text-status-missed text-sm">
          {error}
        </div>
      )}

      {pickups.length === 0 ? (
        <EmptyState
          title="No pickups scheduled"
          message="There are no upcoming pickups for your zone at the moment. Check back soon."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {pickups.map((pickup) => (
            <PickupCard key={pickup.id} pickup={pickup} />
          ))}
        </div>
      )}
    </div>
  );
}

function PickupCard({ pickup }) {
  const date = pickup.scheduledDate?.toDate?.()
    ? pickup.scheduledDate.toDate()
    : pickup.scheduledDate
    ? new Date(pickup.scheduledDate)
    : null;

  const isToday =
    date &&
    date.toDateString() === new Date().toDateString();

  const isPast = date && date < new Date() && !isToday;

  return (
    <div
      className={`bg-surface border rounded-card shadow-card p-4 flex items-start gap-4 transition ${
        isToday ? "border-accent" : "border-border-subtle"
      }`}
    >
      {/* Date block */}
      <div
        className={`flex flex-col items-center justify-center rounded-control min-w-[52px] py-2 ${
          isToday ? "bg-accent text-white" : "bg-surface2 text-text-secondary"
        }`}
      >
        {date ? (
          <>
            <span className="text-xs font-medium uppercase">{DAY_NAMES[date.getDay()]}</span>
            <span className="text-xl font-bold leading-none">{date.getDate()}</span>
          </>
        ) : (
          <span className="text-xs">—</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-text-primary text-sm">
            {pickup.routeCode || pickup.routeId || "Route"}
          </span>
          {isToday && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-white font-medium">
              Today
            </span>
          )}
        </div>
        {date && (
          <p className="text-text-tertiary text-xs mt-0.5">
            {date.toLocaleDateString("en-BD", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        {pickup.notes && (
          <p className="text-text-secondary text-xs mt-1">{pickup.notes}</p>
        )}
      </div>

      {/* Status badge */}
      <span
        className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
          STATUS_STYLES[pickup.status] ?? STATUS_STYLES.scheduled
        }`}
      >
        {pickup.status ? capitalize(pickup.status) : "Scheduled"}
      </span>
    </div>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="text-center py-16">
      <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <h3 className="font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-text-tertiary text-sm max-w-[280px] mx-auto">{message}</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

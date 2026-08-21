import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getWhere, addRecord, serverTimestamp } from "../../utils/firestore";

const STATUS_STYLES = {
  pending: "bg-yellow-50 text-status-pending border border-yellow-200",
  resolved: "bg-green-50 text-status-resolved border border-green-200",
  rejected: "bg-red-50 text-status-missed border border-red-200",
};

const REQUEST_TYPES = ["Missed Pickup", "Extra Pickup", "Damaged Bin", "Other"];

export default function ResidentRequests() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: REQUEST_TYPES[0], description: "" });

  async function fetchRequests() {
    if (!user) return;
    try {
      const data = await getWhere("requests", "userId", "==", user.uid);
      data.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      setRequests(data);
    } catch {
      setError("Could not load your requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.description.trim()) {
      setError("Please describe your request.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await addRecord("requests", {
        userId: user.uid,
        userName: profile?.name ?? "",
        userEmail: user.email,
        zone: profile?.zone ?? "",
        type: form.type,
        description: form.description.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSuccess("Your request has been submitted successfully.");
      setForm({ type: REQUEST_TYPES[0], description: "" });
      setShowForm(false);
      fetchRequests();
    } catch {
      setError("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">My Requests</h2>
          <p className="text-text-tertiary text-sm mt-1">
            Submit and track your service requests
          </p>
        </div>
        <button
          id="new-request-btn"
          onClick={() => { setShowForm((v) => !v); setError(""); setSuccess(""); }}
          className="px-4 py-2 rounded-control bg-accent hover:bg-accent-hover text-white text-sm font-medium transition"
        >
          {showForm ? "Cancel" : "+ New Request"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 rounded-control bg-red-50 border border-red-200 text-status-missed text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-control bg-green-50 border border-green-200 text-status-resolved text-sm">
          {success}
        </div>
      )}

      {/* New Request Form */}
      {showForm && (
        <div className="mb-6 bg-surface border border-border-subtle rounded-card shadow-card p-5">
          <h3 className="font-medium text-text-primary mb-4">New service request</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="req-type" className="block text-sm font-medium text-text-secondary mb-1.5">
                Request type
              </label>
              <select
                id="req-type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
              >
                {REQUEST_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="req-desc" className="block text-sm font-medium text-text-secondary mb-1.5">
                Description <span className="text-status-missed">*</span>
              </label>
              <textarea
                id="req-desc"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                placeholder="Describe the issue in detail…"
                className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-control border border-border-default text-text-secondary text-sm hover:bg-surface2 transition"
              >
                Cancel
              </button>
              <button
                id="req-submit"
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-control bg-accent hover:bg-accent-hover text-white text-sm font-medium transition disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <h3 className="font-medium text-text-primary mb-1">No requests yet</h3>
          <p className="text-text-tertiary text-sm">Use the button above to submit your first request.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request }) {
  const date = request.createdAt?.toDate?.()
    ? request.createdAt.toDate()
    : request.createdAt
    ? new Date(request.createdAt)
    : null;

  const status = request.status ?? "pending";

  return (
    <div className="bg-surface border border-border-subtle rounded-card shadow-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-text-primary text-sm">{request.type}</span>
          </div>
          <p className="text-text-secondary text-sm mt-1">{request.description}</p>
          {date && (
            <p className="text-text-tertiary text-xs mt-1.5">
              Submitted{" "}
              {date.toLocaleDateString("en-BD", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
          {request.adminNote && (
            <div className="mt-2 p-2 bg-surface2 rounded-control text-xs text-text-secondary">
              <span className="font-medium">Admin note:</span> {request.adminNote}
            </div>
          )}
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
            STATUS_STYLES[status] ?? STATUS_STYLES.pending
          }`}
        >
          {capitalize(status)}
        </span>
      </div>
    </div>
  );
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

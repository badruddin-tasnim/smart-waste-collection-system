import { useEffect, useState } from "react";
import { getAll, getWhere } from "../../utils/firestore";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminResidents() {
  const [residents, setResidents] = useState([]);
  const [zones, setZones] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function fetchData() {
    try {
      const [users, zoneList] = await Promise.all([
        getWhere("users", "role", "==", "resident"),
        getAll("zones"),
      ]);
      setResidents(users);
      const zMap = {};
      zoneList.forEach((z) => (zMap[z.id] = z.name));
      setZones(zMap);
    } catch {
      setError("Failed to load residents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Remove this resident's profile? Their Auth account will remain.")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setResidents((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete resident.");
    }
  }

  async function handleZoneChange(residentId, newZone) {
    try {
      await updateDoc(doc(db, "users", residentId), { zone: newZone });
      setResidents((prev) =>
        prev.map((r) => (r.id === residentId ? { ...r, zone: newZone } : r))
      );
    } catch {
      setError("Failed to update zone.");
    }
  }

  const filtered = residents.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Residents</h2>
        <p className="text-text-tertiary text-sm mt-1">
          {residents.length} registered resident{residents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-control bg-red-50 border border-red-200 text-status-missed text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          id="residents-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full max-w-sm px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-tertiary text-sm">
          {search ? "No residents match your search." : "No residents registered yet."}
        </div>
      ) : (
        <div className="bg-surface border border-border-subtle rounded-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface2">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Email</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Zone</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <ResidentRow
                  key={r.id}
                  resident={r}
                  zones={zones}
                  isLast={idx === filtered.length - 1}
                  onDelete={handleDelete}
                  onZoneChange={handleZoneChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ResidentRow({ resident, zones, isLast, onDelete, onZoneChange }) {
  const joined = resident.createdAt?.toDate?.()
    ? resident.createdAt.toDate()
    : resident.createdAt
    ? new Date(resident.createdAt)
    : null;

  return (
    <tr className={`hover:bg-surface2 transition ${!isLast ? "border-b border-border-subtle" : ""}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center justify-center shrink-0">
            {(resident.name ?? resident.email ?? "?")[0].toUpperCase()}
          </div>
          <span className="font-medium text-text-primary">{resident.name || "—"}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-text-secondary">{resident.email}</td>
      <td className="px-4 py-3 text-text-secondary">{resident.phone || "—"}</td>
      <td className="px-4 py-3">
        <select
          value={resident.zone ?? ""}
          onChange={(e) => onZoneChange(resident.id, e.target.value)}
          className="px-2 py-1 rounded-control border border-border-default bg-base text-text-primary text-xs focus:outline-none focus:border-accent transition"
        >
          <option value="">No zone</option>
          {Object.entries(zones).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-text-tertiary text-xs">
        {joined
          ? joined.toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" })
          : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onDelete(resident.id)}
          className="text-xs text-status-missed hover:underline"
          title="Remove resident"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

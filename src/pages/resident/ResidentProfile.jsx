import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../utils/auth";
import { getAll } from "../../utils/firestore";
import { useEffect } from "react";

export default function ResidentProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Pre-fill form once profile is loaded
  useEffect(() => {
    if (profile && !form) {
      setForm({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        zone: profile.zone ?? "",
      });
    }
  }, [profile, form]);

  useEffect(() => {
    getAll("zones").then(setZones).catch(() => setZones([]));
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        zone: form.zone,
      });
      setSuccess("Profile updated successfully.");
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }

  if (!form) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">My Profile</h2>
        <p className="text-text-tertiary text-sm mt-1">Manage your account details</p>
      </div>

      {/* Avatar + name block */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white text-xl font-semibold select-none">
          {(profile?.name ?? user?.email ?? "?")[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-text-primary">{profile?.name ?? "—"}</p>
          <p className="text-text-tertiary text-sm">{user?.email}</p>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium mt-0.5">
            Resident
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-surface border border-border-subtle rounded-card shadow-card p-5">
        <h3 className="font-medium text-text-primary mb-4">Edit details</h3>

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

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-text-secondary mb-1.5">
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-text-secondary mb-1.5">
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full px-3 py-2 rounded-control border border-border-subtle bg-surface2 text-text-tertiary text-sm cursor-not-allowed"
            />
            <p className="text-text-tertiary text-xs mt-1">Email cannot be changed here.</p>
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-sm font-medium text-text-secondary mb-1.5">
              Phone number
            </label>
            <input
              id="profile-phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+880 1X-XXXX-XXXX"
              className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
            />
          </div>

          <div>
            <label htmlFor="profile-address" className="block text-sm font-medium text-text-secondary mb-1.5">
              Home address
            </label>
            <input
              id="profile-address"
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
            />
          </div>

          <div>
            <label htmlFor="profile-zone" className="block text-sm font-medium text-text-secondary mb-1.5">
              Collection zone
            </label>
            <select
              id="profile-zone"
              name="zone"
              value={form.zone}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
            >
              <option value="">— No zone selected —</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-1">
            <button
              id="profile-save"
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-control bg-accent hover:bg-accent-hover text-white text-sm font-medium transition disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="mt-6 pt-6 border-t border-border-subtle">
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="px-4 py-2 rounded-control border border-status-missed text-status-missed hover:bg-red-50 text-sm transition"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

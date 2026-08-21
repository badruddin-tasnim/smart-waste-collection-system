import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerResident } from "../utils/auth";
import { getAll } from "../utils/firestore";

export default function Register() {
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    zone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAll("zones")
      .then(setZones)
      .catch(() => setZones([]));
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerResident({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        zone: form.zone,
      });
      navigate("/resident/schedule");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">Smart Waste</h1>
          <p className="text-text-tertiary text-sm mt-1">Rajshahi City Corporation</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border-subtle rounded-modal shadow-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-5">Create your account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-control bg-red-50 border border-red-200 text-status-missed text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full name */}
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-text-secondary mb-1.5">
                Full name <span className="text-status-missed">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Farhan Ahmed"
                className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-text-secondary mb-1.5">
                Email address <span className="text-status-missed">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-text-secondary mb-1.5">
                Phone number
              </label>
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+880 1X-XXXX-XXXX"
                className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="reg-address" className="block text-sm font-medium text-text-secondary mb-1.5">
                Home address
              </label>
              <input
                id="reg-address"
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="House 12, Road 4, Rajshahi"
                className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
              />
            </div>

            {/* Zone */}
            <div>
              <label htmlFor="reg-zone" className="block text-sm font-medium text-text-secondary mb-1.5">
                Collection zone
              </label>
              <select
                id="reg-zone"
                name="zone"
                value={form.zone}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
              >
                <option value="">Select your zone (optional)</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-text-secondary mb-1.5">
                Password <span className="text-status-missed">*</span>
              </label>
              <input
                id="reg-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-text-secondary mb-1.5">
                Confirm password <span className="text-status-missed">*</span>
              </label>
              <input
                id="reg-confirm"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter your password"
                className="w-full px-3 py-2 rounded-control border border-border-default bg-base text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-control bg-accent hover:bg-accent-hover text-white font-medium text-sm transition disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-tertiary mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Registration failed. Please try again.";
  }
}

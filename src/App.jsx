import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './components/layout/AdminSidebar';
import ResidentNav from './components/layout/ResidentNav';
import { RequireAuth } from './components/auth/RequireAuth';

// Auth pages (Member 3)
import Login from './pages/Login';
import Register from './pages/Register';

// Resident pages (Member 3)
import ResidentSchedule from './pages/resident/ResidentSchedule';
import ResidentRequests from './pages/resident/ResidentRequests';
import ResidentProfile from './pages/resident/ResidentProfile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminResidents from './pages/admin/AdminResidents';

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[50vh]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-text-tertiary">Coming soon</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Resident routes — requires auth with role=resident */}
        <Route
          path="/resident"
          element={
            <RequireAuth role="resident">
              <ResidentNav />
            </RequireAuth>
          }
        >
          <Route path="schedule" element={<ResidentSchedule />} />
          <Route path="requests" element={<ResidentRequests />} />
          <Route path="profile" element={<ResidentProfile />} />
        </Route>

        {/* Admin routes — requires auth with role=admin */}
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminSidebar />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="zones" element={<Placeholder title="Zones Management" />} />
          <Route path="routes" element={<Placeholder title="Routes Management" />} />
          <Route path="pickups" element={<Placeholder title="Pickups" />} />
          <Route path="requests" element={<Placeholder title="Resident Requests" />} />
          <Route path="residents" element={<AdminResidents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

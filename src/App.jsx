import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './components/layout/AdminSidebar';
import ResidentNav from './components/layout/ResidentNav';
import ResidentSchedule from './pages/resident/Schedule';
import ResidentRequests from './pages/resident/Requests';
import AdminPickups from './pages/admin/Pickups';
import AdminRequests from './pages/admin/Requests';

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
        <Route path="/login" element={<Placeholder title="Login" />} />
        <Route path="/register" element={<Placeholder title="Register" />} />

        {/* Resident routes */}
        <Route path="/resident" element={<ResidentNav />}>
          <Route path="schedule" element={<ResidentSchedule />} />
          <Route path="requests" element={<ResidentRequests />} />
          <Route path="profile" element={<Placeholder title="My Profile" />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminSidebar />}>
          <Route path="dashboard" element={<Placeholder title="Admin Dashboard" />} />
          <Route path="zones" element={<Placeholder title="Zones Management" />} />
          <Route path="routes" element={<Placeholder title="Routes Management" />} />
          <Route path="pickups" element={<AdminPickups />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="residents" element={<Placeholder title="Residents List" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './components/layout/AdminSidebar';
import ResidentNav from './components/layout/ResidentNav';
import Zones from './pages/admin/Zones';
import RoutesPage from './pages/admin/Routes';

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
          <Route path="schedule" element={<Placeholder title="My Schedule" />} />
          <Route path="requests" element={<Placeholder title="My Requests" />} />
          <Route path="profile" element={<Placeholder title="My Profile" />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminSidebar />}>
          <Route path="dashboard" element={<Placeholder title="Admin Dashboard" />} />
          <Route path="zones" element={<Zones />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="pickups" element={<Placeholder title="Pickups" />} />
          <Route path="requests" element={<Placeholder title="Resident Requests" />} />
          <Route path="residents" element={<Placeholder title="Residents List" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

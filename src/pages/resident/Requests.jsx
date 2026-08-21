import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { getById } from '../../utils/firestore';
import { getRequestsByResident, addRequest, getAllRequests } from '../../utils/requests';
import { getPickupsByZone, getAllPickups } from '../../utils/pickups';
import RequestTable from '../../components/requests/RequestTable';
import RequestForm from '../../components/requests/RequestForm';

export default function ResidentRequests() {
  const [requests, setRequests] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('missed_pickup'); // 'missed_pickup' | 'special_pickup'

  const user = auth.currentUser;
  const currentUid = user?.uid || 'guest-resident';
  const currentName = user?.displayName || user?.email || 'Resident User';

  const fetchRequests = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile for zoneId
      let userZoneId = '';
      if (user) {
        const profile = await getById('users', user.uid);
        if (profile?.zoneId) userZoneId = profile.zoneId;
      }

      // Fetch resident's zone pickups for missed pickup selection
      const zonePickups = userZoneId ? await getPickupsByZone(userZoneId) : await getAllPickups();
      setPickups(zonePickups);

      // Fetch requests for this resident (or all requests in fallback mode)
      let items = await getRequestsByResident(currentUid);
      if (items.length === 0 && !user) {
        items = await getAllRequests();
      }

      // Sort by creation date descending
      items.sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
      });

      setRequests(items);
    } catch (err) {
      console.error('Error loading resident requests:', err);
      setError(err.message || 'Failed to load service requests.');
    } finally {
      setLoading(false);
    }
  }, [currentUid, user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openForm = (mode) => {
    setFormMode(mode);
    setIsModalOpen(true);
  };

  const handleCreateRequest = async (formData) => {
    try {
      setError(null);
      await addRequest({
        ...formData,
        residentId: currentUid,
        residentName: currentName,
      });

      setSuccessMessage('Your request has been submitted successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to submit request:', err);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">My Service Requests</h1>
          <p className="text-sm text-text-secondary mt-1">
            Report missed collections or schedule special bulk waste pickups.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openForm('missed_pickup')}
            className="px-3.5 py-2 text-xs font-medium text-status-missed bg-rose-50 hover:bg-rose-100 rounded-control border border-rose-200 transition-colors flex items-center gap-1.5"
          >
            ⚠️ Report Missed Pickup
          </button>
          <button
            onClick={() => openForm('special_pickup')}
            className="px-3.5 py-2 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-control shadow-sm transition-colors flex items-center gap-1.5"
          >
            🚚 Request Special Pickup
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-card bg-rose-50 border border-rose-200 text-status-missed text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-card bg-emerald-50 border border-emerald-200 text-status-resolved text-sm font-medium">
          ✓ {successMessage}
        </div>
      )}

      {/* Requests Table */}
      <RequestTable
        requests={requests}
        loading={loading}
        isAdminView={false}
      />

      {/* Request Form Modal */}
      <RequestForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={formMode}
        onSubmit={handleCreateRequest}
        recentPickups={pickups}
      />
    </div>
  );
}

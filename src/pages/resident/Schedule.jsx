import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { getById, getAll } from '../../utils/firestore';
import { getPickupsByZone, getAllPickups } from '../../utils/pickups';
import PickupTable from '../../components/schedule/PickupTable';

export default function Schedule() {
  const [pickups, setPickups] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch zones for selector dropdown if needed
        const zoneList = await getAll('zones');
        setZones(zoneList);

        let userZoneId = '';
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getById('users', user.uid);
          if (userDoc && userDoc.zoneId) {
            userZoneId = userDoc.zoneId;
          }
        }

        // If no user zone found, default to first available zone
        if (!userZoneId && zoneList.length > 0) {
          userZoneId = zoneList[0].id;
        }

        setSelectedZoneId(userZoneId);

        let items = [];
        if (userZoneId) {
          items = await getPickupsByZone(userZoneId);
        } else {
          items = await getAllPickups();
        }

        // Sort by date ascending
        items.sort((a, b) => new Date(a.date) - new Date(b.date));
        setPickups(items);
      } catch (err) {
        console.error('Error loading schedule:', err);
        setError(err.message || 'Failed to load pickup schedules.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleZoneChange = async (zoneId) => {
    setSelectedZoneId(zoneId);
    try {
      setLoading(true);
      const items = zoneId ? await getPickupsByZone(zoneId) : await getAllPickups();
      items.sort((a, b) => new Date(a.date) - new Date(b.date));
      setPickups(items);
    } catch (err) {
      console.error('Error fetching zone pickups:', err);
      setError(err.message || 'Failed to update schedule view.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPickups = pickups.filter(p => {
    if (activeTab === 'All') return true;
    return (p.status || 'Scheduled') === activeTab;
  });

  const nextPickup = pickups.find(p => p.status === 'Scheduled');

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Pickup Schedule</h1>
          <p className="text-sm text-text-secondary mt-1">
            View upcoming waste collection dates and historical pickup status for your area.
          </p>
        </div>

        {/* Zone Selector */}
        {zones.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-tertiary">Zone:</span>
            <select
              value={selectedZoneId}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="px-3 py-1.5 bg-surface border border-border rounded-control text-sm text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name || z.code || z.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-card bg-rose-50 border border-rose-200 text-status-missed text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border-subtle rounded-card p-4 shadow-card">
          <div className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Next Scheduled</div>
          <div className="text-xl font-semibold text-text-primary mt-1">
            {nextPickup ? `${nextPickup.date}` : 'None'}
          </div>
          {nextPickup && (
            <div className="text-xs text-accent mt-0.5 font-medium">{nextPickup.time || '08:00 AM'}</div>
          )}
        </div>

        <div className="bg-surface border border-border-subtle rounded-card p-4 shadow-card">
          <div className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Total Scheduled</div>
          <div className="text-xl font-semibold text-text-primary mt-1">
            {pickups.filter(p => p.status === 'Scheduled').length}
          </div>
          <div className="text-xs text-text-tertiary mt-0.5">Upcoming collections</div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-card p-4 shadow-card">
          <div className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Completed / Missed</div>
          <div className="text-xl font-semibold text-text-primary mt-1">
            <span className="text-status-resolved">{pickups.filter(p => p.status === 'Collected').length}</span>
            <span className="text-text-tertiary mx-1">/</span>
            <span className="text-status-missed">{pickups.filter(p => p.status === 'Missed').length}</span>
          </div>
          <div className="text-xs text-text-tertiary mt-0.5">Collected vs Missed</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        {['All', 'Scheduled', 'Collected', 'Missed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-control transition-colors ${
              activeTab === tab
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface2'
            }`}
          >
            {tab} ({tab === 'All' ? pickups.length : pickups.filter(p => (p.status || 'Scheduled') === tab).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <PickupTable
        pickups={filteredPickups}
        loading={loading}
        isAdminView={false}
      />
    </div>
  );
}

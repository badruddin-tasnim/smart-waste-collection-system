import React, { useState, useEffect } from 'react';
import { getAll } from '../../utils/firestore';
import {
  getAllPickups, updatePickupStatus, deletePickup, generateRoutePickups, addPickup
} from '../../utils/pickups';
import PickupTable from '../../components/schedule/PickupTable';

export default function AdminPickups() {
  const [pickups, setPickups] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');

  // Generator modal state
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [genCount, setGenCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPickup, setNewPickup] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "08:00 AM",
    zoneId: "",
    routeId: "",
    status: "Scheduled"
  });

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pickupList, routeList, zoneList] = await Promise.all([
        getAllPickups(),
        getAll('routes'),
        getAll('zones'),
      ]);

      // Sort by date descending
      pickupList.sort((a, b) => new Date(b.date) - new Date(a.date));

      setPickups(pickupList);
      setRoutes(routeList);
      setZones(zoneList);

      if (routeList.length > 0 && !selectedRouteId) {
        setSelectedRouteId(routeList[0].id);
      }
    } catch (err) {
      console.error('Error loading admin pickups:', err);
      setError(err.message || 'Failed to load pickups data.');
    } finally {
      setLoading(false);
    }
  }, [selectedRouteId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updatePickupStatus(id, newStatus);
      setPickups(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update pickup status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pickup record?')) return;
    try {
      await deletePickup(id);
      setPickups(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete pickup:', err);
      setError('Failed to delete pickup.');
    }
  };

  const handleGeneratePickups = async (e) => {
    e.preventDefault();
    setError(null);

    const targetRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
    if (!targetRoute) {
      // Fallback dummy route if no routes exist yet
      const dummyRoute = {
        id: 'RT-DEFAULT',
        code: 'RT-001',
        zoneId: zones[0]?.id || 'Z-01',
        zoneName: zones[0]?.name || 'Central Zone',
        days: ['Monday', 'Thursday'],
        time: '08:00 AM'
      };
      return runGenerator(dummyRoute);
    }

    await runGenerator(targetRoute);
  };

  const runGenerator = async (routeObj) => {
    try {
      setIsGenerating(true);
      const generated = await generateRoutePickups(routeObj, Number(genCount));
      setSuccessMessage(`Successfully generated ${generated.length} upcoming pickups for route ${routeObj.code || 'selected route'}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsGenModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to generate pickups:', err);
      setError(err.message || 'Failed to generate pickups.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateSinglePickup = async (e) => {
    e.preventDefault();
    try {
      const selectedZone = zones.find(z => z.id === newPickup.zoneId);
      const selectedRoute = routes.find(r => r.id === newPickup.routeId);

      await addPickup({
        ...newPickup,
        zoneName: selectedZone?.name || selectedZone?.code || 'Zone',
        routeCode: selectedRoute?.code || selectedRoute?.name || 'RT-MANUAL',
      });

      setSuccessMessage('New pickup created successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsAddModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create single pickup:', err);
      setError(err.message || 'Failed to create pickup.');
    }
  };

  const filteredPickups = pickups.filter(p => {
    const matchesStatus = statusFilter === 'All' || (p.status || 'Scheduled') === statusFilter;
    const matchesZone = zoneFilter === 'All' || p.zoneId === zoneFilter;
    return matchesStatus && matchesZone;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Pickups Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Monitor and manage collection schedules, update pickup statuses, and generate route schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-text-primary bg-surface hover:bg-surface2 rounded-control border border-border-subtle transition-colors"
          >
            + Add Pickup
          </button>
          <button
            onClick={() => setIsGenModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-control shadow-sm transition-colors flex items-center gap-1.5"
          >
            ⚡ Generate Pickups
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

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-3 rounded-card border border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-tertiary">Status:</span>
          {['All', 'Scheduled', 'Collected', 'Missed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 text-xs font-medium rounded-control transition-colors ${
                statusFilter === status
                  ? 'bg-accent text-white'
                  : 'bg-base text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {zones.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-tertiary">Filter Zone:</span>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-2.5 py-1 bg-base border border-border rounded-control text-xs text-text-primary focus:outline-none"
            >
              <option value="All">All Zones</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name || z.code || z.id}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pickups Table */}
      <PickupTable
        pickups={filteredPickups}
        loading={loading}
        isAdminView={true}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />

      {/* Generate Pickups Modal */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-base border border-border rounded-modal shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-surface border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">⚡ Generate Pickups Utility</h2>
              <button onClick={() => setIsGenModalOpen(false)} className="text-text-tertiary hover:text-text-primary text-xl">✕</button>
            </div>
            <form onSubmit={handleGeneratePickups} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Target Route</label>
                {routes.length > 0 ? (
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="w-full px-3 py-2 bg-base border border-border rounded-control text-sm text-text-primary"
                  >
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.code || r.name || r.id} — {r.days ? (Array.isArray(r.days) ? r.days.join(', ') : r.days) : 'Mon/Wed/Fri'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-text-tertiary bg-surface p-2.5 rounded border border-border-subtle">
                    No routes found. Generator will automatically create sample route pickups.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Number of Pickups to Generate</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={genCount}
                  onChange={(e) => setGenCount(e.target.value)}
                  className="w-full px-3 py-2 bg-base border border-border rounded-control text-sm text-text-primary"
                />
                <p className="text-xs text-text-tertiary mt-1">Generates upcoming scheduled dates based on route frequency.</p>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGenModalOpen(false)}
                  className="px-4 py-2 text-sm text-text-secondary bg-surface hover:bg-surface2 rounded-control border border-border-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 text-sm text-white bg-accent hover:bg-accent-hover rounded-control shadow font-medium"
                >
                  {isGenerating ? 'Generating...' : 'Generate Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-base border border-border rounded-modal shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-surface border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Add Scheduled Pickup</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-tertiary hover:text-text-primary text-xl">✕</button>
            </div>
            <form onSubmit={handleCreateSinglePickup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Pickup Date</label>
                <input
                  type="date"
                  required
                  value={newPickup.date}
                  onChange={(e) => setNewPickup({ ...newPickup, date: e.target.value })}
                  className="w-full px-3 py-2 bg-base border border-border rounded-control text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Time</label>
                <input
                  type="text"
                  value={newPickup.time}
                  onChange={(e) => setNewPickup({ ...newPickup, time: e.target.value })}
                  placeholder="e.g. 08:00 AM"
                  className="w-full px-3 py-2 bg-base border border-border rounded-control text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Zone</label>
                <select
                  value={newPickup.zoneId}
                  onChange={(e) => setNewPickup({ ...newPickup, zoneId: e.target.value })}
                  className="w-full px-3 py-2 bg-base border border-border rounded-control text-sm"
                >
                  <option value="">-- Select Zone --</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name || z.code || z.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Route</label>
                <select
                  value={newPickup.routeId}
                  onChange={(e) => setNewPickup({ ...newPickup, routeId: e.target.value })}
                  className="w-full px-3 py-2 bg-base border border-border rounded-control text-sm"
                >
                  <option value="">-- Select Route --</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.code || r.name || r.id}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-text-secondary bg-surface rounded-control border border-border-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-accent hover:bg-accent-hover rounded-control font-medium"
                >
                  Save Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

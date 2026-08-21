import React, { useState, useEffect } from 'react';
import { getAllRequests, updateRequestStatus, deleteRequest } from '../../utils/requests';
import { getAll } from '../../utils/firestore';
import RequestTable from '../../components/requests/RequestTable';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Pending' | 'Resolved'
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'missed_pickup' | 'special_pickup'
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqList, userList] = await Promise.all([
        getAllRequests(),
        getAll('users'),
      ]);

      // Create a user lookup map for residentId -> user name
      const userMap = {};
      userList.forEach(u => {
        userMap[u.id] = u.name || u.displayName || u.email || 'Resident';
      });

      // Enrich requests with resolved resident names if missing
      const enriched = reqList.map(r => ({
        ...r,
        residentName: r.residentName || userMap[r.residentId] || 'Resident User'
      }));

      // Sort descending by creation timestamp
      enriched.sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
      });

      setRequests(enriched);
    } catch (err) {
      console.error('Error loading admin requests:', err);
      setError(err.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRequestStatus(id, newStatus);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      setSuccessMessage(`Request status updated to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update request status:', err);
      setError('Failed to update request status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request record?')) return;
    try {
      await deleteRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete request:', err);
      setError('Failed to delete request.');
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesType = typeFilter === 'All' || r.type === typeFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      (r.code && r.code.toLowerCase().includes(query)) ||
      (r.residentName && r.residentName.toLowerCase().includes(query)) ||
      (r.description && r.description.toLowerCase().includes(query));

    return matchesStatus && matchesType && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const resolvedCount = requests.filter(r => r.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Resident Requests</h1>
          <p className="text-sm text-text-secondary mt-1">
            Review missed pickup reports and special collection requests submitted by residents.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-control text-xs font-medium text-status-pending">
            ⏳ {pendingCount} Pending
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-control text-xs font-medium text-status-resolved">
            ✓ {resolvedCount} Resolved
          </div>
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

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-3.5 rounded-card border border-border-subtle">
        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-medium text-text-tertiary">Status:</span>
          {['All', 'Pending', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-control transition-colors ${
                statusFilter === st
                  ? 'bg-accent text-white'
                  : 'bg-base text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Type Filter & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-base border border-border rounded-control text-xs text-text-primary focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="missed_pickup">Missed Pickups</option>
            <option value="special_pickup">Special Pickups</option>
          </select>

          <input
            type="text"
            placeholder="Search resident, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 bg-base border border-border rounded-control text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent w-48"
          />
        </div>
      </div>

      {/* Table */}
      <RequestTable
        requests={filteredRequests}
        loading={loading}
        isAdminView={true}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}

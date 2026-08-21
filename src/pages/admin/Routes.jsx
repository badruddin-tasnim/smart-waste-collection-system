import { useState, useEffect, useCallback, useMemo } from 'react';
import { getRoutes, createRoute, updateRoute, deleteRoute } from '../../utils/routes';
import { getZones } from '../../utils/zones';
import RouteTable from '../../components/routes/RouteTable';
import RouteForm from '../../components/routes/RouteForm';

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [zoneFilter, setZoneFilter] = useState('ALL');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedRoutes, fetchedZones] = await Promise.all([
        getRoutes(),
        getZones()
      ]);
      setRoutes(fetchedRoutes);
      setZones(fetchedZones);
    } catch (err) {
      setError(err.message || 'Failed to load routes data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateOrUpdate = async (data) => {
    try {
      setError(null);
      if (editingRoute) {
        await updateRoute(editingRoute.id, data);
      } else {
        await createRoute(data);
      }
      setIsFormOpen(false);
      setEditingRoute(null);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save route');
    }
  };

  const handleDelete = async (route) => {
    try {
      setError(null);
      if (window.confirm(`Are you sure you want to delete route ${route.code}?`)) {
        await deleteRoute(route.id);
        await fetchData();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete route');
    }
  };

  const openNewForm = () => {
    if (zones.length === 0) {
      alert("You need to create at least one zone before creating a route.");
      return;
    }
    setEditingRoute(null);
    setIsFormOpen(true);
  };

  const filteredRoutes = useMemo(() => {
    if (zoneFilter === 'ALL') return routes;
    return routes.filter(r => r.zoneId === zoneFilter);
  }, [routes, zoneFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[32px] font-semibold">Routes</h1>
        <button
          onClick={openNewForm}
          className="px-4 py-2 text-sm font-medium border border-transparent rounded-control bg-accent text-base hover:bg-accent-hover transition-colors"
        >
          New Route
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-text-secondary">Filter by Zone:</label>
        <select 
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="bg-base border border-border-default rounded-control px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="ALL">All Zones</option>
          {zones.map(z => (
            <option key={z.id} value={z.id}>{z.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-status-missed/10 border border-status-missed/30 text-status-missed px-4 py-3 rounded-card mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-text-secondary">Loading routes...</div>
      ) : (
        <RouteTable 
          routes={filteredRoutes} 
          zones={zones}
          onEdit={(r) => { setEditingRoute(r); setIsFormOpen(true); }}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <RouteForm
          initialData={editingRoute}
          zones={zones}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => { setIsFormOpen(false); setEditingRoute(null); }}
        />
      )}
    </div>
  );
}

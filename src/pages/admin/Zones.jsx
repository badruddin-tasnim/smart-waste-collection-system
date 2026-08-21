import { useState, useEffect, useCallback } from 'react';
import { getZones, createZone, updateZone, deleteZone } from '../../utils/zones';
import { getRoutesByZone } from '../../utils/routes';
import ZoneTable from '../../components/zones/ZoneTable';
import ZoneForm from '../../components/zones/ZoneForm';

export default function Zones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getZones();
      setZones(data);
    } catch (err) {
      setError(err.message || 'Failed to load zones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleCreateOrUpdate = async (data) => {
    try {
      setError(null);
      if (editingZone) {
        await updateZone(editingZone.id, data);
      } else {
        await createZone(data);
      }
      setIsFormOpen(false);
      setEditingZone(null);
      await fetchZones();
    } catch (err) {
      setError(err.message || 'Failed to save zone');
    }
  };

  const handleDelete = async (zone) => {
    try {
      setError(null);
      const routes = await getRoutesByZone(zone.id);
      if (routes.length > 0) {
        setError(`Cannot delete zone "${zone.name}" because it has ${routes.length} route(s) assigned.`);
        return;
      }
      if (window.confirm(`Are you sure you want to delete ${zone.name}?`)) {
        await deleteZone(zone.id);
        await fetchZones();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete zone');
    }
  };

  const openNewForm = () => {
    setEditingZone(null);
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[32px] font-semibold">Zones</h1>
        <button
          onClick={openNewForm}
          className="px-4 py-2 text-sm font-medium border border-transparent rounded-control bg-accent text-base hover:bg-accent-hover transition-colors"
        >
          New Zone
        </button>
      </div>

      {error && (
        <div className="bg-status-missed/10 border border-status-missed/30 text-status-missed px-4 py-3 rounded-card mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-text-secondary">Loading zones...</div>
      ) : (
        <ZoneTable 
          zones={zones} 
          onEdit={(z) => { setEditingZone(z); setIsFormOpen(true); }}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <ZoneForm
          initialData={editingZone}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => { setIsFormOpen(false); setEditingZone(null); }}
        />
      )}
    </div>
  );
}

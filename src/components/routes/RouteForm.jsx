import { useState, useEffect } from 'react';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function RouteForm({ initialData, zones, onSubmit, onCancel }) {
  const [zoneId, setZoneId] = useState('');
  const [crewName, setCrewName] = useState('');
  const [truckId, setTruckId] = useState('');
  const [days, setDays] = useState([]);
  const [time, setTime] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (initialData) {
      setZoneId(initialData.zoneId || '');
      setCrewName(initialData.crewName || '');
      setTruckId(initialData.truckId || '');
      setDays(initialData.days || []);
      setTime(initialData.time || '');
      setStatus(initialData.status || 'active');
    } else {
      setZoneId(zones.length > 0 ? zones[0].id : '');
      setCrewName('');
      setTruckId('');
      setDays([]);
      setTime('');
      setStatus('active');
    }
  }, [initialData, zones]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (days.length === 0) {
      alert("Please select at least one day for the route.");
      return;
    }
    onSubmit({ zoneId, crewName, truckId, days, time, status });
  };

  const toggleDay = (day) => {
    setDays((prev) => 
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="fixed inset-0 bg-text-primary/20 flex items-center justify-center p-4 z-50">
      <div className="bg-base w-full max-w-lg rounded-modal shadow-card border border-border-subtle p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-[20px] font-semibold mb-6">
          {initialData ? 'Edit Route' : 'New Route'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary mb-1">
              Zone
            </label>
            <select
              required
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full bg-base border border-border-default rounded-control px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="" disabled>Select a zone...</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary mb-1">
                Crew Name
              </label>
              <input
                type="text"
                required
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                className="w-full bg-base border border-border-default rounded-control px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="e.g. Team Boalia-1"
              />
            </div>
            <div>
              <label className="block text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary mb-1">
                Truck ID
              </label>
              <input
                type="text"
                required
                value={truckId}
                onChange={(e) => setTruckId(e.target.value)}
                className="w-full bg-base border border-border-default rounded-control px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="e.g. RCC-TRK-04"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary mb-2">
              Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 text-sm font-medium border rounded-[4px] transition-colors ${
                    days.includes(day) 
                      ? 'bg-accent/10 border-accent/30 text-accent' 
                      : 'bg-base border-border-default text-text-secondary hover:bg-surface2'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary mb-1">
                Time
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-base border border-border-default rounded-control px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary mb-1">
                Status
              </label>
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-base border border-border-default rounded-control px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium border border-border-default rounded-control bg-base text-text-primary hover:bg-surface2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium border border-transparent rounded-control bg-accent text-base hover:bg-accent-hover transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

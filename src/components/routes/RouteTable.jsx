export default function RouteTable({ routes, zones, onEdit, onDelete }) {
  if (routes.length === 0) {
    return (
      <div className="text-center p-8 bg-surface border border-border-subtle rounded-card shadow-card">
        <p className="text-text-secondary mb-4">No routes yet. Create your first route to start scheduling pickups.</p>
      </div>
    );
  }

  const getZoneName = (zoneId) => {
    const zone = zones.find((z) => z.id === zoneId);
    return zone ? zone.name : 'Unknown';
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-card shadow-card overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="p-4 border-b border-border-subtle text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary">Code</th>
            <th className="p-4 border-b border-border-subtle text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary">Zone</th>
            <th className="p-4 border-b border-border-subtle text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary">Crew & Truck</th>
            <th className="p-4 border-b border-border-subtle text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary">Schedule</th>
            <th className="p-4 border-b border-border-subtle text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary">Status</th>
            <th className="p-4 border-b border-border-subtle text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route.id} className="hover:bg-surface2 transition-colors border-b border-border-subtle last:border-0">
              <td className="p-4">
                <span className="font-mono text-[12px] px-2 py-[2px] border border-border-default rounded-[4px] bg-surface text-text-secondary">
                  {route.code}
                </span>
              </td>
              <td className="p-4 font-medium">{getZoneName(route.zoneId)}</td>
              <td className="p-4 text-text-secondary">
                <div className="flex flex-col">
                  <span>{route.crewName}</span>
                  <span className="font-mono text-[12px]">{route.truckId}</span>
                </div>
              </td>
              <td className="p-4 text-text-secondary">
                {route.days?.join(', ')} @ {route.time}
              </td>
              <td className="p-4">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  route.status === 'active' 
                    ? 'bg-status-resolved/10 text-status-resolved' 
                    : 'bg-status-scheduled/10 text-status-scheduled'
                }`}>
                  {route.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button onClick={() => onEdit(route)} className="text-text-secondary hover:text-accent text-sm font-medium">Edit</button>
                  <button onClick={() => onDelete(route)} className="text-status-missed hover:opacity-80 text-sm font-medium">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

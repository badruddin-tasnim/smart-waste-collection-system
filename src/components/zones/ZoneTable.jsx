export default function ZoneTable({ zones, onEdit, onDelete }) {
  if (zones.length === 0) {
    return (
      <div className="text-center p-8 bg-surface border border-border-subtle rounded-card shadow-card">
        <p className="text-text-secondary mb-4">No zones yet. Create your first zone to start scheduling pickups.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-card shadow-card overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="p-4 border-b border-border-subtle text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary">Code</th>
            <th className="p-4 border-b border-border-subtle text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary">Name</th>
            <th className="p-4 border-b border-border-subtle text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary">Description</th>
            <th className="p-4 border-b border-border-subtle text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.id} className="hover:bg-surface2 transition-colors border-b border-border-subtle last:border-0">
              <td className="p-4">
                <span className="font-mono text-[12px] px-2 py-[2px] border border-border-default rounded-[4px] bg-surface text-text-secondary">
                  {zone.code}
                </span>
              </td>
              <td className="p-4 font-medium">{zone.name}</td>
              <td className="p-4 text-text-secondary">{zone.description}</td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button onClick={() => onEdit(zone)} className="text-text-secondary hover:text-accent text-sm font-medium">Edit</button>
                  <button onClick={() => onDelete(zone)} className="text-status-missed hover:opacity-80 text-sm font-medium">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

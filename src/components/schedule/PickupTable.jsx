import React from 'react';

export default function PickupTable({
  pickups = [],
  loading = false,
  isAdminView = false,
  onStatusChange,
  onDelete
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Collected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-status-resolved border border-emerald-200">
            • Collected
          </span>
        );
      case 'Missed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-status-missed border border-rose-200">
            • Missed
          </span>
        );
      case 'Scheduled':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-status-scheduled border border-zinc-200">
            • Scheduled
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-base border border-border-subtle rounded-card p-8 text-center text-text-tertiary animate-pulse">
        Loading pickup schedules...
      </div>
    );
  }

  if (!pickups || pickups.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-card p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-surface2 text-text-tertiary flex items-center justify-center mx-auto mb-3">
          🗓️
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-1">No pickups scheduled</h3>
        <p className="text-sm text-text-secondary">There are currently no pickup records found for this view.</p>
      </div>
    );
  }

  return (
    <div className="bg-base border border-border-subtle rounded-card overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-surface border-b border-border-subtle text-text-secondary text-xs uppercase font-medium tracking-wider">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Route</th>
              <th className="py-3 px-4">Status</th>
              {isAdminView && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-text-primary">
            {pickups.map((pickup) => (
              <tr key={pickup.id} className="hover:bg-surface/50 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs">
                  <span className="px-2 py-1 rounded bg-surface2 text-text-secondary border border-border-subtle font-mono">
                    {pickup.code || 'PU-???'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-medium">
                  <div>{pickup.date}</div>
                  <div className="text-xs text-text-tertiary font-normal">{pickup.time || '08:00 AM'}</div>
                </td>
                <td className="py-3.5 px-4">
                  {pickup.zoneName || pickup.zoneId || 'Unassigned'}
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-surface2 text-text-secondary text-xs font-mono border border-border-subtle">
                    {pickup.routeCode || 'RT-MAIN'}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {getStatusBadge(pickup.status)}
                </td>
                {isAdminView && (
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {pickup.status !== 'Collected' && (
                        <button
                          onClick={() => onStatusChange && onStatusChange(pickup.id, 'Collected')}
                          className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-accent hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                        >
                          Mark Collected
                        </button>
                      )}
                      {pickup.status !== 'Missed' && (
                        <button
                          onClick={() => onStatusChange && onStatusChange(pickup.id, 'Missed')}
                          className="px-2.5 py-1 text-xs font-medium bg-rose-50 text-status-missed hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                        >
                          Mark Missed
                        </button>
                      )}
                      {pickup.status !== 'Scheduled' && (
                        <button
                          onClick={() => onStatusChange && onStatusChange(pickup.id, 'Scheduled')}
                          className="px-2.5 py-1 text-xs font-medium bg-surface2 text-text-secondary hover:bg-zinc-200 rounded border border-border-subtle transition-colors"
                        >
                          Reset
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(pickup.id)}
                          className="p-1 text-text-tertiary hover:text-status-missed transition-colors ml-1"
                          title="Delete pickup"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

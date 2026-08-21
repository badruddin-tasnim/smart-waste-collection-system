import React from 'react';

export default function RequestTable({
  requests = [],
  loading = false,
  isAdminView = false,
  onStatusChange,
  onDelete
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-status-resolved border border-emerald-200">
            ✓ Resolved
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-status-pending border border-amber-200">
            ⏳ Pending
          </span>
        );
    }
  };

  const getTypeBadge = (type) => {
    if (type === 'missed_pickup') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-status-missed border border-rose-100">
          Missed Pickup
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
        Special Pickup
      </span>
    );
  };

  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    if (typeof ts === 'string') return ts;
    if (ts.toDate && typeof ts.toDate === 'function') {
      return ts.toDate().toLocaleDateString();
    }
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleDateString();
    }
    return String(ts);
  };

  if (loading) {
    return (
      <div className="bg-base border border-border-subtle rounded-card p-8 text-center text-text-tertiary animate-pulse">
        Loading requests...
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-card p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-surface2 text-text-tertiary flex items-center justify-center mx-auto mb-3">
          📋
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-1">No requests found</h3>
        <p className="text-sm text-text-secondary">No submitted service requests match your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-base border border-border-subtle rounded-card overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-surface border-b border-border-subtle text-text-secondary text-xs uppercase font-medium tracking-wider">
              <th className="py-3 px-4">Request Code</th>
              {isAdminView && <th className="py-3 px-4">Resident</th>}
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Submitted</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-text-primary">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-surface/50 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs">
                  <span className="px-2 py-1 rounded bg-surface2 text-text-secondary border border-border-subtle font-mono">
                    {req.code || 'RQ-???'}
                  </span>
                </td>
                {isAdminView && (
                  <td className="py-3.5 px-4 font-medium">
                    {req.residentName || req.residentId || 'Anonymous'}
                  </td>
                )}
                <td className="py-3.5 px-4">
                  {getTypeBadge(req.type)}
                </td>
                <td className="py-3.5 px-4 max-w-xs truncate text-text-secondary" title={req.description}>
                  {req.description || 'No description provided'}
                  {req.preferredDate && (
                    <div className="text-xs text-text-tertiary mt-0.5">Pref. date: {req.preferredDate}</div>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {getStatusBadge(req.status)}
                </td>
                <td className="py-3.5 px-4 text-xs text-text-tertiary">
                  {formatDate(req.createdAt)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isAdminView ? (
                      <>
                        {req.status !== 'Resolved' ? (
                          <button
                            onClick={() => onStatusChange && onStatusChange(req.id, 'Resolved')}
                            className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-accent hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <button
                            onClick={() => onStatusChange && onStatusChange(req.id, 'Pending')}
                            className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-status-pending hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(req.id)}
                            className="p-1 text-text-tertiary hover:text-status-missed transition-colors ml-1"
                            title="Delete request"
                          >
                            🗑️
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-text-tertiary">
                        {req.status === 'Resolved' ? 'Completed' : 'Processing'}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

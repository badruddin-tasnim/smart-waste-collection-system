import React, { useState } from 'react';

export default function RequestForm({
  isOpen = false,
  onClose,
  mode = 'missed_pickup', // 'missed_pickup' | 'special_pickup'
  onSubmit,
  recentPickups = []
}) {
  const [selectedPickupId, setSelectedPickupId] = useState('');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'missed_pickup' && recentPickups.length > 0 && !selectedPickupId) {
      setError('Please select a scheduled pickup to report as missed.');
      return;
    }

    if (mode === 'special_pickup' && !description.trim()) {
      setError('Please provide details for your special pickup request.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        type: mode,
        pickupId: selectedPickupId || null,
        description,
        preferredDate: mode === 'special_pickup' ? preferredDate : null,
      });

      // Reset form
      setSelectedPickupId('');
      setDescription('');
      setPreferredDate('');
      onClose();
    } catch (err) {
      console.error('Failed to submit request:', err);
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMissed = mode === 'missed_pickup';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-base border border-border rounded-modal shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-surface border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            {isMissed ? '⚠️ Report Missed Pickup' : '🚚 Request Special Pickup'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary text-xl font-bold p-1 rounded hover:bg-surface2 transition-colors"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded bg-rose-50 border border-rose-200 text-status-missed text-sm font-medium">
              {error}
            </div>
          )}

          {isMissed ? (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Select Scheduled Pickup <span className="text-status-missed">*</span>
                </label>
                {recentPickups.length > 0 ? (
                  <select
                    value={selectedPickupId}
                    onChange={(e) => setSelectedPickupId(e.target.value)}
                    className="w-full px-3 py-2 bg-base border border-border rounded-control text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">-- Choose a pickup date --</option>
                    {recentPickups.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.date} ({p.time || '08:00 AM'}) — {p.code || 'PU'} [{p.status}]
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-text-tertiary bg-surface p-3 rounded border border-border-subtle">
                    No recent pickups found in your zone to select. You can still describe your missed collection below.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Bin was placed at curb by 7:00 AM, but trucks did not arrive..."
                  className="w-full px-3 py-2 bg-base border border-border rounded-control text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Items / Waste Description <span className="text-status-missed">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Bulky furniture, electronic waste, garden pruning debris..."
                  className="w-full px-3 py-2 bg-base border border-border rounded-control text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Preferred Pickup Date (Optional)
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 bg-base border border-border rounded-control text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </>
          )}

          {/* Footer actions */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-surface hover:bg-surface2 rounded-control border border-border-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-control shadow transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

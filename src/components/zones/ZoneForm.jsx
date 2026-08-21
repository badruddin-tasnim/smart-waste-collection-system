import { useState, useEffect } from 'react';

export default function ZoneForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description });
  };

  return (
    <div className="fixed inset-0 bg-text-primary/20 flex items-center justify-center p-4 z-50">
      <div className="bg-elevated w-full max-w-md rounded-modal shadow-card border border-border-subtle p-6">
        <h2 className="text-[20px] font-semibold mb-6">
          {initialData ? 'Edit Zone' : 'New Zone'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary mb-1">
              Zone Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-base border border-border-default rounded-control px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="e.g. Boalia"
            />
          </div>
          <div>
            <label className="block text-[12px] uppercase tracking-[0.04em] font-medium text-text-tertiary mb-1">
              Description
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-base border border-border-default rounded-control px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[100px]"
              placeholder="Zone description..."
            />
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

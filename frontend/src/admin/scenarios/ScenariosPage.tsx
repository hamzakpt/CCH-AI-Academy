import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FileText,
  Star,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { ScenarioEditModal, type Scenario } from './ScenarioEditModal';

interface Props {
  apiBase: string;
}

const FUNCTION_COLORS: Record<string, string> = {
  Commercial: 'bg-blue-50 text-blue-700',
  'Supply Chain': 'bg-emerald-50 text-emerald-700',
  Finance: 'bg-purple-50 text-purple-700',
  HR: 'bg-pink-50 text-pink-700',
  Legal: 'bg-amber-50 text-amber-700',
  'IT & Marketing': 'bg-cyan-50 text-cyan-700',
  Other: 'bg-gray-50 text-gray-700',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-green-50 text-green-700',
  Intermediate: 'bg-yellow-50 text-yellow-700',
  Advanced: 'bg-red-50 text-red-700',
};

export function ScenariosPage({ apiBase }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFunction, setFilterFunction] = useState('');

  // Modal state
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchScenarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/scenarios`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setScenarios(data);
    } catch (err) {
      setError('Failed to load scenarios');
      console.error('[ScenariosPage]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [apiBase]);

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${apiBase}/scenarios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      setScenarios((prev) => prev.filter((s) => s.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error('[ScenariosPage] Delete error:', err);
      alert('Failed to delete scenario');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSave = async (scenario: Scenario, isNew: boolean) => {
    try {
      const url = isNew ? `${apiBase}/scenarios` : `${apiBase}/scenarios/${scenario.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to save: ${res.status}`);
      }
      await fetchScenarios();
      setEditingScenario(null);
      setIsCreating(false);
    } catch (err: any) {
      console.error('[ScenariosPage] Save error:', err);
      throw err;
    }
  };

  // Filter scenarios
  const filteredScenarios = scenarios.filter((s) => {
    const matchesSearch =
      searchQuery === '' ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFunction = filterFunction === '' || s.function === filterFunction;
    return matchesSearch && matchesFunction;
  });

  const functions = [...new Set(scenarios.map((s) => s.function))];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-20" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <span className="text-red-700">{error}</span>
        <button onClick={fetchScenarios} className="ml-auto text-sm text-red-600 hover:underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20 focus:border-[#F40009]"
            />
          </div>

          {/* Filter */}
          <select
            value={filterFunction}
            onChange={(e) => setFilterFunction(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
          >
            <option value="">All Functions</option>
            {functions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Add Button */}
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F40009] text-white rounded-lg text-sm font-medium hover:bg-[#DC0012] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Scenario
          </button>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span>
            <span className="font-semibold text-gray-900">{filteredScenarios.length}</span> of{' '}
            {scenarios.length} scenarios
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            {scenarios.filter((s) => s.active).length} active
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            {scenarios.filter((s) => s.flagship).length} flagship
          </span>
        </div>
      </div>

      {/* Scenarios List */}
      {filteredScenarios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No scenarios found</p>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-sm text-[#F40009] hover:underline mt-2">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
                    {scenario.flagship && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        Flagship
                      </span>
                    )}
                    {scenario.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                    {scenario.hidden && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                        <EyeOff className="w-3 h-3" />
                        Hidden
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{scenario.description}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">{scenario.id}</span>
                    <span className="text-gray-300">•</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        FUNCTION_COLORS[scenario.function] || FUNCTION_COLORS.Other
                      }`}
                    >
                      {scenario.function}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        DIFFICULTY_COLORS[scenario.difficulty] || DIFFICULTY_COLORS.Intermediate
                      }`}
                    >
                      {scenario.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{scenario.estimatedTime}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{scenario.steps.length} steps</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditingScenario(scenario)}
                    className="p-2 text-gray-400 hover:text-[#F40009] hover:bg-red-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(scenario.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {(editingScenario || isCreating) && (
        <ScenarioEditModal
          scenario={editingScenario}
          onClose={() => {
            setEditingScenario(null);
            setIsCreating(false);
          }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleteLoading) setDeletingId(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Scenario</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900">
                {scenarios.find((s) => s.id === deletingId)?.title}
              </span>
              ?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

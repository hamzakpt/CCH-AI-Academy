import { useEffect, useState } from 'react';
import {
  Lightbulb,
  Search,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  User,
  ChevronDown,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface Suggestion {
  id: number;
  username: string;
  suggestion: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  apiBase: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <Clock className="w-3.5 h-3.5" /> },
  reviewed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Eye className="w-3.5 h-3.5" /> },
  implemented: { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> },
};

export function SuggestionsPage({ apiBase }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Expanded suggestion for editing
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = filterStatus
        ? `${apiBase}/scenarios/suggestions?status=${filterStatus}`
        : `${apiBase}/scenarios/suggestions`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError('Failed to load suggestions');
      console.error('[SuggestionsPage]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [apiBase, filterStatus]);

  const handleExpand = (suggestion: Suggestion) => {
    if (expandedId === suggestion.id) {
      setExpandedId(null);
    } else {
      setExpandedId(suggestion.id);
      setEditingNotes(suggestion.adminNotes || '');
      setEditingStatus(suggestion.status);
    }
  };

  const handleSave = async (id: number) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${apiBase}/scenarios/suggestions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editingStatus, adminNotes: editingNotes }),
      });
      if (!res.ok) throw new Error(`Failed to save: ${res.status}`);
      await fetchSuggestions();
      setExpandedId(null);
    } catch (err) {
      console.error('[SuggestionsPage] Save error:', err);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${apiBase}/scenarios/suggestions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      setDeletingId(null);
    } catch (err) {
      console.error('[SuggestionsPage] Delete error:', err);
      alert('Failed to delete suggestion');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter suggestions
  const filteredSuggestions = suggestions.filter((s) => {
    const matchesSearch =
      searchQuery === '' ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.suggestion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const statusCounts = {
    pending: suggestions.filter((s) => s.status === 'pending').length,
    reviewed: suggestions.filter((s) => s.status === 'reviewed').length,
    implemented: suggestions.filter((s) => s.status === 'implemented').length,
    rejected: suggestions.filter((s) => s.status === 'rejected').length,
  };

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
        <button onClick={fetchSuggestions} className="ml-auto text-sm text-red-600 hover:underline">
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
              placeholder="Search suggestions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20 focus:border-[#F40009]"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F40009]/20 appearance-none pr-8 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="implemented">Implemented</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span>
            <span className="font-semibold text-gray-900">{filteredSuggestions.length}</span> of{' '}
            {suggestions.length} suggestions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-yellow-500" />
            {statusCounts.pending} pending
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            {statusCounts.reviewed} reviewed
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            {statusCounts.implemented} implemented
          </span>
        </div>
      </div>

      {/* Suggestions List */}
      {filteredSuggestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No suggestions found</p>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-sm text-[#F40009] hover:underline mt-2">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => handleExpand(suggestion)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[suggestion.status]?.bg || 'bg-gray-50'
                        } ${STATUS_COLORS[suggestion.status]?.text || 'text-gray-700'}`}
                      >
                        {STATUS_COLORS[suggestion.status]?.icon}
                        {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        {suggestion.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(suggestion.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-800 line-clamp-2">{suggestion.suggestion}</p>

                    {suggestion.adminNotes && (
                      <div className="mt-2 flex items-start gap-1 text-xs text-gray-500">
                        <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{suggestion.adminNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(suggestion.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Edit Panel */}
              {expandedId === suggestion.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Suggestion</label>
                      <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                        {suggestion.suggestion}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editingStatus}
                          onChange={(e) => setEditingStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="implemented">Implemented</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                        <input
                          type="text"
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          placeholder="Add notes..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F40009]/20"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setExpandedId(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(suggestion.id)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#F40009] hover:bg-[#DC0012] rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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
                <h3 className="font-semibold text-gray-900">Delete Suggestion</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this suggestion?
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

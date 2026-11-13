import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, FileText, Download, Trash2, AlertCircle } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { workspaceApi } from '../../api/workspaceApi';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function TripDocumentsPage() {
  const { trip, permissions } = useTrip();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const loadDocuments = useCallback(async () => {
    if (!trip?.id) return;
    try {
      setLoading(true);
      const data = await workspaceApi.getDocuments(trip.id);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [trip?.id]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      await workspaceApi.uploadDocument(trip.id, file);
      loadDocuments();
    } catch (err) {
      setError(err?.message || 'File upload failed. Check file type or size limits.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await workspaceApi.deleteDocument(trip.id, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert(err?.message || 'Failed to delete document.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Trip Documents & Tickets</h2>
          <p className="text-xs text-slate-500">
            Store flight tickets, hotel vouchers, permits, and IDs securely
          </p>
        </div>

        {permissions.canEdit && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-60"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">No documents uploaded yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Upload PDFs, images, or booking confirmations for everyone on the trip.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate" title={doc.originalFileName}>
                    {doc.originalFileName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(doc.fileSize)} •{' '}
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => workspaceApi.downloadDocument(trip.id, doc.id, doc.originalFileName)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                {permissions.canEdit && (
                  <button
                    onClick={() => handleDelete(doc.id, doc.originalFileName)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Download, Trash2, FolderOpen, HardDrive } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { workspaceApi } from '../../api/workspaceApi';
import AddDocumentModal from '../../features/documents/AddDocumentModal';

export default function TripDocumentsPage() {
  const { trip, members, permissions } = useTrip();
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadDocs = useCallback(async () => {
    if (!trip?.id) return;
    try {
      setLoading(true);
      const data = await workspaceApi.getDocuments(trip.id);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, [trip?.id]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const handleDownload = async (doc) => {
    try {
      setDownloadingId(doc.id);
      await workspaceApi.downloadDocument(trip.id, doc.id, doc.originalFileName);
    } catch (err) {
      alert(err?.message || 'Failed to download document.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Permanently delete this document?')) return;
    try {
      await workspaceApi.deleteDocument(trip.id, docId);
      loadDocs();
    } catch (err) {
      alert(err?.message || 'Only trip owner or uploader can delete this document.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileBadge = (contentType = '') => {
    if (contentType.includes('pdf')) return 'PDF';
    if (contentType.includes('image')) return 'IMAGE';
    if (contentType.includes('word')) return 'DOCX';
    if (contentType.includes('text')) return 'TXT';
    return 'FILE';
  };

  const getUploaderName = (uploadedById) => {
    const member = members.find((m) => m.userId === uploadedById);
    return member ? member.fullName : `User #${uploadedById}`;
  };

  if (loading) {
    return <div className="h-48 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">Trip Documents & Tickets</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Secure vault for flight tickets, hotel bookings, and travel permits
          </p>
        </div>
        {permissions.canEdit && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white">No documents uploaded yet</h3>
          <p className="text-sm text-slate-400 mt-1">
            Upload PDF tickets, hotel vouchers, or ID proofs for easy group access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const canDelete = permissions.isOwner || doc.uploadedById === user?.id;

            return (
              <div
                key={doc.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-indigo-500/40 p-5 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                      {getFileBadge(doc.contentType)}
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-slate-500 hover:text-rose-400 transition"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3
                    className="font-bold text-white mt-3 flex items-center gap-2"
                    title={doc.originalFileName}
                  >
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="truncate">{doc.originalFileName}</span>
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="inline-flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                      {formatFileSize(doc.fileSize)}
                    </span>
                    <span>•</span>
                    <span>By {getUploaderName(doc.uploadedById)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={downloadingId === doc.id}
                  onClick={() => handleDownload(doc)}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 hover:bg-indigo-500/25 rounded-xl transition disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingId === doc.id ? 'Downloading...' : 'Download File'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AddDocumentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tripId={trip.id}
        onAdded={loadDocs}
      />
    </div>
  );
}
import { useState, useRef } from 'react';
import { X, AlertCircle, UploadCloud, FileText } from 'lucide-react';
import { workspaceApi } from '../../api/workspaceApi';

const ALLOWED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx';

export default function AddDocumentModal({ isOpen, onClose, tripId, onAdded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileChange = (selected) => {
    setError('');
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    try {
      await workspaceApi.uploadDocument(tripId, file);
      setFile(null);
      onAdded();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to upload document. Check file type or size.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-slate-100">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Upload Trip Document</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileChange(e.dataTransfer.files?.[0]);
            }}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/70 rounded-2xl p-6 text-center cursor-pointer transition"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS}
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-white break-all">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{formatFileSize(file.size)}</p>
                <span className="text-[11px] text-indigo-400 mt-2 hover:underline">
                  Click to choose a different file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-white">
                  Click to browse or drag & drop file
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PDF, PNG, JPG, WEBP, TXT, DOC, DOCX (Max 10 MB)
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}